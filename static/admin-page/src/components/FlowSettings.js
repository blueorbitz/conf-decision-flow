import { useState, useEffect } from 'react';
import { requestJira } from '@forge/bridge';
import Modal, {
    ModalBody,
    ModalFooter,
    ModalHeader,
    ModalTitle,
    ModalTransition,
} from '@atlaskit/modal-dialog';
import Button from '@atlaskit/button/new';
import Textfield from '@atlaskit/textfield';
import TextArea from '@atlaskit/textarea';
import { ErrorMessage, Field, HelperMessage } from '@atlaskit/form';
import { Stack } from '@atlaskit/primitives';
import Select from '@atlaskit/select';

/**
 * FlowSettings Component
 * 
 * Modal dialog for configuring flow metadata including name, description, and project bindings.
 * 
 * Features:
 * - Flow name input (required)
 * - Flow description textarea (optional)
 * - Project keys input (comma-separated, required)
 * - Form validation
 * - Save and Cancel actions
 * 
 * Props:
 * @param {boolean} isOpen - Controls modal visibility
 * @param {function} onClose - Callback when modal is closed
 * @param {function} onSave - Callback when settings are saved, receives { name, description, projectKeys }
 * @param {Object} initialValues - Initial values for the form { name, description, projectKeys }
 */
function FlowSettings({ isOpen, onClose, onSave, initialValues = {} }) {
    // Form state
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [selectedProjects, setSelectedProjects] = useState([]);

    // Project options state
    const [projectOptions, setProjectOptions] = useState([]);
    const [isLoadingProjects, setIsLoadingProjects] = useState(false);

    // Validation error state
    const [nameError, setNameError] = useState('');
    const [projectKeysError, setProjectKeysError] = useState('');

    /**
     * Fetch projects from Jira API
     */
    const fetchProjects = async (inputValue = '') => {
        setIsLoadingProjects(true);
        try {
            // Use requestJira from @forge/bridge to call the Jira REST API directly
            const response = await requestJira(
                `/rest/api/3/project/search?maxResults=50${inputValue ? `&query=${encodeURIComponent(inputValue)}` : ''}`
            );

            // Parse the JSON response
            const data = await response.json();

            // Transform projects into select options
            const options = data.values.map(project => ({
                label: `${project.name} (${project.key})`,
                value: project.key,
                project: project
            }));

            setProjectOptions(options);
            return options;
        } catch (err) {
            console.error('Error fetching projects:', err);
            return [];
        } finally {
            setIsLoadingProjects(false);
        }
    };

    /**
     * Initialize form values when modal opens or initialValues change
     */
    useEffect(() => {
        if (isOpen) {
            setName(initialValues.name || '');
            setDescription(initialValues.description || '');
            
            // Clear errors when opening
            setNameError('');
            setProjectKeysError('');

            // Fetch projects and set initial selection
            fetchProjects().then(options => {
                // Convert initial project keys to selected options
                if (Array.isArray(initialValues.projectKeys) && initialValues.projectKeys.length > 0) {
                    const selected = options.filter(opt => 
                        initialValues.projectKeys.includes(opt.value)
                    );
                    setSelectedProjects(selected);
                } else {
                    setSelectedProjects([]);
                }
            });
        }
    }, [isOpen, initialValues]);

    /**
     * Validate form inputs
     * @returns {boolean} - True if form is valid, false otherwise
     */
    const validateForm = () => {
        let isValid = true;

        // Validate name (required, non-empty)
        if (!name || name.trim() === '') {
            setNameError('Flow name is required');
            isValid = false;
        } else {
            setNameError('');
        }

        // Validate project selection (required, at least one project)
        if (!selectedProjects || selectedProjects.length === 0) {
            setProjectKeysError('At least one project is required');
            isValid = false;
        } else {
            setProjectKeysError('');
        }

        return isValid;
    };

    /**
     * Handle Save button click
     */
    const handleSave = () => {
        // Validate form
        if (!validateForm()) {
            return;
        }

        // Extract project keys from selected options
        const projectKeys = selectedProjects.map(project => project.value);

        // Call onSave callback with form data
        onSave({
            name: name.trim(),
            description: description.trim(),
            projectKeys
        });

        // Close modal
        onClose();
    };

    /**
     * Handle Cancel button click
     */
    const handleCancel = () => {
        // Reset form state
        setName('');
        setDescription('');
        setSelectedProjects([]);
        setNameError('');
        setProjectKeysError('');

        // Close modal
        onClose();
    };

    /**
     * Handle name input change
     */
    const handleNameChange = (e) => {
        setName(e.target.value);
        // Clear error when user starts typing
        if (nameError) {
            setNameError('');
        }
    };

    /**
     * Handle project selection change
     */
    const handleProjectsChange = (newValue) => {
        setSelectedProjects(newValue || []);
        // Clear error when user makes a selection
        if (projectKeysError) {
            setProjectKeysError('');
        }
    };

    /**
     * Handle search input change for projects
     */
    const handleProjectSearch = (inputValue) => {
        if (inputValue) {
            fetchProjects(inputValue);
        }
    };

    return (
        <ModalTransition>
            {isOpen && (
                <Modal onClose={handleCancel} width="medium">
                    <ModalHeader>
                        <ModalTitle>Flow Settings</ModalTitle>
                    </ModalHeader>

                    <ModalBody>
                        <Stack space="space.200">
                            {/* Flow Name Field */}
                            <Field
                                name="name"
                                label="Flow Name"
                                isRequired
                            >
                                {() => (
                                    <>
                                        <Textfield
                                            name="name"
                                            value={name}
                                            onChange={handleNameChange}
                                            placeholder="Enter flow name"
                                            isInvalid={!!nameError}
                                            autoFocus
                                        />
                                        {nameError && <ErrorMessage>{nameError}</ErrorMessage>}
                                        {!nameError && (
                                            <HelperMessage>
                                                A descriptive name for this decision flow
                                            </HelperMessage>
                                        )}
                                    </>
                                )}
                            </Field>

                            {/* Flow Description Field */}
                            <Field
                                name="description"
                                label="Description"
                            >
                                {() => (
                                    <>
                                        <TextArea
                                            name="description"
                                            value={description}
                                            onChange={(e) => setDescription(e.target.value)}
                                            placeholder="Enter flow description (optional)"
                                            minimumRows={3}
                                        />
                                        <HelperMessage>
                                            Optional description to explain the purpose of this flow
                                        </HelperMessage>
                                    </>
                                )}
                            </Field>

                            {/* Project Selection Field */}
                            <Field
                                name="projects"
                                label="Projects"
                                isRequired
                            >
                                {() => (
                                    <>
                                        <Select
                                            inputId="projects"
                                            isMulti
                                            isSearchable
                                            options={projectOptions}
                                            value={selectedProjects}
                                            onChange={handleProjectsChange}
                                            onInputChange={handleProjectSearch}
                                            isLoading={isLoadingProjects}
                                            placeholder="Search and select projects..."
                                            noOptionsMessage={() => 'No projects found'}
                                            className={projectKeysError ? 'select-error' : ''}
                                        />
                                        {projectKeysError && <ErrorMessage>{projectKeysError}</ErrorMessage>}
                                        {!projectKeysError && (
                                            <HelperMessage>
                                                Select one or more Jira projects where this flow will be available
                                            </HelperMessage>
                                        )}
                                    </>
                                )}
                            </Field>
                        </Stack>
                    </ModalBody>

                    <ModalFooter>
                        <Button appearance="subtle" onClick={handleCancel}>
                            Cancel
                        </Button>
                        <Button appearance="primary" onClick={handleSave}>
                            Save
                        </Button>
                    </ModalFooter>
                </Modal>
            )}
        </ModalTransition>
    );
}

export default FlowSettings;
