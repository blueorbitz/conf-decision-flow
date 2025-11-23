/**
 * Date Expression Evaluator
 * 
 * This module provides utilities for evaluating date expressions to absolute dates.
 * It works in conjunction with the dateExpressionParser to convert parsed expressions
 * into concrete Date objects.
 */

import { parseDateExpression } from './dateExpressionParser.js';

/**
 * Evaluate a date expression to an absolute date
 * @param {string} expression - The date expression to evaluate
 * @param {Date} baseDate - Optional base date (defaults to current date/time)
 * @returns {Date} The evaluated date
 * @throws {Error} If the expression is invalid
 */
export function evaluateDateExpression(expression, baseDate = new Date()) {
    // Parse the expression
    const parseResult = parseDateExpression(expression);
    
    if (!parseResult.valid) {
        throw new Error(parseResult.error || 'Invalid date expression');
    }

    // Evaluate based on type
    switch (parseResult.type) {
        case 'relative':
            return evaluateRelativeDate(
                parseResult.parsed.value,
                parseResult.parsed.unit,
                baseDate
            );
        
        case 'function':
            return evaluateDateFunction(parseResult.parsed.function, baseDate);
        
        case 'expression':
            // First evaluate the function
            const functionResult = evaluateDateFunction(
                parseResult.parsed.function,
                baseDate
            );
            
            // Then apply the relative offset
            const offset = parseResult.parsed.relative;
            const relativeResult = evaluateRelativeDate(
                offset.value,
                offset.unit,
                functionResult
            );
            
            // Apply the operator (+ or -)
            if (parseResult.parsed.operator === '-') {
                // For subtraction, we need to go backwards
                // We already added, so subtract twice the amount
                const doubleOffset = evaluateRelativeDate(
                    offset.value * 2,
                    offset.unit,
                    functionResult
                );
                return new Date(functionResult.getTime() - (doubleOffset.getTime() - functionResult.getTime()));
            }
            
            return relativeResult;
        
        default:
            throw new Error(`Unknown expression type: ${parseResult.type}`);
    }
}

/**
 * Evaluate a relative date expression
 * @param {number} value - The numeric value (e.g., 7 for "7d")
 * @param {string} unit - The unit ('d', 'w', 'm', 'y')
 * @param {Date} baseDate - The base date to calculate from
 * @returns {Date} The calculated date
 */
export function evaluateRelativeDate(value, unit, baseDate = new Date()) {
    // Create a new Date object to avoid mutating the input
    const result = new Date(baseDate);
    
    switch (unit) {
        case 'd': // days
            result.setDate(result.getDate() + value);
            break;
        
        case 'w': // weeks (7 days)
            result.setDate(result.getDate() + (value * 7));
            break;
        
        case 'm': // months
            result.setMonth(result.getMonth() + value);
            break;
        
        case 'y': // years
            result.setFullYear(result.getFullYear() + value);
            break;
        
        default:
            throw new Error(`Invalid unit: ${unit}`);
    }
    
    return result;
}

/**
 * Evaluate a date function
 * @param {string} functionName - The function name (e.g., 'today', 'startofweek')
 * @param {Date} baseDate - The base date for calculation
 * @returns {Date} The calculated date
 */
export function evaluateDateFunction(functionName, baseDate = new Date()) {
    // Create a new Date object to avoid mutating the input
    const result = new Date(baseDate);
    
    switch (functionName) {
        case 'today':
            // Return the current date at midnight (00:00:00)
            result.setHours(0, 0, 0, 0);
            return result;
        
        case 'startofweek':
            // Return the first day of the current week (Monday)
            return getStartOfWeek(result);
        
        case 'endofweek':
            // Return the last day of the current week (Sunday)
            return getEndOfWeek(result);
        
        case 'startofmonth':
            // Return the first day of the current month
            return getStartOfMonth(result);
        
        case 'endofmonth':
            // Return the last day of the current month
            return getEndOfMonth(result);
        
        case 'startofyear':
            // Return the first day of the current year (January 1)
            return getStartOfYear(result);
        
        case 'endofyear':
            // Return the last day of the current year (December 31)
            return getEndOfYear(result);
        
        default:
            throw new Error(`Unknown date function: ${functionName}`);
    }
}

/**
 * Get the start of the week (Monday) for a given date
 * @param {Date} date - The input date
 * @returns {Date} The start of the week
 */
function getStartOfWeek(date) {
    const result = new Date(date);
    const day = result.getDay(); // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
    
    // Calculate the difference to Monday
    // If Sunday (0), go back 6 days; otherwise go back (day - 1) days
    const diff = day === 0 ? -6 : 1 - day;
    
    result.setDate(result.getDate() + diff);
    result.setHours(0, 0, 0, 0);
    
    return result;
}

/**
 * Get the end of the week (Sunday) for a given date
 * @param {Date} date - The input date
 * @returns {Date} The end of the week
 */
function getEndOfWeek(date) {
    const result = new Date(date);
    const day = result.getDay(); // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
    
    // Calculate the difference to Sunday
    // If Sunday (0), stay; otherwise go forward (7 - day) days
    const diff = day === 0 ? 0 : 7 - day;
    
    result.setDate(result.getDate() + diff);
    result.setHours(23, 59, 59, 999);
    
    return result;
}

/**
 * Get the start of the month for a given date
 * @param {Date} date - The input date
 * @returns {Date} The start of the month
 */
function getStartOfMonth(date) {
    const result = new Date(date);
    result.setDate(1);
    result.setHours(0, 0, 0, 0);
    return result;
}

/**
 * Get the end of the month for a given date
 * @param {Date} date - The input date
 * @returns {Date} The end of the month
 */
function getEndOfMonth(date) {
    const result = new Date(date);
    // Set to the first day of next month, then subtract one day
    result.setMonth(result.getMonth() + 1);
    result.setDate(0); // Day 0 of a month is the last day of the previous month
    result.setHours(23, 59, 59, 999);
    return result;
}

/**
 * Get the start of the year for a given date
 * @param {Date} date - The input date
 * @returns {Date} The start of the year (January 1)
 */
function getStartOfYear(date) {
    const result = new Date(date);
    result.setMonth(0); // January
    result.setDate(1);
    result.setHours(0, 0, 0, 0);
    return result;
}

/**
 * Get the end of the year for a given date
 * @param {Date} date - The input date
 * @returns {Date} The end of the year (December 31)
 */
function getEndOfYear(date) {
    const result = new Date(date);
    result.setMonth(11); // December
    result.setDate(31);
    result.setHours(23, 59, 59, 999);
    return result;
}
