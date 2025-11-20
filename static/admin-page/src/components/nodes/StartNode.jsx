import { memo } from 'react';
import { Handle, Position } from '@xyflow/react';
import { token } from '@atlaskit/tokens';
import { Text } from '@atlaskit/primitives';

/**
 * StartNode Component
 * 
 * Represents the starting point of a decision flow.
 * This node is the entry point where flow execution begins.
 * 
 * Visual Design:
 * - Green circular shape with rocket icon
 * - Single source handle at the bottom for outgoing connections
 * - Non-editable label "Start"
 * 
 * Features:
 * - Uses Atlaskit design tokens for consistent theming
 * - Supports both light and dark modes
 * - Single output connection point
 * 
 * @param {Object} data - Node data containing label and configuration
 * @param {boolean} isConnectable - Whether the node can be connected to other nodes
 */
function StartNode({ data, isConnectable }) {
    return (
        <div
            style={{
                backgroundColor: token('color.background.success.bold'),
                color: token('color.text.inverse'),
                border: `1px solid ${token('color.border.success')}`,
                borderRadius: '5%',
                width: '100px',
                height: '30px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '12px',
                fontWeight: 'bold',
                textAlign: 'center',
                boxShadow: token('elevation.shadow.raised'),
                cursor: 'grab',
            }}
        >
            {/* Display rocket icon and label */}
            <div>
                <Text color="color.text.inverse" size="small">🚀 Start</Text>
            </div>

            {/* Source handle at the bottom for outgoing connections */}
            <Handle
                type="source"
                position={Position.Bottom}
                id="source"
                isConnectable={isConnectable}
                style={{
                    background: token('color.background.inverse.subtle'),
                    border: `2px solid ${token('color.border.success')}`,
                    width: '4px',
                    height: '4px',
                }}
            />
        </div>
    );
}

// Memoize the component to prevent unnecessary re-renders
// This is important for performance in large flows
export default memo(StartNode);
