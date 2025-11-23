/**
 * Date Expression Validator
 * 
 * This module provides comprehensive validation for date expressions with
 * detailed, user-friendly error messages. It validates format, units, functions,
 * and syntax to help users correct their input.
 */

import { parseDateExpression } from './dateExpressionParser.js';

/**
 * Validate a date expression with detailed error messages
 * @param {string} expression - The date expression to validate
 * @returns {Object} Validation result with structure:
 *   - valid: boolean
 *   - error: string (only if invalid)
 *   - errorType: string - category of error (only if invalid)
 */
export function validateDateExpressionDetailed(expression) {
    // Check for null or undefined
    if (expression === null || expression === undefined) {
        return {
            valid: false,
            error: 'Date expression is required',
            errorType: 'missing'
        };
    }

    // Check for non-string types
    if (typeof expression !== 'string') {
        return {
            valid: false,
            error: 'Date expression must be a string',
            errorType: 'type'
        };
    }

    // Check for empty string
    const trimmed = expression.trim();
    if (trimmed === '') {
        return {
            valid: false,
            error: 'Date expression cannot be empty',
            errorType: 'empty'
        };
    }

    // Try to parse the expression
    const parseResult = parseDateExpression(trimmed);
    
    if (parseResult.valid) {
        return { valid: true };
    }

    // Provide more specific error messages based on the input pattern
    return categorizeError(trimmed, parseResult.error);
}

/**
 * Categorize and enhance error messages based on the input pattern
 * @param {string} expression - The invalid expression
 * @param {string} baseError - The base error from the parser
 * @returns {Object} Enhanced error result
 */
function categorizeError(expression, baseError) {
    // Check if it looks like a relative expression with invalid unit
    const relativePattern = /^(\d+)([a-z]+)$/i;
    const relativeMatch = expression.match(relativePattern);
    
    if (relativeMatch) {
        const unit = relativeMatch[2];
        if (!['d', 'w', 'm', 'y'].includes(unit)) {
            return {
                valid: false,
                error: `Invalid unit '${unit}'. Supported units: d (days), w (weeks), m (months), y (years)`,
                errorType: 'invalid_unit'
            };
        }
    }

    // Check if it looks like a relative expression with non-numeric value
    const nonNumericPattern = /^([a-z]+)([dwmy])$/i;
    const nonNumericMatch = expression.match(nonNumericPattern);
    
    if (nonNumericMatch) {
        return {
            valid: false,
            error: `Invalid value '${nonNumericMatch[1]}'. The value must be a number (e.g., 7d, 2w)`,
            errorType: 'non_numeric'
        };
    }

    // Check if it looks like a function with typo or invalid name
    const functionPattern = /^([a-z]+)\(\)$/i;
    const functionMatch = expression.match(functionPattern);
    
    if (functionMatch) {
        const funcName = functionMatch[1].toLowerCase();
        const validFunctions = ['today', 'startofweek', 'endofweek', 'startofmonth', 'endofmonth', 'startofyear', 'endofyear'];
        
        return {
            valid: false,
            error: `Unknown date function '${funcName}()'. Supported functions: ${validFunctions.map(f => f + '()').join(', ')}`,
            errorType: 'invalid_function'
        };
    }

    // Check if it looks like a combined expression with syntax errors
    const combinedPattern = /([a-z]+)\(\)/i;
    const hasFunctionCall = expression.match(combinedPattern);
    
    if (hasFunctionCall) {
        // Check for missing operator
        if (!/[+\-]/.test(expression)) {
            return {
                valid: false,
                error: 'Invalid expression syntax. Combined expressions must use + or - operator (e.g., today() + 7d, startofweek() - 1d)',
                errorType: 'missing_operator'
            };
        }

        // Check for invalid operator placement or spacing issues
        const combinedRegex = /^([a-z]+)\(\)\s*([+\-])\s*(\d+)([dwmy])$/i;
        if (!expression.match(combinedRegex)) {
            return {
                valid: false,
                error: 'Invalid expression syntax. Use format: function() +/- {number}{unit} (e.g., today() + 7d)',
                errorType: 'invalid_syntax'
            };
        }
    }

    // Check if it contains numbers but no valid format
    if (/\d/.test(expression) && !/[dwmy]/i.test(expression)) {
        return {
            valid: false,
            error: 'Missing unit. Relative dates must include a unit: d (days), w (weeks), m (months), or y (years)',
            errorType: 'missing_unit'
        };
    }

    // Default to the base error from parser
    return {
        valid: false,
        error: baseError || 'Invalid date expression format. Use: {number}{unit}, function(), or function() +/- {number}{unit}',
        errorType: 'invalid_format'
    };
}

/**
 * Simple validation function (for backward compatibility)
 * @param {string} expression - The date expression to validate
 * @returns {Object} Validation result with valid and error properties
 */
export function validateDateExpression(expression) {
    const result = validateDateExpressionDetailed(expression);
    return {
        valid: result.valid,
        error: result.error
    };
}

/**
 * Get helpful suggestions for common errors
 * @param {string} expression - The invalid expression
 * @returns {Array<string>} Array of suggestion strings
 */
export function getSuggestions(expression) {
    const suggestions = [];
    
    if (!expression || expression.trim() === '') {
        suggestions.push('Try: 7d (7 days from now)');
        suggestions.push('Try: today() (current date)');
        suggestions.push('Try: startofweek() + 3d (3 days after start of week)');
        return suggestions;
    }

    const trimmed = expression.trim();

    // If it looks like a number without unit
    if (/^\d+$/.test(trimmed)) {
        suggestions.push(`Try: ${trimmed}d (${trimmed} days)`);
        suggestions.push(`Try: ${trimmed}w (${trimmed} weeks)`);
    }

    // If it looks like a function name without parentheses
    const validFunctions = ['today', 'startofweek', 'endofweek', 'startofmonth', 'endofmonth', 'startofyear', 'endofyear'];
    if (validFunctions.includes(trimmed.toLowerCase())) {
        suggestions.push(`Try: ${trimmed}() (add parentheses)`);
    }

    // If it contains a function but might have syntax issues
    if (/[a-z]+\(\)/i.test(trimmed) && !/^[a-z]+\(\)\s*[+\-]\s*\d+[dwmy]$/i.test(trimmed)) {
        suggestions.push('Try: today() + 7d');
        suggestions.push('Try: startofweek() - 1d');
    }

    return suggestions;
}
