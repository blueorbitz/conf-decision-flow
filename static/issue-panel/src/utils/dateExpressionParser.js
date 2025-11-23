/**
 * Date Expression Parser
 * 
 * This module provides utilities for parsing and validating date expressions.
 * Date expressions can be in three formats:
 * 1. Relative: "{number}{unit}" (e.g., "7d", "2w", "3m", "1y")
 * 2. Function: "functionName()" (e.g., "today()", "startofweek()")
 * 3. Combined: "function() +/- {number}{unit}" (e.g., "today() + 7d", "startofweek() - 1d")
 */

// Valid units for relative date expressions
const VALID_UNITS = ['d', 'w', 'm', 'y'];

// Valid date functions
const VALID_FUNCTIONS = [
    'today',
    'startofweek',
    'endofweek',
    'startofmonth',
    'endofmonth',
    'startofyear',
    'endofyear'
];

/**
 * Parse a date expression string
 * @param {string} expression - The date expression to parse
 * @returns {Object} Parsed expression object with structure:
 *   - valid: boolean indicating if parsing was successful
 *   - type: 'relative' | 'function' | 'expression' (only if valid)
 *   - error: string error message (only if invalid)
 *   - parsed: Object containing parsed components (only if valid)
 */
export function parseDateExpression(expression) {
    // Validate input
    if (!expression || typeof expression !== 'string') {
        return {
            valid: false,
            error: 'Expression must be a non-empty string'
        };
    }

    // Trim whitespace
    const trimmed = expression.trim();

    if (trimmed === '') {
        return {
            valid: false,
            error: 'Expression cannot be empty'
        };
    }

    // Try to parse as a relative date expression (e.g., "7d", "2w")
    const relativeResult = parseRelativeExpression(trimmed);
    if (relativeResult.valid) {
        return relativeResult;
    }

    // Try to parse as a date function (e.g., "today()")
    const functionResult = parseFunctionExpression(trimmed);
    if (functionResult.valid) {
        return functionResult;
    }

    // Try to parse as a combined expression (e.g., "today() + 7d")
    const combinedResult = parseCombinedExpression(trimmed);
    if (combinedResult.valid) {
        return combinedResult;
    }

    // If none of the formats matched, return a generic error
    return {
        valid: false,
        error: 'Invalid date expression format. Use: {number}{unit}, function(), or function() +/- {number}{unit}'
    };
}

/**
 * Parse a relative date expression (e.g., "7d", "2w")
 * @param {string} expression - The expression to parse
 * @returns {Object} Parse result
 */
function parseRelativeExpression(expression) {
    // Regex to match: number followed by unit (d, w, m, y)
    const relativeRegex = /^(\d+)([dwmy])$/;
    const match = expression.match(relativeRegex);

    if (!match) {
        return { valid: false };
    }

    const value = parseInt(match[1], 10);
    const unit = match[2];

    // Validate unit
    if (!VALID_UNITS.includes(unit)) {
        return {
            valid: false,
            error: `Invalid unit '${unit}'. Supported units: d (days), w (weeks), m (months), y (years)`
        };
    }

    return {
        valid: true,
        type: 'relative',
        parsed: {
            value: value,
            unit: unit
        }
    };
}

/**
 * Parse a date function expression (e.g., "today()")
 * @param {string} expression - The expression to parse
 * @returns {Object} Parse result
 */
function parseFunctionExpression(expression) {
    // Regex to match: functionName()
    const functionRegex = /^([a-z]+)\(\)$/;
    const match = expression.match(functionRegex);

    if (!match) {
        return { valid: false };
    }

    const functionName = match[1];

    // Validate function name
    if (!VALID_FUNCTIONS.includes(functionName)) {
        return {
            valid: false,
            error: `Unknown date function '${functionName}()'. Supported: ${VALID_FUNCTIONS.map(f => f + '()').join(', ')}`
        };
    }

    return {
        valid: true,
        type: 'function',
        parsed: {
            function: functionName
        }
    };
}

/**
 * Parse a combined expression (e.g., "today() + 7d", "startofweek() - 1d")
 * @param {string} expression - The expression to parse
 * @returns {Object} Parse result
 */
function parseCombinedExpression(expression) {
    // Regex to match: function() +/- number unit
    // Allow optional spaces around the operator
    const combinedRegex = /^([a-z]+)\(\)\s*([+\-])\s*(\d+)([dwmy])$/;
    const match = expression.match(combinedRegex);

    if (!match) {
        return { valid: false };
    }

    const functionName = match[1];
    const operator = match[2];
    const value = parseInt(match[3], 10);
    const unit = match[4];

    // Validate function name
    if (!VALID_FUNCTIONS.includes(functionName)) {
        return {
            valid: false,
            error: `Unknown date function '${functionName}()'. Supported: ${VALID_FUNCTIONS.map(f => f + '()').join(', ')}`
        };
    }

    // Validate unit
    if (!VALID_UNITS.includes(unit)) {
        return {
            valid: false,
            error: `Invalid unit '${unit}'. Supported units: d (days), w (weeks), m (months), y (years)`
        };
    }

    return {
        valid: true,
        type: 'expression',
        parsed: {
            function: functionName,
            operator: operator,
            relative: {
                value: value,
                unit: unit
            }
        }
    };
}

/**
 * Validate a date expression and return detailed error messages
 * @param {string} expression - The date expression to validate
 * @returns {Object} Validation result with structure:
 *   - valid: boolean
 *   - error: string (only if invalid)
 */
export function validateDateExpression(expression) {
    const result = parseDateExpression(expression);
    
    if (result.valid) {
        return { valid: true };
    }
    
    return {
        valid: false,
        error: result.error
    };
}
