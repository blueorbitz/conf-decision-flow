import { memo } from 'react';
import { Handle, Position } from '@xyflow/react';
import { token } from '@atlaskit/tokens';
import Lozenge from '@atlaskit/lozenge';
import { Text } from '@atlaskit/primitives';

/**
 * ActionNode Component
 * 
 * Represents an action node that performs operations on Jira issues.
 * When the flow execution reaches this node, it automatically executes
 * the configured action on the current issue.
 * 
 * Visual Design:
 * - Orange/red rounded rectangle with gear icon
 * - Displays action type and summary
 * - Shows action details in a readable format
 * 
 * Handles:
 * - One target handle at the top for incoming connections
 * - One source handle at the bottom (for chaining multiple actions or terminal node)
 * 
 * Features:
 * - Uses Atlaskit design tokens for consistent theming
 * - Supports both light and dark modes
 * - Displays action configuration in a readable format
 * - Executes automatically when reached during flow execution
 * 
 * Supported Action Types:
 * - setField: Update a Jira field with a specific value
 * - addLabel: Add a label to the Jira issue
 * - addComment: Add a comment to the Jira issue
 * 
 * @param {Object} data - Node data containing action configuration
 * @param {string} data.actionType - Type of action (setField, addLabel, addComment)
 * @param {string} data.fieldKey - Field key for setField action
 * @param {any} data.fieldValue - Field value for setField action
 * @param {string} data.label - Label text for addLabel action
 * @param {string} data.comment - Comment text for addComment action
 * @param {boolean} isConnectable - Whether the node can be connected to other nodes
 */
function ActionNode({ data, isConnectable }) {
    // Extract action configuration with defaults
    const actionType = data.actionType || 'setField';
    const fieldKey = data.fieldKey || '';
    const fieldValue = data.fieldValue || '';
    const label = data.label || '';
    const comment = data.comment || '';

    // Map action types to display labels
    const actionTypeLabels = {
        setField: 'Set Field',
        addLabel: 'Add Label',
        addComment: 'Add Comment'
    };

    // Build action summary text based on action type
    const actionSummary = () => {
        switch (actionType) {
            case 'setField':
                return fieldKey && fieldValue 
                    ? `Set ${fieldKey} to "${fieldValue}"`
                    : 'Configure field update';
            case 'addLabel':
                return label 
                    ? `Add label "${label}"`
                    : 'Configure label';
            case 'addComment':
                return comment 
                    ? `Add comment: "${comment.substring(0, 30)}${comment.length > 30 ? '...' : ''}"`
                    : 'Configure comment';
            default:
                return 'Configure action';
        }
    };

    return (
        <div
            style={{
                backgroundColor: token('color.background.warning'),
                color: token('color.text'),
                border: `2px solid ${token('color.border.warning')}`,
                borderRadius: '5%',
                padding: '8px',
                minWidth: '180px',
                maxWidth: '250px',
                boxShadow: token('elevation.shadow.raised'),
                cursor: 'grab',
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
                    border: `2px solid ${token('color.border.warning')}`,
                    width: '4px',
                    height: '4px',
                }}
            />

            {/* Node header with icon and type badge */}
            <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'space-between',
                marginBottom: '4px'
            }}>
                <Text size="medium">⚙️</Text>
                <Lozenge appearance="removed">
                    {actionTypeLabels[actionType]}
                </Lozenge>
            </div>

            {/* Action summary */}
            <div style={{
                wordWrap: 'break-word',
                lineHeight: '1.2'
            }}>
                <Text size="small">{actionSummary()}</Text>
            </div>

            {/* Additional details based on action type */}
            {actionType === 'setField' && fieldKey && (
                <Text size="small" opacity="0.8">Field: {fieldKey}</Text>
            )}

            {actionType === 'addComment' && comment && comment.length > 30 && (
                <Text size="small" opacity="0.8">{comment.length} characters</Text>
            )}

            {/* Source handle at the bottom for outgoing connections (optional chaining) */}
            <Handle
                type="source"
                position={Position.Bottom}
                id="source"
                isConnectable={isConnectable}
                style={{
                    background: token('color.background.inverse.subtle'),
                    border: `2px solid ${token('color.border.warning')}`,
                    width: '4px',
                    height: '4px',
                }}
            />
        </div>
    );
}

// Memoize the component to prevent unnecessary re-renders
// This is important for performance in large flows
export default memo(ActionNode);
