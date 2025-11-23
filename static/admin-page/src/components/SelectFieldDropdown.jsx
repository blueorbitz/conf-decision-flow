/**
 * SelectFieldDropdown Component
 * 
 * A reusable component for rendering a dropdown for Jira select fields.
 * This component:
 * - Fetches field options from Jira using the field metadata fetcher
 * - Shows a loading spinner while fetching options
 * - Displays error messages and falls back to text input on failure
 * - Renders a Select component with the fetched options
 * 
 * This component is designed to be used in the Node Properties Panel
 * for Action nodes that need to set select field values.
 */

import { useState, useEffect } from 'react';
import Select from '@atlaskit/select';
import Textfield from '@atlaskit/textfield';
import Spinner from '@atlaskit/spinner';
import { Box, Inline, Stack } from '@atlaskit/primitives';
import { getFieldMetadata } from '../utils/fieldMetadata.js';

/**
 * SelectFieldDropdown Component
 * 
 * @param {Object} props - Component props
 * @param {string} props.fieldKey - The Jira field key to fetch options for
 * @param {string} [props.projectKey] - The project key for context (optional)
 * @param {string} props.value - Current selected value
 * @param {Function} props.onChange - Callback when value changes (receives new value string)
 * @param {string} [props.label] - Label for the dropdown
 * @param {string} [props.placeholder] - Placeholder text
 * @param {boolean} [props.isRequired] - Whether the field is required
 * @param {string} [props.testId] - Test ID for testing
 */
export default function SelectFieldDropdown({
    fieldKey,
    projectKey = 'default',
    value = '',
    onChange,
    label = 'Select Value',
    placeholder = 'Select an option',
    isRequired = false,
    testId = 'select-field-dropdown'
}) {
    // Loading state
    const [isLoading, setIsLoading] = useState(false);
    
    // Options state
    const [options, setOptions] = useState([]);
    
    // Error state
    const [error, setError] = useState(null);
    
    // Fallback to text input on error
    const [useFallback, setUseFallback] = useState(false);

    /**
     * Fetch field metadata and options when fieldKey changes
     */
    useEffect(() => {
        // Reset state when fieldKey changes
        setIsLoading(true);
        setError(null);
        setUseFallback(false);
        setOptions([]);

        // Don't fetch if no fieldKey provided
        if (!fieldKey || fieldKey.trim() === '') {
            setIsLoading(false);
            return;
        }

        // Fetch field metadata
        const fetchOptions = async () => {
            try {
                console.log(`[SelectFieldDropdown] Fetching options for field: ${fieldKey}`);
                
                const metadata = await getFieldMetadata(fieldKey, projectKey);
                
                // Check if there was an error fetching metadata
                if (metadata.error) {
                    throw new Error(metadata.error);
                }

                // Check if this is actually a select field
                if (metadata.fieldType !== 'select' && metadata.fieldType !== 'multiselect') {
                    console.warn(`[SelectFieldDropdown] Field ${fieldKey} is not a select field (type: ${metadata.fieldType})`);
                    // Not a select field, but don't show error - just use text input
                    setUseFallback(true);
                    setIsLoading(false);
                    return;
                }

                // Check if options are available
                if (!metadata.options || metadata.options.length === 0) {
                    console.warn(`[SelectFieldDropdown] No options found for field ${fieldKey}`);
                    setError('No options available for this field');
                    setUseFallback(true);
                    setIsLoading(false);
                    return;
                }

                // Set options
                console.log(`[SelectFieldDropdown] Loaded ${metadata.options.length} options for ${fieldKey}`);
                setOptions(metadata.options);
                setIsLoading(false);

            } catch (err) {
                console.error(`[SelectFieldDropdown] Error fetching options for ${fieldKey}:`, err);
                setError(err.message || 'Failed to fetch field options');
                setUseFallback(true);
                setIsLoading(false);
            }
        };

        fetchOptions();
    }, [fieldKey, projectKey]);

    /**
     * Handle dropdown selection change
     */
    const handleSelectChange = (selectedOption) => {
        if (onChange) {
            // Pass the value (or empty string if cleared)
            onChange(selectedOption ? selectedOption.value : '');
        }
    };

    /**
     * Handle text input change (fallback mode)
     */
    const handleTextChange = (e) => {
        if (onChange) {
            onChange(e.target.value);
        }
    };

    /**
     * Get the currently selected option object from the value
     */
    const getSelectedOption = () => {
        if (!value || options.length === 0) {
            return null;
        }
        return options.find(opt => opt.value === value) || null;
    };

    // If loading, show spinner
    if (isLoading) {
        return (
            <Stack space="space.100">
                <Inline space="space.100" alignBlock="center">
                    <Spinner size="small" />
                    <Box
                        style={{
                            fontSize: '12px',
                            color: '#626F86'
                        }}
                    >
                        Loading field options...
                    </Box>
                </Inline>
            </Stack>
        );
    }

    // If error or fallback, show text input with error message
    if (useFallback || error) {
        return (
            <Stack space="space.100">
                {/* Error message */}
                {error && (
                    <Box
                        paddingBlock="space.050"
                        paddingInline="space.100"
                        style={{
                            color: '#AE2A19',
                            fontSize: '12px',
                            lineHeight: '16px',
                            backgroundColor: '#FFEBE6',
                            borderRadius: '3px'
                        }}
                        testId={`${testId}-error`}
                    >
                        {error}
                    </Box>
                )}

                {/* Fallback text input */}
                <Textfield
                    name={testId}
                    value={value}
                    onChange={handleTextChange}
                    placeholder={placeholder}
                    isRequired={isRequired}
                    testId={`${testId}-fallback`}
                    aria-label={label}
                />

                {/* Helper text */}
                <Box
                    style={{
                        fontSize: '11px',
                        color: '#626F86'
                    }}
                >
                    Using text input as fallback
                </Box>
            </Stack>
        );
    }

    // Render select dropdown with options
    return (
        <Stack space="space.100">
            <Select
                inputId={testId}
                options={options}
                value={getSelectedOption()}
                onChange={handleSelectChange}
                placeholder={placeholder}
                isClearable={!isRequired}
                isSearchable={true}
                testId={testId}
                aria-label={label}
            />

            {/* Helper text showing number of options */}
            {options.length > 0 && (
                <Box
                    style={{
                        fontSize: '11px',
                        color: '#626F86'
                    }}
                >
                    {options.length} option{options.length !== 1 ? 's' : ''} available
                </Box>
            )}
        </Stack>
    );
}
