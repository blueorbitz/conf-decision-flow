import { memo } from 'react';
import { Handle, Position } from '@xyflow/react';
import { token } from '@atlaskit/tokens';
import { Text } from '@atlaskit/primitives';

/**
 * LogicNode Component
 * 
 * Represents a conditional logic node that evaluates Jira field values.
 * This node automatically evaluates conditions during flow execution and
 * directs the flow down different paths based on the result.
 * 
 * Visual Design:
 * - Purple diamond shape with lightning bolt icon
 * - Displays condition summary (e.g., "status equals Done")
 * - Two source handles for true/false paths
 * 
 * Handles:
 * - One target handle at the top for incoming connections
 * - Two source handles: left for "false" path, right for "true" path
 * 
 * Features:
 * - Uses Atlaskit design tokens for consistent theming
 * - Supports both light and dark modes
 * - Displays condition in human-readable format
 * - Automatic evaluation during flow execution
 * 
 * Supported Operators:
 * - equals: Field value equals expected value
 * - notEquals: Field value does not equal expected value
 * - contains: Field value contains expected value (for strings)
 * - greaterThan: Field value is greater than expected value (for numbers)
 * - lessThan: Field value is less than expected value (for numbers)
 * - isEmpty: Field value is empty or null
 * - isNotEmpty: Field value is not empty or null
 * 
 * @param {Object} data - Node data containing logic configuration
 * @param {string} data.fieldKey - Jira field key to evaluate (e.g., 'status', 'priority')
 * @param {string} data.operator - Comparison operator
 * @param {any} data.expectedValue - Value to compare against
 * @param {boolean} isConnectable - Whether the node can be connected to other nodes
 */
function LogicNode({ data, isConnectable }) {
    // Extract logic configuration with defaults
    const fieldKey = data.fieldKey || 'field';
    const operator = data.operator || 'equals';
    const expectedValue = data.expectedValue || '';

    // Map operators to human-readable labels
    const operatorLabels = {
        equals: '=',
        notEquals: '≠',
        contains: 'contains',
        greaterThan: '>',
        lessThan: '<',
        isEmpty: 'is empty',
        isNotEmpty: 'is not empty'
    };

    // Build condition summary text
    const conditionSummary = () => {
        if (operator === 'isEmpty' || operator === 'isNotEmpty') {
            return `${fieldKey} ${operatorLabels[operator]}`;
        }
        return `${fieldKey} ${operatorLabels[operator]} ${expectedValue}`;
    };

    return (
        <div
            style={{
                backgroundColor: token('color.background.discovery'),
                border: `1px solid ${token('color.border.discovery')}`,
                borderRadius: '5%',
                padding: '8px',
                minWidth: '180px',
                maxWidth: '250px',
                boxShadow: token('elevation.shadow.raised'),
                cursor: 'grab',
                // // Diamond shape effect using transform
                // clipPath: 'polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)',
                // minHeight: '80px',
                // display: 'flex',
                // alignItems: 'center',
                // justifyContent: 'center',
            }}
        >
            {/* Target handle at the top for incoming connections */}
            <Handle
                type="target"
                position={Position.Top}
                id="target"
                isConnectable={isConnectable}
                style={{
                    background: token('color.background.inverse.subtle'),
                    border: `2px solid ${token('color.border.discovery')}`,
                    width: '4px',
                    height: '4px',
                }}
            />

            {/* Content container (needs to be inside the diamond) */}
            
            <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: '4px'
            }}>
                <div style={{ marginRight: '8px' }}>
                    <Text size="small" weight="bold">⚡ Logic</Text>
                </div>
            </div>

            {/* Condition summary */}
            <div style={{
                wordWrap: 'break-word',
                lineHeight: '1.2'
            }}>
                <Text size="small">{conditionSummary()}</Text>
            </div>

            {/* Source handle on the LEFT for FALSE path */}
            <Handle
                type="source"
                position={Position.Bottom}
                id="false"
                isConnectable={isConnectable}
                style={{
                    background: token('color.background.danger.bold'),
                    border: `2px solid ${token('color.border.danger')}`,
                    width: '4px',
                    height: '4px',
                    left: '30%',
                }}
            />

            {/* Label for false handle */}
            <div style={{
                position: 'absolute',
                left: '35%',
                top: '100%',
                transform: 'translateY(5%)',
                fontSize: '10px',
                fontWeight: 'bold',
                color: token('color.text.danger'),
                backgroundColor: token('elevation.surface'),
                padding: '0px 4px',
                borderRadius: '3px',
                border: `1px solid ${token('color.border.danger')}`,
            }}>
                false
            </div>

            {/* Source handle on the RIGHT for TRUE path */}
            <Handle
                type="source"
                position={Position.Bottom}
                id="true"
                isConnectable={isConnectable}
                style={{
                    background: token('color.background.success.bold'),
                    border: `2px solid ${token('color.border.success')}`,
                    width: '4px',
                    height: '4px',
                    left: '70%',
                }}
            />

            {/* Label for true handle */}
            <div style={{
                position: 'absolute',
                left: '75%',
                top: '100%',
                transform: 'translateY(5%)',
                fontSize: '10px',
                fontWeight: 'bold',
                color: token('color.text.success'),
                backgroundColor: token('elevation.surface'),
                padding: '0px 4px',
                borderRadius: '3px',
                border: `1px solid ${token('color.border.success')}`,
            }}>
                true
            </div>
        </div>
    );
}

// Memoize the component to prevent unnecessary re-renders
// This is important for performance in large flows
export default memo(LogicNode);
