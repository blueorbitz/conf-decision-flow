import { memo } from 'react';
import { Handle, Position } from '@xyflow/react';
import { token } from '@atlaskit/tokens';
import Lozenge from '@atlaskit/lozenge';
import { Text } from '@atlaskit/primitives';

/**
 * QuestionNode Component
 * 
 * Represents a question node in the decision flow that prompts users for input.
 * Users will answer these questions when executing the flow in the issue panel.
 * 
 * Visual Design:
 * - Blue rounded rectangle with question icon
 * - Displays question text preview
 * - Shows question type as a badge (single choice, multiple choice, date, number)
 * - Displays answer options as chips (for single/multiple choice questions)
 * 
 * Handles:
 * - One target handle at the top for incoming connections
 * - One source handle at the bottom for outgoing connections
 * 
 * Features:
 * - Uses Atlaskit design tokens for consistent theming
 * - Supports both light and dark modes
 * - Displays question configuration in a readable format
 * 
 * @param {Object} data - Node data containing question configuration
 * @param {string} data.question - The question text to display to users
 * @param {string} data.questionType - Type of question (single, multiple, date, number)
 * @param {string[]} data.options - Answer options for single/multiple choice questions
 * @param {boolean} isConnectable - Whether the node can be connected to other nodes
 */
function QuestionNode({ data, isConnectable }) {
    // Extract question data with defaults
    const question = data.question || 'Enter your question';
    const questionType = data.questionType || 'single';
    const options = data.options || [];

    // Map question types to display labels
    const questionTypeLabels = {
        single: 'Single Choice',
        multiple: 'Multiple Choice',
        date: 'Date',
        number: 'Number'
    };

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
                    border: `2px solid ${token('color.border.information')}`,
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
                <div style={{ marginRight: '8px' }}>
                    <Text size="small" weight="bold">❓ {questionTypeLabels[questionType]}</Text>
                </div>
            </div>

            {/* Question text preview */}
            <div style={{
                wordWrap: 'break-word',
                lineHeight: '1.2'
            }}>
                <Text size="small">{question}</Text>
            </div>

            {/* Display options for single/multiple choice questions */}
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

            {/* Source handle at the bottom for outgoing connections */}
            <Handle
                type="source"
                position={Position.Bottom}
                id="source"
                isConnectable={isConnectable}
                style={{
                    background: token('color.background.inverse.subtle'),
                    border: `2px solid ${token('color.border.information')}`,
                    width: '4px',
                    height: '4px',
                }}
            />
        </div>
    );
}

// Memoize the component to prevent unnecessary re-renders
// This is important for performance in large flows
export default memo(QuestionNode);
