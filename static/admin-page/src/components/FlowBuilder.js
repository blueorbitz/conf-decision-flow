import { useState, useCallback, useEffect, useMemo } from 'react';
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
import { Box, Flex, Stack, xcss } from '@atlaskit/primitives';
import { getGlobalTheme, token } from '@atlaskit/tokens';
import { StartNode, QuestionNode, LogicNode, ActionNode } from './nodes';

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
    
    // Counter for generating unique node IDs
    const [nodeIdCounter, setNodeIdCounter] = useState(1);

    /**
     * Fetch flow data from backend
     */
    const loadFlow = useCallback(async () => {
        setIsLoading(true);
        try {
            const flow = await invoke('getFlow', { flowId });
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
            alert('Failed to load flow. Please try again.');
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
     * Handle edge connections between nodes
     */
    const onConnect = useCallback(
        (params) => setEdges((eds) => addEdge(params, eds)),
        [setEdges]
    );

    /**
     * Handle node selection
     */
    const onNodeClick = useCallback((_event, _node) => {
        // Node selection logic will be implemented in future tasks
    }, []);

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
        // Validate flow metadata
        if (!flowMetadata.name || flowMetadata.name.trim() === '') {
            alert('Please provide a flow name in Settings before saving.');
            return;
        }

        if (!flowMetadata.projectKeys || flowMetadata.projectKeys.length === 0) {
            alert('Please bind the flow to at least one project in Settings before saving.');
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

            await invoke('saveFlow', { flow: flowData });
            alert('Flow saved successfully!');
            onCancel(); // Return to list view
        } catch (err) {
            console.error('Error saving flow:', err);
            alert('Failed to save flow. Please try again.');
        } finally {
            setIsSaving(false);
        }
    };

    /**
     * Handle Settings button click
     */
    const handleSettings = () => {
        // Settings modal will be implemented in a future task
        // For now, use a simple prompt
        const name = prompt('Flow Name:', flowMetadata.name);
        if (name !== null) {
            const description = prompt('Flow Description (optional):', flowMetadata.description);
            const projectKeysStr = prompt('Project Keys (comma-separated):', flowMetadata.projectKeys.join(', '));
            
            if (projectKeysStr !== null) {
                const projectKeys = projectKeysStr
                    .split(',')
                    .map(key => key.trim())
                    .filter(key => key.length > 0);
                
                setFlowMetadata({
                    name: name || '',
                    description: description || '',
                    projectKeys
                });
            }
        }
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
                <Spinner size="large" />
            </Box>
        );
    }

    /**
     * Main render
     */
    return (
         <Box style={{ height: '100vh', display: 'flex', flexDirection: 'column', padding: token('space.200') }}>
            {/* Top Toolbar */}
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
                            How to use:
                        </Box>
                        <ul style={{ 
                            margin: 0, 
                            paddingLeft: token('space.200'), 
                            fontSize: '12px',
                            lineHeight: 1.5
                        }}>
                            <li>Click a node type to add it to the canvas</li>
                            <li>Drag nodes to reposition them</li>
                            <li>Drag from a node&apos;s edge to another node to connect them</li>
                            <li>Click Settings to configure flow metadata</li>
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
            </Box>
        </Box>
    );
}

export default FlowBuilder;
