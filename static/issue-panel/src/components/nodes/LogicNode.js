/**
 * LogicNode Component (Read-Only Version for Issue Panel)
 * 
 * Represents a conditional logic node in the flow diagram view.
 * This is a read-only version used in the FlowDiagramView component.
 * 
 * Visual Design:
 * - Purple diamond shape with lightning bolt icon
 * - Displays condition summary
 * - Two source handles for true/false paths
 */

import { memo } from 'react';
import { Handle, Position } from '@xyflow/react';
import { token } from '@atlaskit/tokens';
import { Text } from '@atlaskit/primitives';

function LogicNode({ data, isConnectable }) {
    const fieldKey = data.fieldKey || 'field';
    const operator = data.operator || 'equals';
    const expectedValue = data.expectedValue || '';

    const operatorLabels = {
        equals: '=',
        notEquals: '≠',
        contains: 'contains',
        greaterThan: '>',
        lessThan: '<',
        isEmpty: 'is empty',
        isNotEmpty: 'is not empty'
    };

    const valueSource = data.valueSource || 'static';
    const questionNodeId = data.questionNodeId;

    const conditionSummary = () => {
        if (operator === 'isEmpty' || operator === 'isNotEmpty') {
            return `${fieldKey} ${operatorLabels[operator]}`;
        }
        
        if (valueSource === 'question' && questionNodeId) {
            return `${fieldKey} ${operatorLabels[operator]} [Answer from Question]`;
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
                    border: `2px solid ${token('color.border.discovery')}`,
                    width: '4px',
                    height: '4px',
                }}
            />

            {/* Header */}
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

            {/* FALSE handle - not connectable in read-only mode */}
            <Handle
                type="source"
                position={Position.Bottom}
                id="false"
                isConnectable={false}
                style={{
                    background: token('color.background.danger.bold'),
                    border: `2px solid ${token('color.border.danger')}`,
                    width: '4px',
                    height: '4px',
                    left: '30%',
                }}
            />

            {/* False label */}
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

            {/* TRUE handle - not connectable in read-only mode */}
            <Handle
                type="source"
                position={Position.Bottom}
                id="true"
                isConnectable={false}
                style={{
                    background: token('color.background.success.bold'),
                    border: `2px solid ${token('color.border.success')}`,
                    width: '4px',
                    height: '4px',
                    left: '70%',
                }}
            />

            {/* True label */}
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

export default memo(LogicNode);
