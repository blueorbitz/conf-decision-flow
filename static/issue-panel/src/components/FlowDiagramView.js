/**
 * FlowDiagramView Component
 * 
 * Displays a read-only visual representation of the decision flow with path highlighting.
 * This component shows users where they are in the flow and which nodes they've visited.
 * 
 * Visual Features:
 * - Green highlighting for completed/visited nodes
 * - Blue highlighting for the current node
 * - Gray styling for unvisited nodes
 * - Read-only mode (no editing, dragging, or connecting)
 * - Zoom and pan controls enabled
 * 
 * The component uses the same node types as the admin flow builder but in read-only mode.
 * It loads the execution state to determine which nodes have been visited and which is current.
 */

import { useState, useEffect, useCallback } from 'react';
import { invoke } from '@forge/bridge';
import { ReactFlow, Background, Controls, MiniMap } from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { Box, Stack } from '@atlaskit/primitives';
import Spinner from '@atlaskit/spinner';
import SectionMessage from '@atlaskit/section-message';
import { getGlobalTheme, token } from '@atlaskit/tokens';

// Import custom node components (we'll create read-only versions)
import StartNode from './nodes/StartNode';
import QuestionNode from './nodes/QuestionNode';
import LogicNode from './nodes/LogicNode';
import ActionNode from './nodes/ActionNode';

// Define node types for ReactFlow
const nodeTypes = {
  start: StartNode,
  question: QuestionNode,
  logic: LogicNode,
  action: ActionNode,
};

function FlowDiagramView({ issueKey, flow }) {
  // State management
  const [nodes, setNodes] = useState([]);
  const [edges, setEdges] = useState([]);
  const [executionState, setExecutionState] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Load execution state and prepare nodes/edges with highlighting
  useEffect(() => {
    loadFlowDiagram();
  }, [issueKey, flow.id]);

  /**
   * Load execution state and apply visual highlighting to nodes and edges
   */
  const loadFlowDiagram = async () => {
    try {
      setLoading(true);
      setError(null);

      // Get execution state from backend
      const state = await invoke('getExecutionState', {
        issueKey,
        flowId: flow.id
      });

      setExecutionState(state);

      // Prepare nodes with highlighting based on execution state
      const visitedNodeIds = state?.path || [];
      const currentNodeId = state?.currentNodeId;

      // Apply styling to nodes based on their status
      const styledNodes = flow.nodes.map(node => {
        const isVisited = visitedNodeIds.includes(node.id);
        const isCurrent = node.id === currentNodeId;

        // Determine node style based on status
        let style = {
          ...node.style,
        };

        // Apply highlighting
        if (isCurrent) {
          // Current node - blue border
          style = {
            ...style,
            border: '3px solid #0052CC',
            boxShadow: '0 0 10px rgba(0, 82, 204, 0.5)',
          };
        } else if (isVisited) {
          // Visited node - green border
          style = {
            ...style,
            border: '3px solid #36B37E',
            boxShadow: '0 0 10px rgba(54, 179, 126, 0.3)',
          };
        } else {
          // Unvisited node - gray/neutral
          style = {
            ...style,
            opacity: 0.5,
          };
        }

        return {
          ...node,
          style,
          // Disable dragging and selection
          draggable: false,
          selectable: false,
        };
      });

      // Apply styling to edges based on whether they're part of the path
      const styledEdges = flow.edges.map(edge => {
        // Check if this edge is part of the visited path
        const sourceVisited = visitedNodeIds.includes(edge.source);
        const targetVisited = visitedNodeIds.includes(edge.target);
        const isInPath = sourceVisited && targetVisited;

        let style = {
          ...edge.style,
        };

        if (isInPath) {
          // Highlight edges that are part of the path
          style = {
            ...style,
            stroke: '#36B37E',
            strokeWidth: 3,
          };
        } else {
          // Dim unvisited edges
          style = {
            ...style,
            opacity: 0.3,
          };
        }

        return {
          ...edge,
          style,
          // Disable interaction
          selectable: false,
        };
      });

      setNodes(styledNodes);
      setEdges(styledEdges);
      setLoading(false);
    } catch (err) {
      console.error('Error loading flow diagram:', err);
      setError(err.message || 'Failed to load flow diagram');
      setLoading(false);
    }
  };

  // Prevent any node/edge changes (read-only mode)
  const onNodesChange = useCallback(() => {
    // Do nothing - read-only mode
  }, []);

  const onEdgesChange = useCallback(() => {
    // Do nothing - read-only mode
  }, []);

  const onConnect = useCallback(() => {
    // Do nothing - read-only mode
  }, []);

  // Loading state
  if (loading) {
    return (
      <Box padding="space.400">
        <Stack alignInline="center" space="space.200">
          <Spinner size="large" />
          <span>Loading flow diagram...</span>
        </Stack>
      </Box>
    );
  }

  // Error state
  if (error) {
    return (
      <Box padding="space.400">
        <SectionMessage appearance="error" title="Error loading diagram">
          <p>{error}</p>
        </SectionMessage>
      </Box>
    );
  }

  // Empty state - no nodes in flow
  if (!nodes || nodes.length === 0) {
    return (
      <Box padding="space.400">
        <SectionMessage appearance="information" title="Empty flow">
          <p>This flow doesn't have any nodes yet.</p>
        </SectionMessage>
      </Box>
    );
  }

  // Main diagram view
  return (
    <Box
      style={{
        width: '100%',
        height: '500px',
        border: `1px solid ${token('color.border')}`,
        borderRadius: '3px',
      }}
    >
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        nodeTypes={nodeTypes}
        // Disable all editing interactions
        nodesDraggable={false}
        nodesConnectable={false}
        elementsSelectable={false}
        // Enable zoom and pan
        zoomOnScroll={true}
        panOnScroll={false}
        panOnDrag={true}
        // Fit view on load
        fitView
        fitViewOptions={{
          padding: 0.2,
          includeHiddenNodes: false,
        }}
        colorMode={getGlobalTheme().colorMode}
      >
        {/* Background grid */}
        <Background />

        {/* Zoom and pan controls */}
        <Controls />

        {/* Mini map for navigation */}
        <MiniMap
          nodeColor={(node) => {
            // Color nodes in minimap based on status
            const isVisited = executionState?.path?.includes(node.id);
            const isCurrent = node.id === executionState?.currentNodeId;

            if (isCurrent) return '#0052CC'; // Blue for current
            if (isVisited) return '#36B37E'; // Green for visited
            return '#DFE1E6'; // Gray for unvisited
          }}
          maskColor="rgba(0, 0, 0, 0.1)"
        />

        {/* Legend */}
        <Box
          padding="space.100"
          style={{
            position: 'absolute',
            top: '10px',
            right: '10px',
            backgroundColor: token('color.background.accent.gray.subtlest'),
            border: `1px solid ${token('color.border')}`,
            borderRadius: '3px',
            fontSize: '12px',
            zIndex: 10,
          }}
        >
          <Stack space="space.050">
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{
                width: '12px',
                height: '12px',
                backgroundColor: '#0052CC',
                border: '1px solid #0052CC',
                borderRadius: '2px',
              }} />
              <span>Current Node</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{
                width: '12px',
                height: '12px',
                backgroundColor: '#36B37E',
                border: '1px solid #36B37E',
                borderRadius: '2px',
              }} />
              <span>Visited Node</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{
                width: '12px',
                height: '12px',
                backgroundColor: '#DFE1E6',
                border: '1px solid #DFE1E6',
                borderRadius: '2px',
              }} />
              <span>Unvisited Node</span>
            </div>
          </Stack>
        </Box>
      </ReactFlow>

    </Box>
  );
}

export default FlowDiagramView;
