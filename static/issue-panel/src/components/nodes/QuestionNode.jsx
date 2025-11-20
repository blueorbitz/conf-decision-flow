/**
 * QuestionNode Component (Read-Only Version for Issue Panel)
 * 
 * Represents a question node in the flow diagram view.
 * This is a read-only version used in the FlowDiagramView component.
 * 
 * Visual Design:
 * - Blue rounded rectangle with question icon
 * - Displays question text preview
 * - Shows question type as a badge
 * - Displays answer options as chips
 */

import { memo } from 'react';
import { Handle, Position } from '@xyflow/react';
import { token } from '@atlaskit/tokens';
import Lozenge from '@atlaskit/lozenge';
import { Text } from '@atlaskit/primitives';

function QuestionNode({ data, isConnectable }) {
    const question = data.question || 'Enter your question';
    const questionType = data.questionType || 'single';
    const options = data.options || [];

    const questionTypeLabels = {
        single: 'Single Choice',
        multiple: 'Multiple Choice',
        date: 'Date',
        number: 'Number'
    };

    const shouldShowMultipleHandles = questionType === 'single' && options.length > 0;

    return (
        <div
            style={{
                backgroundColor: token('color.background.information'),
                color: token('color.text'),
                border: `1px solid ${token('color.border.information')}`,
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
                    border: `2px solid ${token('color.border.information')}`,
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
                <div style={{ marginRight: '8px' }}>
                    <Text size="small" weight="bold">❓ {questionTypeLabels[questionType]}</Text>
                </div>
            </div>

            {/* Question text */}
            <div style={{
                wordWrap: 'break-word',
                lineHeight: '1.2'
            }}>
                <Text size="small">{question}</Text>
            </div>

            {/* Display options */}
            {(questionType === 'single' || questionType === 'multiple') && options.length > 0 && (
                <div style={{ marginTop: '8px' }}>
                    <div style={{
                        fontSize: '11px',
                        color: token('color.text.subtlest'),
                        marginBottom: '4px'
                    }}>
                        Options:
                    </div>
                    <div style={{
                        display: 'flex',
                        flexWrap: 'wrap',
                        gap: '4px'
                    }}>
                        {options.slice(0, 3).map((option, index) => (
                            <Lozenge key={index} appearance="default">
                                {option}
                            </Lozenge>
                        ))}
                        {options.length > 3 && (
                            <Lozenge appearance="default">
                                +{options.length - 3} more
                            </Lozenge>
                        )}
                    </div>
                </div>
            )}

            {/* Source handles - not connectable in read-only mode */}
            {shouldShowMultipleHandles ? (
                options.map((option, index) => {
                    const totalOptions = options.length;
                    const leftPercent = ((index + 1) / (totalOptions + 1)) * 100;
                    
                    return (
                        <Handle
                            key={`option-${index}`}
                            type="source"
                            position={Position.Bottom}
                            id={`option-${index}`}
                            isConnectable={false}
                            style={{
                                background: token('color.background.inverse.subtle'),
                                border: `2px solid ${token('color.border.information')}`,
                                width: '4px',
                                height: '4px',
                                left: `${leftPercent}%`,
                                top: '96%',
                                transform: 'translateX(-50%)',
                            }}
                            title={option}
                        />
                    );
                })
            ) : (
                <Handle
                    type="source"
                    position={Position.Bottom}
                    id="source"
                    isConnectable={false}
                    style={{
                        background: token('color.background.inverse.subtle'),
                        border: `2px solid ${token('color.border.information')}`,
                        width: '4px',
                        height: '4px',
                    }}
                />
            )}
        </div>
    );
}

export default memo(QuestionNode);
