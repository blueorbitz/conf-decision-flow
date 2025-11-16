import React, { useState, useCallback, useEffect } from 'react';
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
import { getGlobalTheme, token } from '@atlaskit/tokens';

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
 */
function FlowBuilder({ flowId, onCancel }) {
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
    const [showSettings, setShowSettings] = useState(false);
    
    // Counter for generating unique node IDs
    const [nodeIdCounter, setNodeIdCounter] = useState(1);

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
    }, [flowId]);

    /**
     * Fetch flow data from backend
     */
    const loadFlow = async () => {
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
    };

    /**
     * Add a default Start node to the canvas (for new flows)
     */
    const addStartNode = () => {
        const startNode = {
            id: 'start-1',
            type: 'default',
            position: { x: 250, y: 50 },
            data: { 
                label: '🚀 Start',
                nodeType: 'start'
            },
            style: {
                backgroundColor: token('color.background.success'),
                color: token('color.text.inverse'),
                border: `1px solid ${token('color.border.success')}`,
                borderRadius: '50%',
                width: 80,
                height: 80,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '12px',
                fontWeight: 'bold'
            }
        };
        setNodes([startNode]);
        setNodeIdCounter(2);
    };

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
    const onNodeClick = useCallback((event, node) => {
        setSelectedNode(node);
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
                    type: 'default',
                    position,
                    data: { 
                        label: '🚀 Start',
                        nodeType: 'start'
                    },
                    style: {
                        backgroundColor: token('color.background.success'),
                        color: token('color.text.inverse'),
                        border: `2px solid ${token('color.border.success')}`,
                        borderRadius: '50%',
                        width: 80,
                        height: 80,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '14px',
                        fontWeight: 'bold'
                    }
                };
                break;

            case 'question':
                newNode = {
                    id,
                    type: 'default',
                    position,
                    data: { 
                        label: '❓ Question',
                        nodeType: 'question',
                        question: 'Enter your question',
                        questionType: 'single',
                        options: []
                    },
                    style: {
                        backgroundColor: token('color.background.information'),
                        color: token('color.text'),
                        border: `2px solid ${token('color.border.information')}`,
                        borderRadius: '8px',
                        padding: '12px',
                        minWidth: 150
                    }
                };
                break;

            case 'logic':
                newNode = {
                    id,
                    type: 'default',
                    position,
                    data: { 
                        label: '⚡ Logic',
                        nodeType: 'logic',
                        fieldKey: '',
                        operator: 'equals',
                        expectedValue: ''
                    },
                    style: {
                        backgroundColor: token('color.background.discovery'),
                        color: token('color.text'),
                        border: `2px solid ${token('color.border.discovery')}`,
                        borderRadius: '8px',
                        padding: '12px',
                        minWidth: 150
                    }
                };
                break;

            case 'action':
                newNode = {
                    id,
                    type: 'default',
                    position,
                    data: { 
                        label: '⚙️ Action',
                        nodeType: 'action',
                        actionType: 'setField',
                        fieldKey: '',
                        fieldValue: ''
                    },
                    style: {
                        backgroundColor: token('color.background.warning'),
                        color: token('color.text'),
                        border: `2px solid ${token('color.border.warning')}`,
                        borderRadius: '8px',
                        padding: '12px',
                        minWidth: 150
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
            setShowSettings(true);
            return;
        }

        if (!flowMetadata.projectKeys || flowMetadata.projectKeys.length === 0) {
            alert('Please bind the flow to at least one project in Settings before saving.');
            setShowSettings(true);
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
        setShowSettings(true);
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
        setShowSettings(false);
    };

    /**
     * Render loading state
     */
    if (isLoading) {
        return (
            <div style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                minHeight: '600px'
            }}>
                <Spinner size="large" />
            </div>
        );
    }

    /**
     * Main render
     */
    return (
        <div style={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
            {/* Top Toolbar */}
            <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '12px 20px',
                backgroundColor: token('elevation.surface'),
                borderBottom: `1px solid ${token('color.border')}`,
                gap: '12px'
            }}>
                <div>
                    <h2 style={{ margin: 0, fontSize: '18px' }}>
                        {flowId ? `Edit Flow: ${flowMetadata.name || 'Untitled'}` : 'Create New Flow'}
                    </h2>
                </div>
                
                <div style={{ display: 'flex', gap: '8px' }}>
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
                </div>
            </div>

            {/* Main Content Area */}
            <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
                {/* Node Palette Sidebar */}
                <div style={{
                    width: '200px',
                    backgroundColor: token('elevation.surface.raised'),
                    borderRight: `1px solid ${token('color.border')}`,
                    padding: '16px',
                    overflowY: 'auto'
                }}>
                    <h3 style={{ 
                        fontSize: '14px', 
                        fontWeight: 'bold',
                        marginTop: 0,
                        marginBottom: '12px',
                        color: token('color.text.subtle')
                    }}>
                        Node Palette
                    </h3>
                    
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        <Button
                            appearance="default"
                            onClick={() => addNode('start')}
                            style={{ justifyContent: 'flex-start' }}
                        >
                            🚀 Start
                        </Button>
                        
                        <Button
                            appearance="default"
                            onClick={() => addNode('question')}
                            style={{ justifyContent: 'flex-start' }}
                        >
                            ❓ Question
                        </Button>
                        
                        <Button
                            appearance="default"
                            onClick={() => addNode('logic')}
                            style={{ justifyContent: 'flex-start' }}
                        >
                            ⚡ Logic
                        </Button>
                        
                        <Button
                            appearance="default"
                            onClick={() => addNode('action')}
                            style={{ justifyContent: 'flex-start' }}
                        >
                            ⚙️ Action
                        </Button>
                    </div>

                    {/* Info section */}
                    <div style={{
                        marginTop: '24px',
                        padding: '12px',
                        backgroundColor: token('color.background.information'),
                        borderRadius: '4px',
                        fontSize: '12px'
                    }}>
                        <p style={{ margin: 0, marginBottom: '8px', fontWeight: 'bold' }}>
                            How to use:
                        </p>
                        <ul style={{ margin: 0, paddingLeft: '16px' }}>
                            <li>Click a node type to add it to the canvas</li>
                            <li>Drag nodes to reposition them</li>
                            <li>Drag from a node's edge to another node to connect them</li>
                            <li>Click Settings to configure flow metadata</li>
                        </ul>
                    </div>
                </div>

                {/* ReactFlow Canvas */}
                <div style={{ flex: 1 }}>
                    <ReactFlow
                        nodes={nodes}
                        edges={edges}
                        onNodesChange={onNodesChange}
                        onEdgesChange={onEdgesChange}
                        onConnect={onConnect}
                        onNodeClick={onNodeClick}
                        colorMode={getGlobalTheme().colorMode}
                        fitView
                        attributionPosition="bottom-left"
                    >
                        <Controls />
                        <MiniMap />
                        <Background variant={BackgroundVariant.Dots} gap={12} size={1} />
                    </ReactFlow>
                </div>
            </div>
        </div>
    );
}

export default FlowBuilder;
