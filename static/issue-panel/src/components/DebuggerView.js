/**
 * DebuggerView Component
 * 
 * Displays audit logs for a decision flow execution in a tabular format.
 * This component provides visibility into all actions that have been executed
 * during the flow, including timestamps, node information, action details,
 * results, and user answers at the time of execution.
 * 
 * Features:
 * - Displays audit logs in a DynamicTable with sortable columns
 * - Shows timestamp, node ID, action type, result status, and answers
 * - Provides a refresh button to reload the latest audit logs
 * - Displays empty state when no audit logs exist
 * - Formats timestamps and action details for readability
 */

import React, { useState, useEffect } from 'react';
import { invoke } from '@forge/bridge';
import { Box, Stack, Inline } from '@atlaskit/primitives';
import Button from '@atlaskit/button/new';
import Spinner from '@atlaskit/spinner';
import SectionMessage from '@atlaskit/section-message';
import DynamicTable from '@atlaskit/dynamic-table';
import Lozenge from '@atlaskit/lozenge';

function DebuggerView({ issueKey, flow }) {
  // State management
  const [auditLogs, setAuditLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  // Load audit logs on component mount
  useEffect(() => {
    loadAuditLogs();
  }, [issueKey, flow.id]);

  /**
   * Load audit logs from the backend
   */
  const loadAuditLogs = async () => {
    try {
      setLoading(true);
      setError(null);

      // Get audit logs from backend
      const logs = await invoke('getAuditLogs', {
        issueKey,
        flowId: flow.id
      });

      // Check if backend returned an error
      if (logs && logs.error) {
        setError(logs.error);
        setAuditLogs([]);
      } else {
        // Ensure logs is an array
        setAuditLogs(Array.isArray(logs) ? logs : []);
      }

      setLoading(false);
    } catch (err) {
      console.error('Error loading audit logs:', err);
      setError(err.message || 'Failed to load audit logs');
      setAuditLogs([]);
      setLoading(false);
    }
  };

  /**
   * Handle refresh button click
   * Reloads audit logs from the backend
   */
  const handleRefresh = async () => {
    try {
      setRefreshing(true);
      setError(null);

      // Get audit logs from backend
      const logs = await invoke('getAuditLogs', {
        issueKey,
        flowId: flow.id
      });

      // Check if backend returned an error
      if (logs && logs.error) {
        setError(logs.error);
        setAuditLogs([]);
      } else {
        // Ensure logs is an array
        setAuditLogs(Array.isArray(logs) ? logs : []);
      }

      setRefreshing(false);
    } catch (err) {
      console.error('Error refreshing audit logs:', err);
      setError(err.message || 'Failed to refresh audit logs');
      setRefreshing(false);
    }
  };

  /**
   * Format timestamp for display
   * @param {string} timestamp - ISO timestamp string
   * @returns {string} Formatted timestamp
   */
  const formatTimestamp = (timestamp) => {
    try {
      const date = new Date(timestamp);
      return date.toLocaleString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      });
    } catch (err) {
      return timestamp;
    }
  };

  /**
   * Get node label from flow nodes
   * @param {string} nodeId - The node ID
   * @returns {string} Node label or ID
   */
  const getNodeLabel = (nodeId) => {
    const node = flow.nodes.find(n => n.id === nodeId);
    return node?.data?.label || nodeId;
  };

  /**
   * Format action details for display
   * @param {Object} action - The action object
   * @returns {string} Formatted action description
   */
  const formatActionDetails = (action) => {
    if (!action) return 'Unknown action';

    const { actionType, fieldKey, fieldValue, label, comment } = action;

    switch (actionType) {
      case 'setField':
        return `Set field "${fieldKey}" to "${fieldValue}"`;
      case 'addLabel':
        return `Add label "${label}"`;
      case 'addComment':
        return `Add comment: "${comment?.substring(0, 50)}${comment?.length > 50 ? '...' : ''}"`;
      default:
        return actionType || 'Unknown action';
    }
  };

  /**
   * Format result for display
   * @param {Object} result - The result object
   * @returns {JSX.Element} Formatted result with status indicator
   */
  const formatResult = (result) => {
    if (!result) {
      return <Lozenge appearance="default">Unknown</Lozenge>;
    }

    if (result.success) {
      return <Lozenge appearance="success">Success</Lozenge>;
    } else {
      return (
        <Inline space="space.050" alignBlock="center">
          <Lozenge appearance="removed">Failed</Lozenge>
          {result.error && (
            <span style={{ fontSize: '12px', color: '#DE350B' }}>
              {result.error}
            </span>
          )}
        </Inline>
      );
    }
  };

  /**
   * Format answers for display
   * @param {Object} answers - The answers object
   * @returns {string} Formatted answers summary
   */
  const formatAnswers = (answers) => {
    if (!answers || Object.keys(answers).length === 0) {
      return 'No answers';
    }

    // Create a summary of answers
    const answerCount = Object.keys(answers).length;
    const answerSummary = Object.entries(answers)
      .slice(0, 2) // Show first 2 answers
      .map(([nodeId, answer]) => {
        const node = flow.nodes.find(n => n.id === nodeId);
        const nodeLabel = node?.data?.label || nodeId;
        const answerStr = Array.isArray(answer) ? answer.join(', ') : String(answer);
        return `${nodeLabel}: ${answerStr.substring(0, 30)}${answerStr.length > 30 ? '...' : ''}`;
      })
      .join('; ');

    if (answerCount > 2) {
      return `${answerSummary}; +${answerCount - 2} more`;
    }

    return answerSummary;
  };

  /**
   * Create table head configuration
   */
  const head = {
    cells: [
      {
        key: 'timestamp',
        content: 'Timestamp',
        isSortable: true,
        width: 20,
      },
      {
        key: 'node',
        content: 'Node',
        isSortable: false,
        width: 15,
      },
      {
        key: 'actionType',
        content: 'Action Type',
        isSortable: false,
        width: 25,
      },
      {
        key: 'result',
        content: 'Result',
        isSortable: false,
        width: 15,
      },
      {
        key: 'answers',
        content: 'Answers',
        isSortable: false,
        width: 25,
      },
    ],
  };

  /**
   * Create table rows from audit logs
   * Logs are displayed in reverse chronological order (newest first)
   */
  const rows = auditLogs
    .slice()
    .reverse() // Reverse to show newest first
    .map((log, index) => ({
      key: `log-${index}`,
      cells: [
        {
          key: 'timestamp',
          content: formatTimestamp(log.timestamp),
        },
        {
          key: 'node',
          content: getNodeLabel(log.nodeId),
        },
        {
          key: 'actionType',
          content: formatActionDetails(log.action),
        },
        {
          key: 'result',
          content: formatResult(log.result),
        },
        {
          key: 'answers',
          content: formatAnswers(log.answers),
        },
      ],
    }));

  // Loading state
  if (loading) {
    return (
      <Box padding="space.400">
        <Stack alignInline="center" space="space.200">
          <Spinner size="large" />
          <span>Loading audit logs...</span>
        </Stack>
      </Box>
    );
  }

  // Error state
  if (error && auditLogs.length === 0) {
    return (
      <Box padding="space.400">
        <Stack space="space.300">
          <SectionMessage appearance="error" title="Error loading audit logs">
            <p>{error}</p>
          </SectionMessage>
          <Box>
            <Button
              appearance="primary"
              onClick={handleRefresh}
              isDisabled={refreshing}
            >
              {refreshing ? 'Refreshing...' : 'Retry'}
            </Button>
          </Box>
        </Stack>
      </Box>
    );
  }

  // Empty state - no audit logs
  if (auditLogs.length === 0) {
    return (
      <Box padding="space.400">
        <Stack space="space.300">
          <SectionMessage appearance="information" title="No audit logs">
            <p>
              No actions have been executed yet for this flow. Complete the questionnaire
              to execute actions, and they will appear here.
            </p>
          </SectionMessage>
          <Box>
            <Button
              appearance="default"
              onClick={handleRefresh}
              isDisabled={refreshing}
            >
              {refreshing ? 'Refreshing...' : 'Refresh'}
            </Button>
          </Box>
        </Stack>
      </Box>
    );
  }

  // Main audit log table view
  return (
    <Box padding="space.400">
      <Stack space="space.300">
        {/* Header with refresh button */}
        <Inline space="space.200" alignBlock="center" spread="space-between">
          <Box>
            <strong>Audit Logs ({auditLogs.length})</strong>
          </Box>
          <Button
            appearance="default"
            onClick={handleRefresh}
            isDisabled={refreshing}
          >
            {refreshing ? 'Refreshing...' : 'Refresh'}
          </Button>
        </Inline>

        {/* Error message if any (but still show table) */}
        {error && (
          <SectionMessage appearance="warning">
            <p>{error}</p>
          </SectionMessage>
        )}

        {/* Audit log table */}
        <DynamicTable
          head={head}
          rows={rows}
          rowsPerPage={10}
          defaultPage={1}
          isFixedSize
          defaultSortKey="timestamp"
          defaultSortOrder="DESC"
        />

        {/* Info message about audit logs */}
        <SectionMessage appearance="information">
          <p>
            Audit logs show all actions that have been executed by this flow on this issue.
            Logs are displayed in reverse chronological order (newest first).
          </p>
        </SectionMessage>
      </Stack>
    </Box>
  );
}

export default DebuggerView;
