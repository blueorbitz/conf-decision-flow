/**
 * ActionNode Component (Read-Only Version for Issue Panel)
 * 
 * Represents an action node in the flow diagram view.
 * This is a read-only version used in the FlowDiagramView component.
 * 
 * Visual Design:
 * - Orange/red rounded rectangle with gear icon
 * - Displays action type and summary
 * - Shows action details in a readable format
 */

import { memo } from 'react';
import { Handle, Position } from '@xyflow/react';
import { token } from '@atlaskit/tokens';
import Lozenge from '@atlaskit/lozenge';
import { Text } from '@atlaskit/primitives';

function ActionNode({ data, isConnectable }) {
    const actionType = data.actionType || 'setField';
    const fieldKey = data.fieldKey || '';
    const fieldValue = data.fieldValue || '';
    const label = data.label || '';
    const comment = data.comment || '';

    const actionTypeLabels = {
        setField: 'Set Field',
        addLabel: 'Add Label',
        addComment: 'Add Comment'
    };

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
                cursor: 'default', // Changed from 'grab' to 'default' for read-only
            }}
        >
            {/* Target handle - not connectable in read-only mode */}
            <Handle
                type="target"
                position={Position.Top}
                id="target"
                isConnectable={false}
                style={{
                    background: token('color.background.inverse.subtle'),
                    border: `2px solid ${token('color.border.warning')}`,
                    width: '4px',
                    height: '4px',
                }}
            />

            {/* Node header */}
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

            {/* Additional details */}
            {actionType === 'setField' && fieldKey && (
                <Text size="small" opacity="0.8">Field: {fieldKey}</Text>
            )}

            {actionType === 'addComment' && comment && comment.length > 30 && (
                <Text size="small" opacity="0.8">{comment.length} characters</Text>
            )}

            {/* Source handle - not connectable in read-only mode */}
            <Handle
                type="source"
                position={Position.Bottom}
                id="source"
                isConnectable={false}
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

export default memo(ActionNode);
