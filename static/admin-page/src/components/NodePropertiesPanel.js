import { useState, useEffect } from 'react';
import { requestJira } from '@forge/bridge';
import Button, { IconButton } from '@atlaskit/button/new';
import Textfield from '@atlaskit/textfield';
import TextArea from '@atlaskit/textarea';
import Select from '@atlaskit/select';
import Heading from '@atlaskit/heading';
import { Box, Stack, Flex, Text } from '@atlaskit/primitives';
import { token } from '@atlaskit/tokens';
import CrossIcon from '@atlaskit/icon/core/cross';

/**
 * NodePropertiesPanel Component
 * 
 * Side panel for editing properties of a selected node in the flow builder.
 * Displays conditional form fields based on the node type and updates node data in real-time.
 * 
 * Features:
 * - Conditional rendering based on node type (Start, Question, Logic, Action)
 * - Real-time updates to node data as properties are modified
 * - Form validation for required fields
 * - Delete Node button to remove node and connected edges
 * - Close button to deselect node and close panel
 * - Uses Atlaskit form components for consistent UI
 * 
 * Node Type Configurations:
 * - Start: Non-editable (no properties to configure)
 * - Question: question text, question type, answer options
 * - Logic: field key, comparison operator, expected value
 * - Action: action type, conditional fields based on action type
 * 
 * @param {Object} selectedNode - The currently selected node object from ReactFlow
 * @param {Function} onUpdateNode - Callback to update node data
 * @param {Function} onDeleteNode - Callback to delete the node
 * @param {Function} onClose - Callback to close the panel and deselect node
 */
function NodePropertiesPanel({ selectedNode, onUpdateNode, onDeleteNode, onClose }) {
    // Local state for form fields
    const [formData, setFormData] = useState({});
    
    // State for Jira fields (for Logic and Action nodes)
    const [jiraFields, setJiraFields] = useState([]);
    const [isLoadingFields, setIsLoadingFields] = useState(false);

    /**
     * Fetch Jira fields from the API
     */
    useEffect(() => {
        const fetchJiraFields = async () => {
            setIsLoadingFields(true);
            try {
                const response = await requestJira('/rest/api/3/field');
                const fields = await response.json();
                
                // Transform fields into Select options format
                const fieldOptions = fields.map(field => ({
                    label: `${field.name} (${field.key || field.id})`,
                    value: field.key || field.id,
                    field: field
                }));
                
                setJiraFields(fieldOptions);
            } catch (error) {
                console.error('Error fetching Jira fields:', error);
                // Set empty array on error so the component still works
                setJiraFields([]);
            } finally {
                setIsLoadingFields(false);
            }
        };

        // Only fetch fields once when component mounts
        fetchJiraFields();
    }, []);

    /**
     * Initialize form data when selected node changes
     */
    useEffect(() => {
        if (selectedNode) {
            setFormData(selectedNode.data || {});
        }
    }, [selectedNode]);

    /**
     * Handle form field changes and update node data in real-time
     */
    const handleFieldChange = (fieldName, value) => {
        const updatedData = {
            ...formData,
            [fieldName]: value
        };
        setFormData(updatedData);
        
        // Update node data in real-time
        onUpdateNode(selectedNode.id, updatedData);
    };

    /**
     * Handle options array changes for Question nodes
     */
    const handleOptionsChange = (value) => {
        // Split by newline and filter empty lines
        const optionsArray = value
            .split('\n')
            .map(opt => opt.trim())
            .filter(opt => opt.length > 0);
        
        handleFieldChange('options', optionsArray);
    };

    /**
     * Handle delete node action
     */
    const handleDelete = () => {
        if (window.confirm('Are you sure you want to delete this node? This will also remove all connected edges.')) {
            onDeleteNode(selectedNode.id);
        }
    };

    // If no node is selected, show empty state
    if (!selectedNode) {
        return (
            <Box style={{
                width: '300px',
                backgroundColor: token('elevation.surface.raised'),
                borderLeft: `${token('border.width')} solid ${token('color.border')}`,
                padding: token('space.200'),
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: token('color.text.subtlest')
            }}>
                <div style={{ textAlign: 'center' }}>
                    Select a node to edit its properties
                </div>
            </Box>
        );
    }

    // Question type options for Select component
    const questionTypeOptions = [
        { label: 'Single Choice', value: 'single' },
        { label: 'Multiple Choice', value: 'multiple' },
        { label: 'Date', value: 'date' },
        { label: 'Number', value: 'number' }
    ];

    // Logic operator options for Select component
    const operatorOptions = [
        { label: 'Equals', value: 'equals' },
        { label: 'Not Equals', value: 'notEquals' },
        { label: 'Contains', value: 'contains' },
        { label: 'Greater Than', value: 'greaterThan' },
        { label: 'Less Than', value: 'lessThan' },
        { label: 'Is Empty', value: 'isEmpty' },
        { label: 'Is Not Empty', value: 'isNotEmpty' }
    ];

    // Action type options for Select component
    const actionTypeOptions = [
        { label: 'Set Field', value: 'setField' },
        { label: 'Add Label', value: 'addLabel' },
        { label: 'Add Comment', value: 'addComment' }
    ];

    /**
     * Render properties form based on node type
     */
    const renderPropertiesForm = () => {
        switch (selectedNode.type) {
            case 'start':
                // Start nodes have no editable properties
                return (
                    <Box style={{ color: token('color.text.subtlest'), fontSize: '14px' }}>
                        Start nodes have no configurable properties.
                    </Box>
                );

            case 'question':
                return (
                    <Stack space="space.200">
                        {/* Question Text */}
                        <Box>
                            <label htmlFor="question-text" style={{
                                display: 'block',
                                marginBottom: token('space.050'),
                                fontWeight: 'bold',
                                fontSize: '12px'
                            }}>
                                Question Text *
                            </label>
                            <TextArea
                                id="question-text"
                                value={formData.question || ''}
                                onChange={(e) => handleFieldChange('question', e.target.value)}
                                placeholder="Enter your question"
                                resize="auto"
                                minimumRows={3}
                            />
                        </Box>

                        {/* Question Type */}
                        <Box>
                            <label htmlFor="question-type" style={{
                                display: 'block',
                                marginBottom: token('space.050'),
                                fontWeight: 'bold',
                                fontSize: '12px'
                            }}>
                                Question Type *
                            </label>
                            <Select
                                inputId="question-type"
                                options={questionTypeOptions}
                                value={questionTypeOptions.find(opt => opt.value === formData.questionType)}
                                onChange={(option) => handleFieldChange('questionType', option.value)}
                                placeholder="Select question type"
                            />
                        </Box>

                        {/* Options (only for single/multiple choice) */}
                        {(formData.questionType === 'single' || formData.questionType === 'multiple') && (
                            <Box>
                                <label htmlFor="question-options" style={{
                                    display: 'block',
                                    marginBottom: token('space.050'),
                                    fontWeight: 'bold',
                                    fontSize: '12px'
                                }}>
                                    Answer Options *
                                </label>
                                <TextArea
                                    id="question-options"
                                    value={(formData.options || []).join('\n')}
                                    onChange={(e) => handleOptionsChange(e.target.value)}
                                    placeholder="Enter one option per line"
                                    resize="auto"
                                    minimumRows={4}
                                />
                                <div style={{
                                    fontSize: '11px',
                                    color: token('color.text.subtlest'),
                                    marginTop: token('space.050')
                                }}>
                                    Enter one option per line
                                </div>
                            </Box>
                        )}
                    </Stack>
                );

            case 'logic':
                return (
                    <Stack space="space.200">
                        {/* Field Key */}
                        <Box>
                            <label htmlFor="field-key" style={{
                                display: 'block',
                                marginBottom: token('space.050'),
                                fontWeight: 'bold',
                                fontSize: '12px'
                            }}>
                                Jira Field Key *
                            </label>
                            <Select
                                inputId="field-key"
                                options={jiraFields}
                                value={jiraFields.find(opt => opt.value === formData.fieldKey)}
                                onChange={(option) => handleFieldChange('fieldKey', option ? option.value : '')}
                                placeholder={isLoadingFields ? "Loading fields..." : "Select a Jira field"}
                                isLoading={isLoadingFields}
                                isSearchable={true}
                                isClearable={true}
                            />
                            <div style={{
                                fontSize: '11px',
                                color: token('color.text.subtlest'),
                                marginTop: token('space.050')
                            }}>
                                Select the Jira field to evaluate
                            </div>
                        </Box>

                        {/* Operator */}
                        <Box>
                            <label htmlFor="operator" style={{
                                display: 'block',
                                marginBottom: token('space.050'),
                                fontWeight: 'bold',
                                fontSize: '12px'
                            }}>
                                Comparison Operator *
                            </label>
                            <Select
                                inputId="operator"
                                options={operatorOptions}
                                value={operatorOptions.find(opt => opt.value === formData.operator)}
                                onChange={(option) => handleFieldChange('operator', option.value)}
                                placeholder="Select operator"
                            />
                        </Box>

                        {/* Expected Value (not needed for isEmpty/isNotEmpty) */}
                        {formData.operator !== 'isEmpty' && formData.operator !== 'isNotEmpty' && (
                            <Box>
                                <label htmlFor="expected-value" style={{
                                    display: 'block',
                                    marginBottom: token('space.050'),
                                    fontWeight: 'bold',
                                    fontSize: '12px'
                                }}>
                                    Expected Value *
                                </label>
                                <Textfield
                                    id="expected-value"
                                    value={formData.expectedValue || ''}
                                    onChange={(e) => handleFieldChange('expectedValue', e.target.value)}
                                    placeholder="Enter value to compare against"
                                />
                                <div style={{
                                    fontSize: '11px',
                                    color: token('color.text.subtlest'),
                                    marginTop: token('space.050')
                                }}>
                                    The value to compare the field against
                                </div>
                            </Box>
                        )}

                        {/* Info box about edge labels */}
                        <Box style={{
                            padding: token('space.150'),
                            backgroundColor: token('color.background.information'),
                            borderRadius: token('border.radius'),
                            fontSize: '12px'
                        }}>
                            <strong>Note:</strong> Connect the right handle for TRUE and left handle for FALSE outcomes.
                        </Box>
                    </Stack>
                );

            case 'action':
                return (
                    <Stack space="space.200">
                        {/* Action Type */}
                        <Box>
                            <label htmlFor="action-type" style={{
                                display: 'block',
                                marginBottom: token('space.050'),
                                fontWeight: 'bold',
                                fontSize: '12px'
                            }}>
                                Action Type *
                            </label>
                            <Select
                                inputId="action-type"
                                options={actionTypeOptions}
                                value={actionTypeOptions.find(opt => opt.value === formData.actionType)}
                                onChange={(option) => handleFieldChange('actionType', option.value)}
                                placeholder="Select action type"
                            />
                        </Box>

                        {/* Conditional fields based on action type */}
                        {formData.actionType === 'setField' && (
                            <>
                                <Box>
                                    <label htmlFor="action-field-key" style={{
                                        display: 'block',
                                        marginBottom: token('space.050'),
                                        fontWeight: 'bold',
                                        fontSize: '12px'
                                    }}>
                                        Field Key *
                                    </label>
                                    <Select
                                        inputId="action-field-key"
                                        options={jiraFields}
                                        value={jiraFields.find(opt => opt.value === formData.fieldKey)}
                                        onChange={(option) => handleFieldChange('fieldKey', option ? option.value : '')}
                                        placeholder={isLoadingFields ? "Loading fields..." : "Select a Jira field"}
                                        isLoading={isLoadingFields}
                                        isSearchable={true}
                                        isClearable={true}
                                    />
                                    <div style={{
                                        fontSize: '11px',
                                        color: token('color.text.subtlest'),
                                        marginTop: token('space.050')
                                    }}>
                                        The Jira field to update
                                    </div>
                                </Box>

                                <Box>
                                    <label htmlFor="action-field-value" style={{
                                        display: 'block',
                                        marginBottom: token('space.050'),
                                        fontWeight: 'bold',
                                        fontSize: '12px'
                                    }}>
                                        Field Value *
                                    </label>
                                    <Textfield
                                        id="action-field-value"
                                        value={formData.fieldValue || ''}
                                        onChange={(e) => handleFieldChange('fieldValue', e.target.value)}
                                        placeholder="Enter the value to set"
                                    />
                                    <div style={{
                                        fontSize: '11px',
                                        color: token('color.text.subtlest'),
                                        marginTop: token('space.050')
                                    }}>
                                        The value to set for the field
                                    </div>
                                </Box>
                            </>
                        )}

                        {formData.actionType === 'addLabel' && (
                            <Box>
                                <label htmlFor="action-label" style={{
                                    display: 'block',
                                    marginBottom: token('space.050'),
                                    fontWeight: 'bold',
                                    fontSize: '12px'
                                }}>
                                    Label *
                                </label>
                                <Textfield
                                    id="action-label"
                                    value={formData.label || ''}
                                    onChange={(e) => handleFieldChange('label', e.target.value)}
                                    placeholder="Enter label to add"
                                />
                                <div style={{
                                    fontSize: '11px',
                                    color: token('color.text.subtlest'),
                                    marginTop: token('space.050')
                                }}>
                                    The label to add to the issue
                                </div>
                            </Box>
                        )}

                        {formData.actionType === 'addComment' && (
                            <Box>
                                <label htmlFor="action-comment" style={{
                                    display: 'block',
                                    marginBottom: token('space.050'),
                                    fontWeight: 'bold',
                                    fontSize: '12px'
                                }}>
                                    Comment Text *
                                </label>
                                <TextArea
                                    id="action-comment"
                                    value={formData.comment || ''}
                                    onChange={(e) => handleFieldChange('comment', e.target.value)}
                                    placeholder="Enter comment text"
                                    resize="auto"
                                    minimumRows={4}
                                />
                                <div style={{
                                    fontSize: '11px',
                                    color: token('color.text.subtlest'),
                                    marginTop: token('space.050')
                                }}>
                                    The comment to add to the issue
                                </div>
                            </Box>
                        )}
                    </Stack>
                );

            default:
                return null;
        }
    };

    /**
     * Main render
     */
    return (
        <Box style={{
            width: '300px',
            backgroundColor: token('elevation.surface.raised'),
            borderLeft: `${token('border.width')} solid ${token('color.border')}`,
            padding: token('space.200'),
            overflowY: 'auto',
            display: 'flex',
            flexDirection: 'column'
        }}>
            {/* Panel Header */}
            <Flex justifyContent="space-between" alignItems="center" style={{ marginBottom: token('space.200') }}>
                <Box style={{ marginBottom: token("space.100") }}>
                    <Heading size="xsmall">Node Properties</Heading>
                    <Text size="small" color="color.text.subtlest">
                        {selectedNode.type.charAt(0).toUpperCase() + selectedNode.type.slice(1)} Node
                    </Text>
                </Box>
                <IconButton
                    onClick={onClose}
                    appearance="subtle"
                    icon={CrossIcon}
                />
            </Flex>

            {/* Properties Form */}
            <Box style={{ flex: 1, marginBottom: token('space.200') }}>
                {renderPropertiesForm()}
            </Box>

            {/* Action Buttons */}
            <Stack space="space.100">
                {selectedNode.type !== 'start' &&
                    <Button
                        appearance="danger"
                        onClick={handleDelete}
                        style={{ width: '100%' }}
                    >
                        Delete Node
                    </Button>
                }
                <Button
                    appearance="subtle"
                    onClick={onClose}
                    style={{ width: '100%' }}
                >
                    Close
                </Button>
            </Stack>
        </Box>
    );
}

export default NodePropertiesPanel;
