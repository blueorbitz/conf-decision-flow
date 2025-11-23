/**
 * QuestionnaireView Component
 * 
 * Displays the interactive questionnaire interface for completing a decision flow.
 * This component:
 * - Shows the current question based on execution state
 * - Renders appropriate input controls based on question type (single choice, multiple choice, date, number)
 * - Handles answer submission and flow progression
 * - Automatically evaluates logic nodes during flow progression
 * - Displays completion message when flow reaches an action node
 * - Provides reset functionality to restart the flow
 */

import React, { useState, useEffect, useCallback } from 'react';
import { invoke, requestJira } from '@forge/bridge';
import { Box, Stack, Inline } from '@atlaskit/primitives';
import Button from '@atlaskit/button/new';
import Spinner from '@atlaskit/spinner';
import SectionMessage from '@atlaskit/section-message';
import Textfield from '@atlaskit/textfield';
import { RadioGroup } from '@atlaskit/radio';
import { Checkbox } from '@atlaskit/checkbox';
import { DatePicker } from '@atlaskit/datetime-picker';
import Heading from '@atlaskit/heading';
import { evaluateDateExpression } from '../utils/dateExpressionEvaluator.js';
import { parseDateExpression } from '../utils/dateExpressionParser.js';

function QuestionnaireView({ issueKey, flow, onStateChange }) {
  // State management
  const [executionState, setExecutionState] = useState(null);
  const [currentNode, setCurrentNode] = useState(null);
  const [answer, setAnswer] = useState(null);
  const [multipleChoiceAnswers, setMultipleChoiceAnswers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  
  // State for field display names and evaluated dates (for Logic and Action nodes)
  const [fieldDisplayName, setFieldDisplayName] = useState('');
  const [evaluatedDate, setEvaluatedDate] = useState(null);

  /**
   * Get a human-readable field name from a field key by fetching from Jira API
   * @param {string} fieldKey - The Jira field key
   * @returns {Promise<string>} Human-readable field name in format "Name (key)"
   */
  const getFieldDisplayName = useCallback(async (fieldKey) => {
    try {
      // Fetch field metadata from Jira API
      const response = await requestJira('/rest/api/3/field', {
        headers: {
          'Accept': 'application/json'
        }
      });

      const fields = await response.json();
      
      // Find the specific field
      const field = fields.find(f => f.key === fieldKey || f.id === fieldKey);
      
      if (field) {
        // Return in format "Name (key)"
        return `${field.name} (${field.key || field.id})`;
      }
      
      // Fallback to just the field key if not found
      return fieldKey;
    } catch (error) {
      console.error('Error fetching field metadata:', error);
      // Fallback to field key on error
      return fieldKey;
    }
  }, []);

  /**
   * Load the current execution state for this issue and flow
   * Determines which node the user is currently on
   */
  const loadExecutionState = async () => {
    try {
      setLoading(true);
      setError(null);

      // Get execution state from backend
      const state = await invoke('getExecutionState', {
        issueKey,
        flowId: flow.id
      });

      console.log('exec state', state);
      setExecutionState(state);

      // Find the current node in the flow
      if (state && state.currentNodeId) {
        const node = flow.nodes.find(n => n.id === state.currentNodeId);
        setCurrentNode(node);

        // Initialize answer state based on node type
        if (node && node.type === 'question') {
          // Pre-fill answer if it exists in execution state
          const existingAnswer = state.answers?.[node.id];
          if (existingAnswer !== undefined) {
            if (node.data.questionType === 'multiple') {
              setMultipleChoiceAnswers(existingAnswer || []);
            } else {
              setAnswer(existingAnswer);
            }
          } else {
            // Reset answer state for new question
            setAnswer(null);
            setMultipleChoiceAnswers([]);
          }
        }
      }

      setLoading(false);

      // Notify parent component of state change
      if (onStateChange) {
        onStateChange(state);
      }
    } catch (err) {
      console.error('Error loading execution state:', err);
      setError(err.message || 'Failed to load questionnaire');
      setLoading(false);
    }
  };

  // Load execution state and current node on mount and when issueKey or flow.id changes
  useEffect(() => {
    loadExecutionState();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [issueKey, flow.id]);

  // Load field display name and evaluate date expressions for Logic and Action nodes
  useEffect(() => {
    const loadFieldInfo = async () => {
      if (!currentNode) {
        setFieldDisplayName('');
        setEvaluatedDate(null);
        return;
      }

      // Handle Logic nodes
      if (currentNode.type === 'logic') {
        const { fieldKey, expectedValue } = currentNode.data;
        
        // Fetch readable field name
        const displayName = await getFieldDisplayName(fieldKey);
        setFieldDisplayName(displayName);

        // Check if expectedValue is a date expression and evaluate it
        if (expectedValue && typeof expectedValue === 'string') {
          try {
            const parseResult = parseDateExpression(expectedValue);
            if (parseResult.valid) {
              // It's a date expression, evaluate it
              const evaluated = evaluateDateExpression(expectedValue);
              setEvaluatedDate(evaluated);
              console.log(`[Logic Node] Evaluated date expression "${expectedValue}" to ${evaluated.toISOString()}`);
            } else {
              setEvaluatedDate(null);
            }
          } catch (err) {
            console.error('Error evaluating date expression:', err);
            setEvaluatedDate(null);
          }
        } else {
          setEvaluatedDate(null);
        }
      }
      // Handle Action nodes
      else if (currentNode.type === 'action') {
        const { actionType, fieldKey, fieldValue } = currentNode.data;
        
        if (actionType === 'setField' && fieldKey) {
          // Fetch readable field name
          const displayName = await getFieldDisplayName(fieldKey);
          setFieldDisplayName(displayName);

          // Check if fieldValue is a date expression and evaluate it
          if (fieldValue && typeof fieldValue === 'string') {
            try {
              const parseResult = parseDateExpression(fieldValue);
              if (parseResult.valid) {
                // It's a date expression, evaluate it
                const evaluated = evaluateDateExpression(fieldValue);
                setEvaluatedDate(evaluated);
                console.log(`[Action Node] Evaluated date expression "${fieldValue}" to ${evaluated.toISOString()}`);
              } else {
                setEvaluatedDate(null);
              }
            } catch (err) {
              console.error('Error evaluating date expression:', err);
              setEvaluatedDate(null);
            }
          } else {
            setEvaluatedDate(null);
          }
        } else {
          setFieldDisplayName('');
          setEvaluatedDate(null);
        }
      }
      // For other node types, clear the state
      else {
        setFieldDisplayName('');
        setEvaluatedDate(null);
      }
    };

    loadFieldInfo();
  }, [currentNode, getFieldDisplayName]);

  /**
   * Get a human-readable operator name
   * @param {string} operator - The operator key
   * @returns {string} Human-readable operator
   */
  const getOperatorDisplayName = (operator) => {
    const operatorNames = {
      'equals': 'equals',
      'notEquals': 'does not equal',
      'contains': 'contains',
      'greaterThan': 'is greater than',
      'lessThan': 'is less than',
      'isEmpty': 'is empty',
      'isNotEmpty': 'is not empty'
    };
    return operatorNames[operator] || operator;
  };

  /**
   * Handle answer submission
   * Submits the user's answer to the backend and progresses to the next node
   */
  const handleSubmit = async () => {
    if (!currentNode) return;
    console.log('submit node', currentNode);

    // For question nodes, validate answer is provided
    if (currentNode.type === 'question') {
      const finalAnswer = currentNode.data.questionType === 'multiple' 
        ? multipleChoiceAnswers 
        : answer;

      if (finalAnswer === null || finalAnswer === undefined || finalAnswer === '') {
        setError('Please provide an answer before submitting');
        return;
      }

      // For multiple choice, ensure at least one option is selected
      if (currentNode.data.questionType === 'multiple' && multipleChoiceAnswers.length === 0) {
        setError('Please select at least one option');
        return;
      }
    }

    try {
      setSubmitting(true);
      setError(null);

      // Determine the answer to submit
      // For start nodes, answer is null
      // For question nodes, use the user's answer
      const finalAnswer = currentNode.type === 'question'
        ? (currentNode.data.questionType === 'multiple' ? multipleChoiceAnswers : answer)
        : null;

      // Submit answer to backend and get updated state
      console.log('Submitting answer:', {
        issueKey,
        flowId: flow.id,
        nodeId: currentNode.id,
        currentNodeType: currentNode.type,
        answer: finalAnswer
      });

      const updatedState = await invoke('submitAnswer', {
        issueKey,
        flowId: flow.id,
        nodeId: currentNode.id,
        answer: finalAnswer
      });

      console.log('Received updated state:', updatedState);
      console.log('Current node before update:', currentNode.id);
      console.log('New current node from state:', updatedState?.currentNodeId);

      // Check if backend returned an error
      if (updatedState && updatedState.error) {
        setError(updatedState.error);
        setSubmitting(false);
        return;
      }

      // Use the returned state directly instead of reloading
      // This is more efficient and avoids timing issues
      if (updatedState) {
        setExecutionState(updatedState);

        // Find the new current node
        if (updatedState.currentNodeId) {
          const newNode = flow.nodes.find(n => n.id === updatedState.currentNodeId);
          setCurrentNode(newNode);

          // Reset answer state for the new node
          if (newNode && newNode.type === 'question') {
            const existingAnswer = updatedState.answers?.[newNode.id];
            if (existingAnswer !== undefined) {
              if (newNode.data.questionType === 'multiple') {
                setMultipleChoiceAnswers(existingAnswer || []);
              } else {
                setAnswer(existingAnswer);
              }
            } else {
              setAnswer(null);
              setMultipleChoiceAnswers([]);
            }
          }
        }

        // Notify parent component of state change
        if (onStateChange) {
          onStateChange(updatedState);
        }
      }

      setSubmitting(false);
    } catch (err) {
      console.error('Error submitting answer:', err);
      setError(err.message || 'Failed to submit answer');
      setSubmitting(false);
    }
  };

  /**
   * Handle flow reset
   * Clears execution state and returns to the start node
   */
  const handleReset = async () => {
    try {
      setSubmitting(true);
      setError(null);

      // Reset execution state on backend
      await invoke('resetExecution', {
        issueKey,
        flowId: flow.id
      });

      // Reload to get fresh state
      await loadExecutionState();

      setSubmitting(false);
    } catch (err) {
      console.error('Error resetting flow:', err);
      setError(err.message || 'Failed to reset flow');
      setSubmitting(false);
    }
  };

  /**
   * Render the appropriate input control based on question type
   */
  const renderQuestionInput = () => {
    if (!currentNode || !currentNode.data) return null;

    const { questionType, options } = currentNode.data;

    switch (questionType) {
      case 'single':
        // Radio buttons for single choice
        return (
          <RadioGroup
            options={options.map(opt => ({ name: 'answer', value: opt, label: opt }))}
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
          />
        );

      case 'multiple':
        // Checkboxes for multiple choice
        return (
          <Stack space="space.100">
            {options.map((option, index) => (
              <Checkbox
                key={index}
                label={option}
                isChecked={multipleChoiceAnswers.includes(option)}
                onChange={(e) => {
                  if (e.target.checked) {
                    setMultipleChoiceAnswers([...multipleChoiceAnswers, option]);
                  } else {
                    setMultipleChoiceAnswers(multipleChoiceAnswers.filter(a => a !== option));
                  }
                }}
              />
            ))}
          </Stack>
        );

      case 'date':
        // Date picker for date input
        return (
          <DatePicker
            value={answer || ''}
            onChange={(value) => setAnswer(value)}
            placeholder="Select a date"
          />
        );

      case 'number':
        // Number input field
        return (
          <Textfield
            type="number"
            value={answer || ''}
            onChange={(e) => setAnswer(e.target.value)}
            placeholder="Enter a number"
          />
        );

      default:
        return <p>Unknown question type: {questionType}</p>;
    }
  };

  // Loading state
  if (loading) {
    return (
      <Box padding="space.400">
        <Stack alignInline="center" space="space.200">
          <Spinner size="large" />
          <span>Loading questionnaire...</span>
        </Stack>
      </Box>
    );
  }

  // Error state
  if (error && !currentNode) {
    return (
      <Box padding="space.400">
        <SectionMessage appearance="error" title="Error">
          <p>{error}</p>
        </SectionMessage>
      </Box>
    );
  }

  // Completion state - flow has reached an action node
  if (executionState && executionState.completed) {
    return (
      <Box padding="space.400">
        <Stack space="space.300">
          <SectionMessage appearance="success" title="Flow completed!">
            <p>You have successfully completed this decision flow. The configured actions have been executed on this issue.</p>
          </SectionMessage>

          {/* Reset button to start over */}
          <Box>
            <Button
              appearance="default"
              onClick={handleReset}
              isDisabled={submitting}
            >
              Start Over
            </Button>
          </Box>
        </Stack>
      </Box>
    );
  }

  // No current node (shouldn't happen, but handle gracefully)
  if (!currentNode) {
    return (
      <Box padding="space.400">
        <SectionMessage appearance="warning" title="No question available">
          <p>Unable to determine the current question. Please try resetting the flow.</p>
          <Box paddingBlockStart="space.200">
            <Button
              appearance="default"
              onClick={handleReset}
              isDisabled={submitting}
            >
              Reset Flow
            </Button>
          </Box>
        </SectionMessage>
      </Box>
    );
  }

  // Start node - show welcome message
  if (currentNode.type === 'start') {
    return (
      <Box padding="space.400">
        <Stack space="space.300">
          <SectionMessage appearance="information" title="Ready to begin">
            <p>Click the button below to start this decision flow.</p>
          </SectionMessage>

          <Box>
            <Button
              appearance="primary"
              onClick={handleSubmit}
              isDisabled={submitting}
            >
              {submitting ? 'Starting...' : 'Start Flow'}
            </Button>
          </Box>
        </Stack>
      </Box>
    );
  }

  // Logic node - user must manually trigger evaluation
  if (currentNode.type === 'logic') {
    const { fieldKey, operator, expectedValue, valueSource, questionNodeId } = currentNode.data;
    const operatorName = getOperatorDisplayName(operator);

    // Determine what value will be used for comparison
    let comparisonDescription = '';
    if (valueSource === 'question' && questionNodeId) {
      // Find the question node to display its text
      const questionNode = flow.nodes.find(n => n.id === questionNodeId);
      const questionText = questionNode?.data?.question || 'a previous question';
      const answerValue = executionState?.answers?.[questionNodeId];
      
      if (answerValue !== undefined && answerValue !== null) {
        comparisonDescription = (
          <>
            The flow will check if the issue's <strong>{fieldDisplayName}</strong> field {operatorName} your answer to "{questionText}" 
            (which was: <strong>{Array.isArray(answerValue) ? answerValue.join(', ') : answerValue}</strong>).
          </>
        );
      } else {
        comparisonDescription = (
          <>
            The flow will check if the issue's <strong>{fieldDisplayName}</strong> field {operatorName} your answer to "{questionText}".
          </>
        );
      }
    } else {
      // Static value comparison
      // If we have an evaluated date, show both the expression and the evaluated date
      if (evaluatedDate) {
        const formattedDate = evaluatedDate.toLocaleDateString('en-US', { 
          year: 'numeric', 
          month: 'short', 
          day: 'numeric' 
        });
        comparisonDescription = (
          <>
            The flow will check if the issue's <strong>{fieldDisplayName}</strong> field {operatorName} <strong>{expectedValue}</strong>
            {' '}(evaluates to: <strong>{formattedDate}</strong>).
          </>
        );
      } else {
        comparisonDescription = (
          <>
            The flow will check if the issue's <strong>{fieldDisplayName}</strong> field {operatorName}
            {expectedValue && ` "${expectedValue}"`}.
          </>
        );
      }
    }

    return (
      <Box padding="space.400">
        <Stack space="space.300">
          <SectionMessage appearance="warning" title="Condition Check Required">
            <p>{comparisonDescription}</p>
            <p>
              <strong>Please ensure this field is set correctly on the issue before proceeding.</strong>
            </p>
          </SectionMessage>

          {/* Error message if any */}
          {error && (
            <SectionMessage appearance="error">
              <p>{error}</p>
            </SectionMessage>
          )}

          {/* Action buttons */}
          <Inline space="space.100">
            <Button
              appearance="primary"
              onClick={handleSubmit}
              isDisabled={submitting}
            >
              {submitting ? 'Evaluating...' : 'Evaluate Condition'}
            </Button>

            <Button
              appearance="subtle"
              onClick={handleReset}
              isDisabled={submitting}
            >
              Reset Flow
            </Button>
          </Inline>

          {/* Progress indicator */}
          {executionState && executionState.path && (
            <Box paddingBlockStart="space.200">
              <SectionMessage appearance="information">
                <p>Progress: {executionState.path.length} step(s) completed</p>
              </SectionMessage>
            </Box>
          )}
        </Stack>
      </Box>
    );
  }

  // Action node - user must manually trigger action execution
  if (currentNode.type === 'action') {
    const { actionType, fieldKey, fieldValue, label, comment } = currentNode.data;
    
    // Build action description
    let actionDescription = '';
    switch (actionType) {
      case 'setField':
        // If we have an evaluated date, show both the expression and the evaluated date
        if (evaluatedDate) {
          const formattedDate = evaluatedDate.toLocaleDateString('en-US', { 
            year: 'numeric', 
            month: 'short', 
            day: 'numeric' 
          });
          actionDescription = `Set field "${fieldDisplayName}" to ${fieldValue} (evaluates to: ${formattedDate})`;
        } else {
          actionDescription = `Set field "${fieldDisplayName}" to "${fieldValue}"`;
        }
        break;
      case 'addLabel':
        actionDescription = `Add label "${label}" to the issue`;
        break;
      case 'addComment':
        actionDescription = `Add comment: "${comment}"`;
        break;
      default:
        actionDescription = `Execute ${actionType} action`;
    }

    return (
      <Box padding="space.400">
        <Stack space="space.300">
          <SectionMessage appearance="information" title="Action Ready to Execute">
            <p>
              The following action will be performed on this issue:
            </p>
            <p>
              <strong>{actionDescription}</strong>
            </p>
          </SectionMessage>

          {/* Error message if any */}
          {error && (
            <SectionMessage appearance="error">
              <p>{error}</p>
            </SectionMessage>
          )}

          {/* Action buttons */}
          <Inline space="space.100">
            <Button
              appearance="primary"
              onClick={handleSubmit}
              isDisabled={submitting}
            >
              {submitting ? 'Executing...' : 'Execute Action'}
            </Button>

            <Button
              appearance="subtle"
              onClick={handleReset}
              isDisabled={submitting}
            >
              Reset Flow
            </Button>
          </Inline>

          {/* Progress indicator */}
          {executionState && executionState.path && (
            <Box paddingBlockStart="space.200">
              <SectionMessage appearance="information">
                <p>Progress: {executionState.path.length} step(s) completed</p>
              </SectionMessage>
            </Box>
          )}
        </Stack>
      </Box>
    );
  }

  // Question node - main questionnaire UI
  return (
    <Box padding="space.400">
      <Stack space="space.300">
        {/* Question text */}
        <Box>
          <Heading size="medium">{currentNode.data.question}</Heading>
        </Box>

        {/* Question input based on type */}
        <Box>
          {renderQuestionInput()}
        </Box>

        {/* Error message if any */}
        {error && (
          <SectionMessage appearance="error">
            <p>{error}</p>
          </SectionMessage>
        )}

        {/* Action buttons */}
        <Inline space="space.100">
          <Button
            appearance="primary"
            onClick={handleSubmit}
            isDisabled={submitting}
          >
            {submitting ? 'Submitting...' : 'Submit Answer'}
          </Button>

          <Button
            appearance="subtle"
            onClick={handleReset}
            isDisabled={submitting}
          >
            Reset Flow
          </Button>
        </Inline>

        {/* Progress indicator */}
        {executionState && executionState.path && (
          <Box paddingBlockStart="space.200">
            <SectionMessage appearance="information">
              <p>Progress: {executionState.path.length} step(s) completed</p>
            </SectionMessage>
          </Box>
        )}
      </Stack>
    </Box>
  );
}

export default QuestionnaireView;
