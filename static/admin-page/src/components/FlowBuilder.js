import { useState, useCallback, useEffect, useMemo, useRef } from 'react';
import { invoke } from '@forge/bridge';
import {
    ReactFlow,
    MiniMap,
    Controls,
    Background,
    useNodesState,
    useEdgesState,
    addEdge,
    BackgroundVariant,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import Button from '@atlaskit/button/new';
import Spinner from '@atlaskit/spinner';
import Heading from '@atlaskit/heading';
import SectionMessage from '@atlaskit/section-message';
import { Box, Flex, Stack, Text, xcss } from '@atlaskit/primitives';
import { getGlobalTheme, token } from '@atlaskit/tokens';
import { StartNode, QuestionNode, LogicNode, ActionNode } from './nodes';
import NodePropertiesPanel from './NodePropertiesPanel';
import FlowSettings from './FlowSettings';

/**
 * FlowBuilder Component
 * 
 * Visual flow builder interface for creating and editing decision flows.
 * Provides a drag-and-drop canvas with node palette, properties panel, and toolbar.
 * 
 * Features:
 * - ReactFlow canvas for visual flow design
 * - Node palette for adding different node types (Start, Question, Logic, Action)
 * - Node dragging and edge connection
 * - Settings, Save, and Cancel actions
 * - Integration with backend via @forge/bridge
 * - Custom node components with Atlaskit design tokens
 */
function FlowBuilder({ flowId, onCancel }) {
    // Define custom node types for ReactFlow
    // This maps node type strings to their corresponding React components
    const nodeTypes = useMemo(() => ({
        start: StartNode,
        question: QuestionNode,
        logic: LogicNode,
        action: ActionNode
    }), []);

    // ReactFlow state management for nodes and edges
    const [nodes, setNodes, onNodesChange] = useNodesState([]);
    const [edges, setEdges, onEdgesChange] = useEdgesState([]);

    // Flow metadata state
    const [flowMetadata, setFlowMetadata] = useState({
        name: '',
        description: '',
        projectKeys: []
    });

    // UI state
    const [isLoading, setIsLoading] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [selectedNode, setSelectedNode] = useState(null);
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);
    const [error, setError] = useState(null);
    const [saveError, setSaveError] = useState(null);

    // Counter for generating unique node IDs
    const [nodeIdCounter, setNodeIdCounter] = useState(1);

    // Ref for tracking edge being dragged (for delete-on-drop functionality)
    const edgeReconnectSuccessful = useRef(true);

    /**
     * Fetch flow data from backend
     */
    const loadFlow = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            const flow = await invoke('getFlow', { flowId });
            
            // Check if backend returned an error
            if (flow && flow.error) {
                setError(flow.error);
                setIsLoading(false);
                return;
            }
            
            if (flow) {
                setFlowMetadata({
                    name: flow.name || '',
                    description: flow.description || '',
                    projectKeys: flow.projectKeys || []
                });
                setNodes(flow.nodes || []);
                setEdges(flow.edges || []);

                // Update node ID counter to avoid conflicts
                const maxId = Math.max(
                    0,
                    ...flow.nodes.map(n => {
                        const match = n.id.match(/\d+$/);
                        return match ? parseInt(match[0]) : 0;
                    })
                );
                setNodeIdCounter(maxId + 1);
            }
        } catch (err) {
            console.error('Error loading flow:', err);
            setError(err.message || 'Failed to load flow. Please try again.');
        } finally {
            setIsLoading(false);
        }
    }, [flowId, setNodes, setEdges]);

    /**
     * Add a default Start node to the canvas (for new flows)
     */
    const addStartNode = useCallback(() => {
        const startNode = {
            id: 'start-1',
            type: 'start',
            position: { x: 250, y: 50 },
            data: {
                label: 'Start'
            }
        };
        setNodes([startNode]);
        setNodeIdCounter(2);
    }, [setNodes]);

    /**
     * Load existing flow data when editing (flowId is provided)
     */
    useEffect(() => {
        if (flowId) {
            loadFlow();
        } else {
            // For new flows, add a default Start node
            addStartNode();
        }
    }, [flowId, loadFlow, addStartNode]);

    /**
     * Validate edge connections
     * Ensures that each source handle can only have one outgoing edge
     * @param {Object} connection - The connection being validated
     * @returns {boolean} - True if connection is valid, false otherwise
     */
    const isValidConnection = useCallback(
        (connection) => {
            // Check if the source handle already has an outgoing edge
            const sourceHasEdge = edges.some(
                (edge) => edge.source === connection.source && edge.sourceHandle === connection.sourceHandle
            );

            // Return false if source already has an edge (prevent multiple outgoing edges from same handle)
            return !sourceHasEdge;
        },
        [edges]
    );

    /**
     * Handle edge connections between nodes
     * Uses isValidConnection to ensure each source handle can only have one outgoing edge
     */
    const onConnect = useCallback(
        (params) => setEdges((eds) => addEdge(params, eds)),
        [setEdges]
    );

    /**
     * Handle node selection
     */
    const onNodeClick = useCallback((_event, node) => {
        setSelectedNode(node);
    }, []);

    /**
     * Handle pane click (clicking on canvas background)
     * Deselects the current node and closes the properties panel
     */
    const onPaneClick = useCallback(() => {
        setSelectedNode(null);
    }, []);

    /**
     * Handle edge reconnect start
     * Called when user starts dragging an edge to reconnect it
     */
    const onReconnectStart = useCallback(() => {
        edgeReconnectSuccessful.current = false;
    }, []);

    /**
     * Handle edge reconnect
     * Called when user successfully reconnects an edge to a new target
     * @param {Object} oldEdge - The original edge being reconnected
     * @param {Object} newConnection - The new connection parameters
     */
    const onReconnect = useCallback(
        (oldEdge, newConnection) => {
            edgeReconnectSuccessful.current = true;
            setEdges((els) => {
                // Remove the old edge and add the new connection
                const filteredEdges = els.filter((e) => e.id !== oldEdge.id);
                return addEdge(newConnection, filteredEdges);
            });
        },
        [setEdges]
    );

    /**
     * Handle edge reconnect end
     * Called when user finishes dragging an edge
     * If the edge wasn't successfully reconnected, delete it
     * @param {Event} _ - The event object (unused)
     * @param {Object} edge - The edge that was being dragged
     */
    const onReconnectEnd = useCallback(
        (_, edge) => {
            if (!edgeReconnectSuccessful.current) {
                // Edge was dropped without reconnecting - delete it
                setEdges((eds) => eds.filter((e) => e.id !== edge.id));
            }

            edgeReconnectSuccessful.current = true;
        },
        [setEdges]
    );

    /**
     * Update node data in real-time
     * @param {string} nodeId - ID of the node to update
     * @param {Object} newData - New data object for the node
     */
    const handleUpdateNode = useCallback((nodeId, newData) => {
        setNodes((nds) =>
            nds.map((node) => {
                if (node.id === nodeId) {
                    return {
                        ...node,
                        data: newData
                    };
                }
                return node;
            })
        );

        // Update selected node to reflect changes
        setSelectedNode((prevSelected) => {
            if (prevSelected && prevSelected.id === nodeId) {
                return {
                    ...prevSelected,
                    data: newData
                };
            }
            return prevSelected;
        });
    }, [setNodes]);

    /**
     * Delete a node and its connected edges
     * @param {string} nodeId - ID of the node to delete
     */
    const handleDeleteNode = useCallback((nodeId) => {
        // Remove the node
        setNodes((nds) => nds.filter((node) => node.id !== nodeId));

        // Remove all edges connected to this node
        setEdges((eds) => eds.filter((edge) => edge.source !== nodeId && edge.target !== nodeId));

        // Clear selection
        setSelectedNode(null);
    }, [setNodes, setEdges]);

    /**
     * Add a new node to the canvas
     * @param {string} nodeType - Type of node to add (start, question, logic, action)
     */
    const addNode = (nodeType) => {
        const id = `${nodeType}-${nodeIdCounter}`;
        setNodeIdCounter(nodeIdCounter + 1);

        // Calculate position (offset from center, staggered)
        const position = {
            x: 250 + (nodeIdCounter * 20),
            y: 150 + (nodeIdCounter * 20)
        };

        let newNode;

        switch (nodeType) {
            case 'start':
                newNode = {
                    id,
                    type: 'start',
                    position,
                    data: {
                        label: 'Start'
                    }
                };
                break;

            case 'question':
                newNode = {
                    id,
                    type: 'question',
                    position,
                    data: {
                        question: 'Enter your question',
                        questionType: 'single',
                        options: []
                    }
                };
                break;

            case 'logic':
                newNode = {
                    id,
                    type: 'logic',
                    position,
                    data: {
                        fieldKey: '',
                        operator: 'equals',
                        expectedValue: ''
                    }
                };
                break;

            case 'action':
                newNode = {
                    id,
                    type: 'action',
                    position,
                    data: {
                        actionType: 'setField',
                        fieldKey: '',
                        fieldValue: ''
                    }
                };
                break;

            default:
                return;
        }

        setNodes((nds) => [...nds, newNode]);
    };

    /**
     * Save the flow to the backend
     */
    const handleSave = async () => {
        // Clear previous save errors
        setSaveError(null);
        
        // Validate flow metadata
        if (!flowMetadata.name || flowMetadata.name.trim() === '') {
            setSaveError('Please provide a flow name in Settings before saving.');
            return;
        }

        if (!flowMetadata.projectKeys || flowMetadata.projectKeys.length === 0) {
            setSaveError('Please bind the flow to at least one project in Settings before saving.');
            return;
        }

        setIsSaving(true);
        try {
            const flowData = {
                id: flowId || `flow-${Date.now()}`,
                name: flowMetadata.name,
                description: flowMetadata.description,
                projectKeys: flowMetadata.projectKeys,
                nodes,
                edges,
                createdAt: flowId ? undefined : new Date().toISOString(),
                updatedAt: new Date().toISOString()
            };

            const result = await invoke('saveFlow', { flow: flowData });
            
            // Check if backend returned an error
            if (result && result.error) {
                setSaveError(result.error);
                setIsSaving(false);
                return;
            }
            
            // Success - return to list view
            onCancel();
        } catch (err) {
            console.error('Error saving flow:', err);
            setSaveError(err.message || 'Failed to save flow. Please try again.');
        } finally {
            setIsSaving(false);
        }
    };

    /**
     * Handle Settings button click
     * Opens the FlowSettings modal
     */
    const handleSettings = () => {
        setIsSettingsOpen(true);
    };

    /**
     * Handle settings save
     * Updates flow metadata with values from the modal
     * @param {Object} settings - Settings object with name, description, and projectKeys
     */
    const handleSettingsSave = (settings) => {
        setFlowMetadata({
            name: settings.name,
            description: settings.description,
            projectKeys: settings.projectKeys
        });
    };

    /**
     * Render loading state
     */
    if (isLoading) {
        return (
            <Box style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                minHeight: '600px'
            }}>
                <Stack space="space.200" alignInline="center">
                    <Spinner size="large" />
                    <Text>Loading flow...</Text>
                </Stack>
            </Box>
        );
    }

    /**
     * Render error state
     */
    if (error) {
        return (
            <Box style={{ padding: '20px' }}>
                <Stack space="space.300">
                    <SectionMessage appearance="error" title="Error loading flow">
                        <p>{error}</p>
                    </SectionMessage>
                    <Flex gap="space.100">
                        <Button appearance="primary" onClick={loadFlow}>
                            Retry
                        </Button>
                        <Button appearance="subtle" onClick={onCancel}>
                            Back to List
                        </Button>
                    </Flex>
                </Stack>
            </Box>
        );
    }

    /**
     * Main render
     */
    return (
        <Box style={{ height: '100vh', display: 'flex', flexDirection: 'column', padding: token('space.200') }}>
            {/* Top Toolbar */}
            <Stack space="space.0">
                <Flex
                    xcss={xcss({
                        padding: token('space.150'),
                        backgroundColor: token('elevation.surface'),
                        borderBottom: `${token('border.width')} solid ${token('color.border')}`,
                    })}
                    justifyContent="space-between"
                    alignItems="center"
                    gap="space.150"
                >
                    <Box>
                        <Heading size="small">
                            {flowId ? `Edit Flow: ${flowMetadata.name || 'Untitled'}` : 'Create New Flow'}
                        </Heading>
                    </Box>

                    <Flex gap="space.100">
                        <Button
                            appearance="subtle"
                            onClick={handleSettings}
                        >
                            Settings
                        </Button>
                        <Button
                            appearance="primary"
                            onClick={handleSave}
                            isDisabled={isSaving}
                        >
                            {isSaving ? 'Saving...' : 'Save'}
                        </Button>
                        <Button
                            appearance="subtle"
                            onClick={onCancel}
                            isDisabled={isSaving}
                        >
                            Cancel
                        </Button>
                    </Flex>
                </Flex>

                {/* Save Error Message */}
                {saveError && (
                    <Box padding="space.150">
                        <SectionMessage appearance="error" title="Save failed">
                            <p>{saveError}</p>
                        </SectionMessage>
                    </Box>
                )}
            </Stack>

            {/* Main Content Area */}
            <Box style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
                {/* Node Palette Sidebar */}
                <Box style={{
                    width: '200px',
                    backgroundColor: token('elevation.surface.raised'),
                    borderRight: `${token('border.width')} solid ${token('color.border')}`,
                    padding: token('space.200'),
                    overflowY: 'auto'
                }}>
                    <Heading size="xsmall">Node Palette</Heading>

                    <Stack space="space.100" xcss={xcss({ marginTop: token('space.150') })}>
                        <Button
                            appearance="default"
                            onClick={() => addNode('start')}
                        >
                            🚀 Start
                        </Button>

                        <Button
                            appearance="default"
                            onClick={() => addNode('question')}
                        >
                            ❓ Question
                        </Button>

                        <Button
                            appearance="default"
                            onClick={() => addNode('logic')}
                        >
                            ⚡ Logic
                        </Button>

                        <Button
                            appearance="default"
                            onClick={() => addNode('action')}
                        >
                            ⚙️ Action
                        </Button>
                    </Stack>

                    {/* Info section */}
                    <Box style={{
                        marginTop: token('space.300'),
                        padding: token('space.150'),
                        backgroundColor: token('color.background.information'),
                        borderRadius: token('border.radius')
                    }}>
                        <Box style={{ fontWeight: 'bold', fontSize: '12px', marginBottom: token('space.100') }}>
                            <Text weight="bold">How to use:</Text>
                        </Box>
                        <ul style={{
                            margin: 0,
                            paddingLeft: token('space.200'),
                            fontSize: '12px',
                            lineHeight: 1.5
                        }}>
                            <li><Text>Click a node type to add it to the canvas</Text></li>
                            <li><Text>Drag nodes to reposition them</Text></li>
                            <li><Text>Drag from a node&apos;s edge to another node to connect them</Text></li>
                            <li><Text>Drag an edge and drop it on empty space to delete it</Text></li>
                            <li><Text>Each source handle can only have one outgoing edge</Text></li>
                            <li><Text>Click Settings to configure flow metadata</Text></li>
                        </ul>
                    </Box>
                </Box>

                {/* ReactFlow Canvas */}
                <Box style={{ flex: 1 }}>
                    <ReactFlow
                        nodes={nodes}
                        edges={edges}
                        onNodesChange={onNodesChange}
                        onEdgesChange={onEdgesChange}
                        onConnect={onConnect}
                        onNodeClick={onNodeClick}
                        onPaneClick={onPaneClick}
                        onReconnect={onReconnect}
                        onReconnectStart={onReconnectStart}
                        onReconnectEnd={onReconnectEnd}
                        isValidConnection={isValidConnection}
                        nodeTypes={nodeTypes}
                        colorMode={getGlobalTheme().colorMode}
                        fitView
                        attributionPosition="top-left"
                    >
                        <Controls />
                        <MiniMap />
                        <Background variant={BackgroundVariant.Dots} gap={12} size={1} />
                    </ReactFlow>
                </Box>

                {/* Node Properties Panel */}
                {selectedNode !== null &&
                    <NodePropertiesPanel
                        selectedNode={{ ...selectedNode, flowNodes: nodes }}
                        onUpdateNode={handleUpdateNode}
                        onDeleteNode={handleDeleteNode}
                        onClose={() => setSelectedNode(null)}
                    />}
            </Box>

            {/* Flow Settings Modal */}
            <FlowSettings
                isOpen={isSettingsOpen}
                onClose={() => setIsSettingsOpen(false)}
                onSave={handleSettingsSave}
                initialValues={flowMetadata}
            />
        </Box>
    );
}

export default FlowBuilder;
