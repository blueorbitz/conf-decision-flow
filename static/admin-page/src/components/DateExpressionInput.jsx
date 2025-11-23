/**
 * DateExpressionInput Component
 * 
 * A reusable component for date expression input with real-time validation and preview.
 * This component provides:
 * - Text input for date expressions
 * - Real-time validation with debouncing (300ms)
 * - Inline error messages for invalid expressions
 * - Preview of the evaluated date for valid expressions
 * - Success indicator when expression is valid
 * 
 * Supports three date expression formats:
 * 1. Relative: "7d", "2w", "3m", "1y"
 * 2. Functions: "today()", "startofweek()", "endofweek()", etc.
 * 3. Combined: "today() + 7d", "startofweek() - 1d"
 */

import { useState, useEffect, useCallback } from 'react';
import Textfield from '@atlaskit/textfield';
import { Box, Inline, Stack } from '@atlaskit/primitives';
import { validateDateExpressionDetailed } from '../utils/dateExpressionValidator.js';
import { evaluateDateExpression } from '../utils/dateExpressionEvaluator.js';

/**
 * DateExpressionInput Component
 * 
 * @param {Object} props - Component props
 * @param {string} props.value - Current value of the date expression
 * @param {Function} props.onChange - Callback when value changes (receives new value string)
 * @param {string} [props.label] - Label for the input field
 * @param {string} [props.placeholder] - Placeholder text
 * @param {boolean} [props.isRequired] - Whether the field is required
 * @param {string} [props.testId] - Test ID for testing
 */
export default function DateExpressionInput({
    value = '',
    onChange,
    label = 'Date Expression',
    placeholder = 'e.g., 7d, today(), startofweek() + 3d',
    isRequired = false,
    testId = 'date-expression-input'
}) {
    // Local state for the input value (for debouncing)
    const [localValue, setLocalValue] = useState(value);
    
    // Validation state
    const [validationResult, setValidationResult] = useState({ valid: true });
    
    // Preview state
    const [previewDate, setPreviewDate] = useState(null);
    
    // Debounce timer ref
    const [debounceTimer, setDebounceTimer] = useState(null);

    // Update local value when prop value changes
    useEffect(() => {
        setLocalValue(value);
    }, [value]);

    /**
     * Validate and evaluate the date expression
     * This function is debounced to avoid excessive calculations
     */
    const validateAndPreview = useCallback((expression) => {
        // If empty and not required, clear validation and preview
        if (!expression || expression.trim() === '') {
            if (!isRequired) {
                setValidationResult({ valid: true });
                setPreviewDate(null);
                return;
            } else {
                setValidationResult({
                    valid: false,
                    error: 'Date expression is required',
                    errorType: 'empty'
                });
                setPreviewDate(null);
                return;
            }
        }

        // Validate the expression
        const validation = validateDateExpressionDetailed(expression);
        setValidationResult(validation);

        // If valid, evaluate and show preview
        if (validation.valid) {
            try {
                const evaluatedDate = evaluateDateExpression(expression);
                setPreviewDate(evaluatedDate);
            } catch (error) {
                // If evaluation fails, show error
                setValidationResult({
                    valid: false,
                    error: error.message || 'Failed to evaluate date expression',
                    errorType: 'evaluation_error'
                });
                setPreviewDate(null);
            }
        } else {
            setPreviewDate(null);
        }
    }, [isRequired]);

    /**
     * Handle input change with debouncing
     */
    const handleInputChange = (e) => {
        const newValue = e.target.value;
        setLocalValue(newValue);

        // Clear existing timer
        if (debounceTimer) {
            clearTimeout(debounceTimer);
        }

        // Set new timer for validation (300ms debounce)
        const timer = setTimeout(() => {
            validateAndPreview(newValue);
            // Call parent onChange after validation
            if (onChange) {
                onChange(newValue);
            }
        }, 300);

        setDebounceTimer(timer);
    };

    /**
     * Format date for preview display
     */
    const formatPreviewDate = (date) => {
        if (!date) return '';
        
        // Format as YYYY-MM-DD for consistency with Jira date fields
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        
        return `${year}-${month}-${day}`;
    };

    /**
     * Get the appropriate appearance for the text field based on validation
     */
    const getFieldAppearance = () => {
        if (!localValue || localValue.trim() === '') {
            return 'standard';
        }
        return validationResult.valid ? 'standard' : 'standard';
    };

    // Cleanup debounce timer on unmount
    useEffect(() => {
        return () => {
            if (debounceTimer) {
                clearTimeout(debounceTimer);
            }
        };
    }, [debounceTimer]);

    return (
        <Stack space="space.100">
            {/* Input field */}
            <Textfield
                name={testId}
                value={localValue}
                onChange={handleInputChange}
                placeholder={placeholder}
                appearance={getFieldAppearance()}
                isRequired={isRequired}
                testId={testId}
                aria-label={label}
            />

            {/* Validation error message */}
            {!validationResult.valid && validationResult.error && (
                <Box
                    paddingBlock="space.050"
                    paddingInline="space.100"
                    style={{
                        color: '#AE2A19',
                        fontSize: '12px',
                        lineHeight: '16px'
                    }}
                    testId={`${testId}-error`}
                >
                    {validationResult.error}
                </Box>
            )}

            {/* Preview of evaluated date */}
            {validationResult.valid && previewDate && localValue && localValue.trim() !== '' && (
                <Inline space="space.100" alignBlock="center">
                    <Box
                        paddingBlock="space.050"
                        paddingInline="space.100"
                        style={{
                            color: '#0052CC',
                            fontSize: '12px',
                            lineHeight: '16px',
                            backgroundColor: '#DEEBFF',
                            borderRadius: '3px',
                            display: 'inline-block'
                        }}
                        testId={`${testId}-preview`}
                    >
                        Preview: {formatPreviewDate(previewDate)}
                    </Box>
                </Inline>
            )}

            {/* Success indicator for valid expressions (without preview) */}
            {validationResult.valid && !previewDate && localValue && localValue.trim() !== '' && (
                <Box
                    paddingBlock="space.050"
                    paddingInline="space.100"
                    style={{
                        color: '#006644',
                        fontSize: '12px',
                        lineHeight: '16px'
                    }}
                    testId={`${testId}-success`}
                >
                    ✓ Valid date expression
                </Box>
            )}
        </Stack>
    );
}
