import React, { useEffect, useState } from 'react';
import { invoke } from '@forge/bridge';
import DynamicTable from '@atlaskit/dynamic-table';
import Button, { IconButton } from '@atlaskit/button/new';
import Spinner from '@atlaskit/spinner';
import Lozenge from '@atlaskit/lozenge';
import Heading from '@atlaskit/heading';
import SectionMessage from '@atlaskit/section-message';
import { token } from '@atlaskit/tokens';
import EditIcon from '@atlaskit/icon/core/edit';
import TrashIcon from '@atlaskit/icon/core/delete';
import { Box, Text, Stack } from '@atlaskit/primitives';

/**
 * FlowList Component
 * 
 * Displays a list of all decision flows in a table format with actions to create, edit, and delete flows.
 * This component serves as the main landing page for the admin interface.
 */
function FlowList({ onCreateFlow, onEditFlow }) {
    // State management for flows data, loading state, and error handling
    const [flows, setFlows] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    /**
     * Load all flows from the backend on component mount
     */
    useEffect(() => {
        loadFlows();
    }, []);

    /**
     * Fetch flows from the backend using the getFlows resolver
     */
    const loadFlows = async () => {
        setIsLoading(true);
        setError(null);
        try {
            const result = await invoke('getFlows');
            setFlows(result || []);
        } catch (err) {
            console.error('Error loading flows:', err);
            setError('Failed to load flows. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    /**
     * Handle flow deletion with confirmation
     * @param {string} flowId - The ID of the flow to delete
     * @param {string} flowName - The name of the flow (for confirmation message)
     */
    const handleDelete = async (flowId, flowName) => {
        // Confirm deletion with the user
        if (!window.confirm(`Are you sure you want to delete the flow "${flowName}"? This action cannot be undone.`)) {
            return;
        }

        try {
            // Call the deleteFlow resolver
            const result = await invoke('deleteFlow', { flowId });
            
            // Check if backend returned an error
            if (result && result.error) {
                setError(`Failed to delete flow: ${result.error}`);
                return;
            }
            
            // Reload the flows list after successful deletion
            await loadFlows();
        } catch (err) {
            console.error('Error deleting flow:', err);
            setError(err.message || 'Failed to delete flow. Please try again.');
        }
    };

    /**
     * Define table header configuration
     */
    const head = {
        cells: [
            {
                key: 'name',
                content: 'Flow Name',
                isSortable: true,
                width: 25,
            },
            {
                key: 'description',
                content: 'Description',
                width: 35,
            },
            {
                key: 'projects',
                content: 'Projects',
                width: 20,
            },
            {
                key: 'actions',
                content: 'Actions',
                width: 20,
            },
        ],
    };

    /**
     * Transform flows data into table rows format
     */
    const rows = flows.map((flow) => ({
        key: flow.id,
        cells: [
            {
                key: 'name',
                content: flow.name,
            },
            {
                key: 'description',
                content: flow.description || '-',
            },
            {
                key: 'projects',
                content: (
                    <Box style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                        {flow.projectKeys && flow.projectKeys.length > 0 ? (
                            flow.projectKeys.map((projectKey) => (
                                <Lozenge key={projectKey} appearance="default">
                                    {projectKey}
                                </Lozenge>
                            ))
                        ) : (
                            '-'
                        )}
                    </Box>
                ),
            },
            {
                key: 'actions',
                content: (
                    <Box style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                        <IconButton
                            icon={EditIcon}
                            label="Edit flow"
                            onClick={() => onEditFlow(flow.id)}
                        />
                        <IconButton
                            icon={TrashIcon}
                            label="Delete flow"
                            onClick={() => handleDelete(flow.id, flow.name)}
                        />
                    </Box>
                ),
            },
        ],
    }));

    /**
     * Render loading state with spinner
     */
    if (isLoading) {
        return (
            <Box style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                minHeight: '400px'
            }}>
                <Spinner size="large" />
            </Box>
        );
    }

    /**
     * Render error state
     */
    if (error && flows.length === 0) {
        return (
            <Box style={{ padding: '20px' }}>
                <Stack space="space.300">
                    <SectionMessage appearance="error" title="Error loading flows">
                        <p>{error}</p>
                    </SectionMessage>
                    <Box>
                        <Button appearance="primary" onClick={loadFlows}>
                            Retry
                        </Button>
                    </Box>
                </Stack>
            </Box>
        );
    }

    /**
     * Main render
     */
    return (
        <Box style={{ padding: '20px' }}>
            {/* Header section with title and create button */}
            <Box style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '20px'
            }}>
                <Heading size="large">Decision Flows</Heading>
                <Button
                    appearance="primary"
                    onClick={onCreateFlow}
                >
                    Create New Flow
                </Button>
            </Box>

            {/* Error message if any (but still show table if we have flows) */}
            {error && flows.length > 0 && (
                <Box style={{ marginBottom: '20px' }}>
                    <SectionMessage appearance="warning">
                        <p>{error}</p>
                    </SectionMessage>
                </Box>
            )}

            {/* Empty state when no flows exist */}
            {flows.length === 0 ? (
                <Box style={{
                    textAlign: 'center',
                    padding: '60px 20px',
                    backgroundColor: token('color.background.input'),
                    borderRadius: '8px'
                }}>
                    <Box style={{ marginBottom: '8px' }}>
                        <Heading size="medium">No flows yet</Heading>
                    </Box>
                    <Box style={{ marginBottom: '20px' }}>
                        <Text as="p" color='color.text.subtle'>
                            Create your first decision flow to get started
                        </Text>
                    </Box>
                    <Button
                        appearance="primary"
                        onClick={onCreateFlow}
                    >
                        Create New Flow
                    </Button>
                </Box>
            ) : (
                /* Table displaying all flows */
                <DynamicTable
                    head={head}
                    rows={rows}
                    rowsPerPage={10}
                    defaultPage={1}
                    isFixedSize
                    defaultSortKey="name"
                    defaultSortOrder="ASC"
                />
            )}
        </Box>
    );
}

export default FlowList;
