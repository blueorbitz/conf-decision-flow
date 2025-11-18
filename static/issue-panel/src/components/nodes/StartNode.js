/**
 * StartNode Component (Read-Only Version for Issue Panel)
 * 
 * Represents the starting point of a decision flow in the diagram view.
 * This is a read-only version used in the FlowDiagramView component.
 * 
 * Visual Design:
 * - Green circular shape with rocket icon
 * - Single source handle at the bottom
 * - Non-editable label "Start"
 */

import { memo } from 'react';
import { Handle, Position } from '@xyflow/react';
import { token } from '@atlaskit/tokens';
import { Text } from '@atlaskit/primitives';

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
                cursor: 'default', // Changed from 'grab' to 'default' for read-only
            }}
        >
            <div>
                <Text color="color.text.inverse" size="small">🚀 Start</Text>
            </div>

            {/* Source handle - not connectable in read-only mode */}
            <Handle
                type="source"
                position={Position.Bottom}
                id="source"
                isConnectable={false}
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

export default memo(StartNode);
