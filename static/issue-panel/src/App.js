/**
 * Root component for the Decision Flow Builder Issue Panel
 * 
 * This component serves as the main container for the issue panel UI.
 * It retrieves the current issue context, loads applicable flows for the issue's project,
 * and manages the selected flow and current view state.
 */

import React, { useState, useEffect } from 'react';
import { view, invoke } from '@forge/bridge';
import { Box, Stack } from '@atlaskit/primitives';
import Spinner from '@atlaskit/spinner';
import SectionMessage from '@atlaskit/section-message';
import FlowTabs from './components/FlowTabs';

function App() {
  // State management for issue context, flows, and UI state
  const [issueKey, setIssueKey] = useState(null);
  const [flows, setFlows] = useState([]);
  const [selectedFlowId, setSelectedFlowId] = useState(null);
  const [currentView, setCurrentView] = useState('questionnaire'); // 'questionnaire' | 'diagram' | 'debugger'
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Initialize: Get issue context and load applicable flows
  useEffect(() => {
    const initialize = async () => {
      try {
        setLoading(true);
        setError(null);

        // Retrieve the current issue context from Forge
        const context = await view.getContext();
        const currentIssueKey = context.extension.issue.key;
        setIssueKey(currentIssueKey);

        // Load flows applicable to this issue's project
        const applicableFlows = await invoke('getFlowsForIssue', { issueKey: currentIssueKey });
        
        if (applicableFlows && applicableFlows.length > 0) {
          setFlows(applicableFlows);
          // Select the first flow by default
          setSelectedFlowId(applicableFlows[0].id);
        } else {
          setFlows([]);
        }

        setLoading(false);
      } catch (err) {
        console.error('Error initializing issue panel:', err);
        setError(err.message || 'Failed to load flows');
        setLoading(false);
      }
    };

    initialize();
  }, []);

  // Handle flow tab selection
  const handleFlowSelect = (flowId) => {
    setSelectedFlowId(flowId);
    // Reset to questionnaire view when switching flows
    setCurrentView('questionnaire');
  };

  // Handle view selection (questionnaire, diagram, debugger)
  const handleViewChange = (view) => {
    setCurrentView(view);
  };

  // Loading state
  if (loading) {
    return (
      <Box padding="space.400">
        <Stack alignInline="center" space="space.200">
          <Spinner size="large" />
          <Box>Loading flows...</Box>
        </Stack>
      </Box>
    );
  }

  // Error state
  if (error) {
    return (
      <Box padding="space.400">
        <SectionMessage appearance="error" title="Error loading flows">
          <p>{error}</p>
        </SectionMessage>
      </Box>
    );
  }

  // Empty state - no flows bound to this project
  if (flows.length === 0) {
    return (
      <Box padding="space.400">
        <SectionMessage appearance="information" title="No flows available">
          <p>There are no decision flows configured for this project. Contact your Jira administrator to create flows.</p>
        </SectionMessage>
      </Box>
    );
  }

  // Main UI with flow tabs and view selector
  return (
    <Box>
      <FlowTabs
        flows={flows}
        issueKey={issueKey}
        selectedFlowId={selectedFlowId}
        currentView={currentView}
        onFlowSelect={handleFlowSelect}
        onViewChange={handleViewChange}
      />
    </Box>
  );
}

export default App;
