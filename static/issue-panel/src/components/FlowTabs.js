/**
 * FlowTabs Component
 * 
 * Displays tabs for each applicable flow with color-coded completion status indicators.
 * Each tab shows:
 * - Flow name
 * - Completion status (green for completed, orange for incomplete)
 * 
 * Also provides a view selector for switching between:
 * - Questionnaire view (interactive Q&A)
 * - Flow Diagram view (visual flow representation)
 * - Debugger view (audit logs)
 */

import React, { useState, useEffect } from 'react';
import { invoke } from '@forge/bridge';
import { Box, Stack, Inline, Text } from '@atlaskit/primitives';
import Tabs, { Tab, TabList, TabPanel } from '@atlaskit/tabs';
import Button from '@atlaskit/button/new';
import Spinner from '@atlaskit/spinner';
import { token } from '@atlaskit/tokens';
import QuestionnaireView from './QuestionnaireView';

function FlowTabs({ flows, issueKey, selectedFlowId, currentView, onFlowSelect, onViewChange }) {
  // Track completion status for each flow
  const [completionStatus, setCompletionStatus] = useState({});
  const [loadingStatus, setLoadingStatus] = useState(true);

  // Load execution state for all flows to determine completion status
  useEffect(() => {
    const loadCompletionStatus = async () => {
      if (!issueKey || flows.length === 0) {
        setLoadingStatus(false);
        return;
      }

      try {
        setLoadingStatus(true);
        const statusMap = {};

        // Load execution state for each flow
        for (const flow of flows) {
          try {
            const executionState = await invoke('getExecutionState', {
              issueKey,
              flowId: flow.id
            });
            // Mark as completed if execution state indicates completion
            statusMap[flow.id] = executionState?.completed || false;
          } catch (err) {
            console.error(`Error loading status for flow ${flow.id}:`, err);
            // Default to incomplete if we can't load status
            statusMap[flow.id] = false;
          }
        }

        setCompletionStatus(statusMap);
        setLoadingStatus(false);
      } catch (err) {
        console.error('Error loading completion status:', err);
        setLoadingStatus(false);
      }
    };

    loadCompletionStatus();
  }, [flows, issueKey]);

  // Get the color for a flow tab based on completion status
  const getTabColor = (flowId) => {
    if (loadingStatus) return '#6B778C'; // Neutral gray while loading
    return completionStatus[flowId] ? '#36B37E' : '#FF991F'; // Green for completed, orange for incomplete
  };

  // Get the currently selected flow object
  const selectedFlow = flows.find(flow => flow.id === selectedFlowId);

  // Render tab label with completion indicator
  const renderTabLabel = (flow) => {
    const color = getTabColor(flow.id);
    return (
      <Inline space="space.100" alignBlock="center">
        {/* Color-coded status indicator dot */}
        <Box
          style={{
            width: '8px',
            height: '8px',
            borderRadius: '50%',
            backgroundColor: color,
            display: 'inline-block'
          }}
        />
        <span>{flow.name}</span>
      </Inline>
    );
  };

  // Handle tab change
  const handleTabChange = (index) => {
    const flow = flows[index];
    if (flow) {
      onFlowSelect(flow.id);
    }
  };

  // Get the index of the currently selected flow
  const selectedIndex = flows.findIndex(flow => flow.id === selectedFlowId);

  return (
    <Stack space="space.100">
      {/* Flow tabs */}
      <Tabs
        id="flow-tabs"
        selected={selectedIndex >= 0 ? selectedIndex : 0}
        onChange={handleTabChange}
      >
        <TabList>
          {flows.map((flow) => (
            <Tab key={flow.id}>
              {renderTabLabel(flow)}
            </Tab>
          ))}
        </TabList>

        {/* Tab panels - one for each flow */}
        {flows.map((flow) => (
          <TabPanel key={flow.id}>
            {flow.id === selectedFlowId && (
              <Stack space="space.050">
                {/* Flow description if available */}
                {flow.description && (
                  <Box padding="space.100">
                    <Text color="color.text.accent.gray">{flow.description}</Text>
                  </Box>
                )}

                {/* View selector buttons */}
                <Box padding="space.100">
                  <Inline space="space.050">
                    <Button
                      appearance={currentView === 'questionnaire' ? 'primary' : 'default'}
                      onClick={() => onViewChange('questionnaire')}
                    >
                      Questionnaire
                    </Button>
                    <Button
                      appearance={currentView === 'diagram' ? 'primary' : 'default'}
                      onClick={() => onViewChange('diagram')}
                    >
                      Flow Diagram
                    </Button>
                    <Button
                      appearance={currentView === 'debugger' ? 'primary' : 'default'}
                      onClick={() => onViewChange('debugger')}
                    >
                      Debugger
                    </Button>
                  </Inline>
                </Box>

                {/* View content */}
                <Box padding="space.100">
                  {loadingStatus ? (
                    <Stack alignInline="center" space="space.200">
                      <Spinner size="medium" />
                      <span>Loading flow status...</span>
                    </Stack>
                  ) : (
                    <>
                      {/* Questionnaire View */}
                      {currentView === 'questionnaire' && (
                        <QuestionnaireView
                          issueKey={issueKey}
                          flow={flow}
                          onStateChange={(state) => {
                            // Update completion status when state changes
                            setCompletionStatus(prev => ({
                              ...prev,
                              [flow.id]: state?.completed || false
                            }));
                          }}
                        />
                      )}

                      {/* Flow Diagram View - Placeholder */}
                      {currentView === 'diagram' && (
                        <Box
                          padding="space.400"
                          style={{
                            border: `1px dashed ${token('color.border')}`,
                            borderRadius: '3px',
                            textAlign: 'center'
                          }}
                        >
                          <Text color="color.text.accent.blue">
                            Flow Diagram view will be implemented in a subsequent task
                          </Text>
                        </Box>
                      )}

                      {/* Debugger View - Placeholder */}
                      {currentView === 'debugger' && (
                        <Box
                          padding="space.400"
                          style={{
                            border: `1px dashed ${token('color.border')}`,
                            borderRadius: '3px',
                            textAlign: 'center'
                          }}
                        >
                          <Text color="color.text.accent.blue">
                            Debugger view will be implemented in a subsequent task
                          </Text>
                        </Box>
                      )}
                    </>
                  )}
                </Box>
              </Stack>
            )}
          </TabPanel>
        ))}
      </Tabs>
    </Stack>
  );
}

export default FlowTabs;
