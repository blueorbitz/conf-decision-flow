/**
 * Field Metadata Fetcher Utility
 * 
 * This utility fetches Jira field metadata using the Forge Bridge API.
 * It detects field types (date, select, text, number, etc.) and fetches
 * select field options. Includes caching to minimize API calls.
 */

import { invoke, requestJira } from '@forge/bridge';

// In-memory cache for field metadata
// Structure: { 'field-metadata:{projectKey}:{fieldKey}': { data: {...}, timestamp: number } }
const fieldMetadataCache = {};

// Cache TTL in milliseconds (5 minutes)
const CACHE_TTL = 5 * 60 * 1000;

/**
 * Get metadata for a Jira field
 * 
 * @param {string} fieldKey - The Jira field key (e.g., 'duedate', 'priority')
 * @param {string} projectKey - The project key for context (optional, used for caching)
 * @returns {Promise<Object>} Field metadata object
 * 
 * Returns:
 * {
 *   fieldKey: string,
 *   fieldType: 'date'|'select'|'text'|'number'|'user'|'multiselect'|'unknown',
 *   name: string,
 *   options?: Array<{ value: string, label: string }>,
 *   error?: string
 * }
 */
export async function getFieldMetadata(fieldKey, projectKey = 'default') {
  // Check cache first
  const cacheKey = `field-metadata:${projectKey}:${fieldKey}`;
  const cachedData = getCachedMetadata(cacheKey);
  
  if (cachedData) {
    console.log(`[FieldMetadata] Cache hit for ${fieldKey}`);
    return cachedData;
  }

  console.log(`[FieldMetadata] Fetching metadata for ${fieldKey}`);

  try {
    // Call Jira REST API to fetch all field definitions
    const response = await requestJira('/rest/api/3/field', {
      headers: {
        'Accept': 'application/json'
      }
    });

    // Parse the response
    const fields = await response.json();
    
    // Find the specific field we're looking for
    const field = fields.find(f => f.key === fieldKey || f.id === fieldKey);
    
    if (!field) {
      const errorResult = {
        fieldKey,
        fieldType: 'unknown',
        name: fieldKey,
        error: `Field '${fieldKey}' not found in project`
      };
      
      // Cache error results too (with shorter TTL)
      setCachedMetadata(cacheKey, errorResult);
      return errorResult;
    }

    // Parse field schema to determine field type
    const fieldType = determineFieldType(field);
    
    // Build metadata object
    const metadata = {
      fieldKey: field.key || field.id,
      fieldType,
      name: field.name,
    };

    // For select fields, fetch available options
    if (fieldType === 'select' || fieldType === 'multiselect') {
      metadata.options = extractSelectOptions(field);
    }

    // Cache the result
    setCachedMetadata(cacheKey, metadata);
    
    console.log(`[FieldMetadata] Successfully fetched metadata for ${fieldKey}:`, metadata);
    return metadata;

  } catch (error) {
    console.error(`[FieldMetadata] Error fetching metadata for ${fieldKey}:`, error);
    
    const errorResult = {
      fieldKey,
      fieldType: 'unknown',
      name: fieldKey,
      error: `Failed to fetch field metadata: ${error.message}`
    };
    
    return errorResult;
  }
}

/**
 * Determine the field type from the field schema
 * 
 * @param {Object} field - The field object from Jira API
 * @returns {string} The field type
 */
function determineFieldType(field) {
  // Check if field has a schema property
  if (!field.schema) {
    return 'unknown';
  }

  const schema = field.schema;
  
  // Map Jira schema types to our simplified types
  switch (schema.type) {
    case 'date':
      return 'date';
    
    case 'datetime':
      return 'date'; // Treat datetime as date for our purposes
    
    case 'option':
      return 'select';
    
    case 'array':
      // Array types can be multiselect, labels, etc.
      if (schema.items === 'option') {
        return 'multiselect';
      }
      if (schema.items === 'string') {
        return 'array';
      }
      return 'array';
    
    case 'string':
      return 'text';
    
    case 'number':
      return 'number';
    
    case 'user':
      return 'user';
    
    case 'priority':
      return 'select'; // Priority is essentially a select field
    
    case 'issuetype':
      return 'select';
    
    case 'project':
      return 'select';
    
    default:
      return 'unknown';
  }
}

/**
 * Extract select field options from field configuration
 * 
 * @param {Object} field - The field object from Jira API
 * @returns {Array<Object>} Array of options with value and label
 */
function extractSelectOptions(field) {
  const options = [];

  // Check if field has allowedValues (common for select fields)
  if (field.allowedValues && Array.isArray(field.allowedValues)) {
    return field.allowedValues.map(option => ({
      value: option.id || option.value || option.name,
      label: option.name || option.value
    }));
  }

  // For some fields, options might be in schema.configuration
  if (field.schema && field.schema.configuration) {
    const config = field.schema.configuration;
    
    if (config.options && Array.isArray(config.options)) {
      return config.options.map(option => ({
        value: option.id || option.value,
        label: option.value || option.label
      }));
    }
  }

  // If no options found, return empty array
  // The caller should handle fetching options via a different API if needed
  return options;
}

/**
 * Get cached metadata if available and not expired
 * 
 * @param {string} cacheKey - The cache key
 * @returns {Object|null} Cached metadata or null if not found/expired
 */
function getCachedMetadata(cacheKey) {
  const cached = fieldMetadataCache[cacheKey];
  
  if (!cached) {
    return null;
  }

  const now = Date.now();
  const age = now - cached.timestamp;
  
  // Check if cache entry has expired
  if (age > CACHE_TTL) {
    // Remove expired entry
    delete fieldMetadataCache[cacheKey];
    return null;
  }

  return cached.data;
}

/**
 * Store metadata in cache
 * 
 * @param {string} cacheKey - The cache key
 * @param {Object} data - The metadata to cache
 */
function setCachedMetadata(cacheKey, data) {
  fieldMetadataCache[cacheKey] = {
    data,
    timestamp: Date.now()
  };
}

/**
 * Clear all cached metadata (useful for testing or manual refresh)
 */
export function clearFieldMetadataCache() {
  Object.keys(fieldMetadataCache).forEach(key => {
    delete fieldMetadataCache[key];
  });
  console.log('[FieldMetadata] Cache cleared');
}

/**
 * Clear cached metadata for a specific field
 * 
 * @param {string} fieldKey - The field key
 * @param {string} projectKey - The project key
 */
export function clearFieldCache(fieldKey, projectKey = 'default') {
  const cacheKey = `field-metadata:${projectKey}:${fieldKey}`;
  delete fieldMetadataCache[cacheKey];
  console.log(`[FieldMetadata] Cleared cache for ${fieldKey}`);
}
