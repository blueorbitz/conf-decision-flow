import Resolver from '@forge/resolver';
import api, { route } from '@forge/api';
import { storage } from '@forge/api';

const resolver = new Resolver();

resolver.define('getText', (req) => {
    console.log(req);

    return 'Hello, world!';
});

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Generate a unique ID for flows and nodes
 * @returns {string} UUID-like string
 */
function generateId() {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Extract project key from issue key (e.g., "PROJ-123" -> "PROJ")
 * @param {string} issueKey - The Jira issue key
 * @returns {string} The project key
 */
function extractProjectKey(issueKey) {
    return issueKey.split('-')[0];
}

/**
 * Find the start node in a flow
 * @param {Array} nodes - Array of flow nodes
 * @returns {Object|null} The start node or null if not found
 */
function findStartNode(nodes) {
    return nodes.find(node => node.type === 'start') || null;
}

/**
 * Find the next node connected to the current node
 * @param {string} currentNodeId - Current node ID
 * @param {Array} edges - Array of flow edges
 * @param {string} edgeLabel - Optional edge label to filter by (e.g., 'true', 'false')
 * @returns {string|null} Next node ID or null
 */
function findNextNode(currentNodeId, edges, edgeLabel = null) {
    const edge = edges.find(e => 
        e.source === currentNodeId && 
        (edgeLabel === null || e.label === edgeLabel)
    );
    return edge ? edge.target : null;
}

/**
 * Evaluate a logic condition against issue field value
 * @param {any} fieldValue - The actual field value from the issue
 * @param {string} operator - Comparison operator
 * @param {any} expectedValue - The expected value to compare against
 * @returns {boolean} Result of the comparison
 */
function evaluateCondition(fieldValue, operator, expectedValue) {
    switch (operator) {
        case 'equals':
            return fieldValue == expectedValue;
        case 'notEquals':
            return fieldValue != expectedValue;
        case 'contains':
            return String(fieldValue).includes(String(expectedValue));
        case 'greaterThan':
            return Number(fieldValue) > Number(expectedValue);
        case 'lessThan':
            return Number(fieldValue) < Number(expectedValue);
        case 'isEmpty':
            return !fieldValue || fieldValue === '' || (Array.isArray(fieldValue) && fieldValue.length === 0);
        case 'isNotEmpty':
            return fieldValue && fieldValue !== '' && (!Array.isArray(fieldValue) || fieldValue.length > 0);
        default:
            console.error(`Unknown operator: ${operator}`);
            return false;
    }
}

// ============================================================================
// FLOW MANAGEMENT RESOLVERS
// ============================================================================

/**
 * Get all flow definitions
 * Returns an array of all flows stored in the system
 */
resolver.define('getFlows', async (req) => {
    try {
        console.log('getFlows called');
        
        // Get the list of flow IDs
        const flowIds = await storage.get('decision-flows') || [];
        console.log(`Found ${flowIds.length} flow IDs`);
        
        // Retrieve each flow
        const flows = [];
        for (const flowId of flowIds) {
            const flow = await storage.get(`flow:${flowId}`);
            if (flow) {
                flows.push(flow);
            }
        }
        
        return flows;
    } catch (error) {
        console.error('Error in getFlows:', error);
        return { error: error.message };
    }
});

/**
 * Get a single flow definition by ID
 * @param {string} flowId - The flow ID to retrieve
 */
resolver.define('getFlow', async (req) => {
    try {
        const { flowId } = req.payload;
        console.log(`getFlow called for flowId: ${flowId}`);
        
        if (!flowId) {
            return { error: 'flowId is required' };
        }
        
        const flow = await storage.get(`flow:${flowId}`);
        return flow || null;
    } catch (error) {
        console.error('Error in getFlow:', error);
        return { error: error.message };
    }
});

/**
 * Save (create or update) a flow definition
 * @param {Object} flow - The flow object to save
 */
resolver.define('saveFlow', async (req) => {
    try {
        const { flow } = req.payload;
        console.log('saveFlow called');
        
        // Validate required fields
        if (!flow.name || flow.name.trim() === '') {
            return { error: 'Flow name is required' };
        }
        
        if (!flow.projectKeys || !Array.isArray(flow.projectKeys) || flow.projectKeys.length === 0) {
            return { error: 'At least one project key is required' };
        }
        
        // Generate ID if new flow
        if (!flow.id) {
            flow.id = generateId();
            flow.createdAt = new Date().toISOString();
        }
        
        // Update timestamp
        flow.updatedAt = new Date().toISOString();
        
        // Save the flow
        await storage.set(`flow:${flow.id}`, flow);
        
        // Update the flow list
        const flowIds = await storage.get('decision-flows') || [];
        if (!flowIds.includes(flow.id)) {
            flowIds.push(flow.id);
            await storage.set('decision-flows', flowIds);
        }
        
        console.log(`Flow saved with ID: ${flow.id}`);
        return flow;
    } catch (error) {
        console.error('Error in saveFlow:', error);
        return { error: error.message };
    }
});

/**
 * Delete a flow definition
 * @param {string} flowId - The flow ID to delete
 */
resolver.define('deleteFlow', async (req) => {
    try {
        const { flowId } = req.payload;
        console.log(`deleteFlow called for flowId: ${flowId}`);
        
        if (!flowId) {
            return { error: 'flowId is required' };
        }
        
        // Delete the flow
        await storage.delete(`flow:${flowId}`);
        
        // Remove from flow list
        const flowIds = await storage.get('decision-flows') || [];
        const updatedFlowIds = flowIds.filter(id => id !== flowId);
        await storage.set('decision-flows', updatedFlowIds);
        
        console.log(`Flow deleted: ${flowId}`);
        return { success: true };
    } catch (error) {
        console.error('Error in deleteFlow:', error);
        return { error: error.message };
    }
});

// ============================================================================
// ISSUE PANEL RESOLVERS
// ============================================================================

/**
 * Get flows applicable to a specific issue based on project key
 * @param {string} issueKey - The Jira issue key
 */
resolver.define('getFlowsForIssue', async (req) => {
    try {
        const { issueKey } = req.payload;
        console.log(`getFlowsForIssue called for issueKey: ${issueKey}`);
        
        if (!issueKey) {
            return { error: 'issueKey is required' };
        }
        
        // Extract project key from issue key
        const projectKey = extractProjectKey(issueKey);
        console.log(`Extracted project key: ${projectKey}`);
        
        // Get all flows
        const flowIds = await storage.get('decision-flows') || [];
        const applicableFlows = [];
        
        // Filter flows by project binding
        for (const flowId of flowIds) {
            const flow = await storage.get(`flow:${flowId}`);
            if (flow && flow.projectKeys && flow.projectKeys.includes(projectKey)) {
                applicableFlows.push(flow);
            }
        }
        
        console.log(`Found ${applicableFlows.length} applicable flows`);
        return applicableFlows;
    } catch (error) {
        console.error('Error in getFlowsForIssue:', error);
        return { error: error.message };
    }
});

/**
 * Get execution state for a specific issue and flow
 * @param {string} issueKey - The Jira issue key
 * @param {string} flowId - The flow ID
 */
resolver.define('getExecutionState', async (req) => {
    try {
        const { issueKey, flowId } = req.payload;
        console.log(`getExecutionState called for issueKey: ${issueKey}, flowId: ${flowId}`);
        
        if (!issueKey || !flowId) {
            return { error: 'issueKey and flowId are required' };
        }
        
        // Get execution state
        const state = await storage.get(`exec:${issueKey}:${flowId}`);
        
        // If no state exists, create default state
        if (!state) {
            const flow = await storage.get(`flow:${flowId}`);
            if (!flow) {
                return { error: 'Flow not found' };
            }
            
            const startNode = findStartNode(flow.nodes);
            if (!startNode) {
                return { error: 'Start node not found in flow' };
            }
            
            return {
                completed: false,
                currentNodeId: startNode.id,
                answers: {},
                path: []
            };
        }
        
        return state;
    } catch (error) {
        console.error('Error in getExecutionState:', error);
        return { error: error.message };
    }
});

// ============================================================================
// EXECUTION RESOLVERS
// ============================================================================

/**
 * Submit an answer and progress to the next node
 * @param {string} issueKey - The Jira issue key
 * @param {string} flowId - The flow ID
 * @param {string} nodeId - The current node ID
 * @param {any} answer - The user's answer
 */
resolver.define('submitAnswer', async (req) => {
    try {
        const { issueKey, flowId, nodeId, answer } = req.payload;
        console.log(`submitAnswer called for issueKey: ${issueKey}, flowId: ${flowId}, nodeId: ${nodeId}`);
        
        if (!issueKey || !flowId || !nodeId) {
            return { error: 'issueKey, flowId, and nodeId are required' };
        }
        
        // Load flow
        const flow = await storage.get(`flow:${flowId}`);
        if (!flow) {
            return { error: 'Flow not found' };
        }
        
        // Load or create execution state
        let state = await storage.get(`exec:${issueKey}:${flowId}`);
        if (!state) {
            const startNode = findStartNode(flow.nodes);
            state = {
                completed: false,
                currentNodeId: startNode.id,
                answers: {},
                path: []
            };
        }
        
        // Store the answer
        state.answers[nodeId] = answer;
        state.path.push(nodeId);
        
        // Find next node
        let nextNodeId = findNextNode(nodeId, flow.edges);
        
        // Process next nodes (handle logic nodes automatically)
        while (nextNodeId) {
            const nextNode = flow.nodes.find(n => n.id === nextNodeId);
            
            if (!nextNode) {
                console.error(`Next node not found: ${nextNodeId}`);
                break;
            }
            
            // If it's a logic node, evaluate it automatically
            if (nextNode.type === 'logic') {
                console.log(`Evaluating logic node: ${nextNodeId}`);
                state.path.push(nextNodeId);
                
                const result = await evaluateLogicNodeInternal(issueKey, nextNode, req.context);
                nextNodeId = findNextNode(nextNodeId, flow.edges, result ? 'true' : 'false');
                
                console.log(`Logic evaluation result: ${result}, next node: ${nextNodeId}`);
            }
            // If it's an action node, execute it and mark as complete
            else if (nextNode.type === 'action') {
                console.log(`Executing action node: ${nextNodeId}`);
                state.path.push(nextNodeId);
                state.currentNodeId = nextNodeId;
                
                // Execute the action
                const actionResult = await executeAction(issueKey, nextNode, state.answers, req.context);
                
                // Log the action
                await logAuditInternal(issueKey, flowId, {
                    nodeId: nextNodeId,
                    action: nextNode.data,
                    result: actionResult,
                    timestamp: new Date().toISOString(),
                    answers: state.answers
                });
                
                // Mark as completed
                state.completed = true;
                break;
            }
            // If it's a question node, stop here
            else {
                state.currentNodeId = nextNodeId;
                break;
            }
        }
        
        // Save execution state
        await storage.set(`exec:${issueKey}:${flowId}`, state);
        
        console.log(`Execution state updated, current node: ${state.currentNodeId}, completed: ${state.completed}`);
        return state;
    } catch (error) {
        console.error('Error in submitAnswer:', error);
        return { error: error.message };
    }
});

/**
 * Reset execution state and return to start
 * @param {string} issueKey - The Jira issue key
 * @param {string} flowId - The flow ID
 */
resolver.define('resetExecution', async (req) => {
    try {
        const { issueKey, flowId } = req.payload;
        console.log(`resetExecution called for issueKey: ${issueKey}, flowId: ${flowId}`);
        
        if (!issueKey || !flowId) {
            return { error: 'issueKey and flowId are required' };
        }
        
        // Delete execution state
        await storage.delete(`exec:${issueKey}:${flowId}`);
        
        // Return default state
        const flow = await storage.get(`flow:${flowId}`);
        if (!flow) {
            return { error: 'Flow not found' };
        }
        
        const startNode = findStartNode(flow.nodes);
        if (!startNode) {
            return { error: 'Start node not found in flow' };
        }
        
        const resetState = {
            completed: false,
            currentNodeId: startNode.id,
            answers: {},
            path: []
        };
        
        console.log('Execution state reset');
        return resetState;
    } catch (error) {
        console.error('Error in resetExecution:', error);
        return { error: error.message };
    }
});

/**
 * Internal helper to evaluate a logic node
 * @param {string} issueKey - The Jira issue key
 * @param {Object} logicNode - The logic node object
 * @param {Object} context - The request context
 * @returns {boolean} Evaluation result
 */
async function evaluateLogicNodeInternal(issueKey, logicNode, context) {
    try {
        const { fieldKey, operator, expectedValue } = logicNode.data;
        
        // Fetch issue data from Jira API
        const response = await api.asUser().requestJira(route`/rest/api/3/issue/${issueKey}`, {
            headers: {
                'Accept': 'application/json'
            }
        });
        
        if (!response.ok) {
            console.error(`Failed to fetch issue: ${response.status}`);
            return false;
        }
        
        const issue = await response.json();
        
        // Extract field value
        const fieldValue = issue.fields[fieldKey];
        console.log(`Field ${fieldKey} value:`, fieldValue);
        
        // Evaluate condition
        const result = evaluateCondition(fieldValue, operator, expectedValue);
        console.log(`Condition evaluation: ${fieldValue} ${operator} ${expectedValue} = ${result}`);
        
        return result;
    } catch (error) {
        console.error('Error evaluating logic node:', error);
        return false;
    }
}

// ============================================================================
// ACTION EXECUTION FUNCTIONS
// ============================================================================

/**
 * Execute an action node
 * @param {string} issueKey - The Jira issue key
 * @param {Object} actionNode - The action node object
 * @param {Object} answers - All user answers
 * @param {Object} context - The request context
 * @returns {Object} Result object with success status
 */
async function executeAction(issueKey, actionNode, answers, context) {
    try {
        const { actionType, fieldKey, fieldValue, label, comment } = actionNode.data;
        
        console.log(`Executing action: ${actionType}`);
        
        switch (actionType) {
            case 'setField':
                return await setIssueField(issueKey, fieldKey, fieldValue);
            case 'addLabel':
                return await addIssueLabel(issueKey, label);
            case 'addComment':
                return await addIssueComment(issueKey, comment);
            default:
                return { success: false, error: `Unknown action type: ${actionType}` };
        }
    } catch (error) {
        console.error('Error executing action:', error);
        return { success: false, error: error.message };
    }
}

/**
 * Update a Jira issue field
 * @param {string} issueKey - The Jira issue key
 * @param {string} fieldKey - The field key to update
 * @param {any} value - The new field value
 * @returns {Object} Result object
 */
async function setIssueField(issueKey, fieldKey, value) {
    try {
        console.log(`Setting field ${fieldKey} to ${value} on issue ${issueKey}`);
        
        const response = await api.asUser().requestJira(route`/rest/api/3/issue/${issueKey}`, {
            method: 'PUT',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                fields: {
                    [fieldKey]: value
                }
            })
        });
        
        if (!response.ok) {
            const errorText = await response.text();
            console.error(`Failed to set field: ${response.status} - ${errorText}`);
            return { success: false, error: `API error: ${response.status}`, data: errorText };
        }
        
        console.log('Field updated successfully');
        return { success: true, data: { fieldKey, value } };
    } catch (error) {
        console.error('Error setting field:', error);
        return { success: false, error: error.message };
    }
}

/**
 * Add a label to a Jira issue
 * @param {string} issueKey - The Jira issue key
 * @param {string} label - The label to add
 * @returns {Object} Result object
 */
async function addIssueLabel(issueKey, label) {
    try {
        console.log(`Adding label ${label} to issue ${issueKey}`);
        
        const response = await api.asUser().requestJira(route`/rest/api/3/issue/${issueKey}`, {
            method: 'PUT',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                update: {
                    labels: [{ add: label }]
                }
            })
        });
        
        if (!response.ok) {
            const errorText = await response.text();
            console.error(`Failed to add label: ${response.status} - ${errorText}`);
            return { success: false, error: `API error: ${response.status}`, data: errorText };
        }
        
        console.log('Label added successfully');
        return { success: true, data: { label } };
    } catch (error) {
        console.error('Error adding label:', error);
        return { success: false, error: error.message };
    }
}

/**
 * Add a comment to a Jira issue
 * @param {string} issueKey - The Jira issue key
 * @param {string} commentText - The comment text to add
 * @returns {Object} Result object
 */
async function addIssueComment(issueKey, commentText) {
    try {
        console.log(`Adding comment to issue ${issueKey}`);
        
        // Format comment in Atlassian Document Format (ADF)
        const adfComment = {
            type: 'doc',
            version: 1,
            content: [
                {
                    type: 'paragraph',
                    content: [
                        {
                            type: 'text',
                            text: commentText
                        }
                    ]
                }
            ]
        };
        
        const response = await api.asUser().requestJira(route`/rest/api/3/issue/${issueKey}/comment`, {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                body: adfComment
            })
        });
        
        if (!response.ok) {
            const errorText = await response.text();
            console.error(`Failed to add comment: ${response.status} - ${errorText}`);
            return { success: false, error: `API error: ${response.status}`, data: errorText };
        }
        
        const result = await response.json();
        console.log('Comment added successfully');
        return { success: true, data: result };
    } catch (error) {
        console.error('Error adding comment:', error);
        return { success: false, error: error.message };
    }
}

// ============================================================================
// AUDIT LOGGING FUNCTIONS
// ============================================================================

/**
 * Get audit logs for a specific issue and flow
 * @param {string} issueKey - The Jira issue key
 * @param {string} flowId - The flow ID
 */
resolver.define('getAuditLogs', async (req) => {
    try {
        const { issueKey, flowId } = req.payload;
        console.log(`getAuditLogs called for issueKey: ${issueKey}, flowId: ${flowId}`);
        
        if (!issueKey || !flowId) {
            return { error: 'issueKey and flowId are required' };
        }
        
        const logs = await storage.get(`audit:${issueKey}:${flowId}`) || [];
        console.log(`Found ${logs.length} audit log entries`);
        
        return logs;
    } catch (error) {
        console.error('Error in getAuditLogs:', error);
        return { error: error.message };
    }
});

/**
 * Internal helper to log an audit entry
 * @param {string} issueKey - The Jira issue key
 * @param {string} flowId - The flow ID
 * @param {Object} entry - The audit log entry
 */
async function logAuditInternal(issueKey, flowId, entry) {
    try {
        const key = `audit:${issueKey}:${flowId}`;
        const logs = await storage.get(key) || [];
        
        logs.push(entry);
        
        await storage.set(key, logs);
        console.log('Audit log entry added');
    } catch (error) {
        console.error('Error logging audit entry:', error);
    }
}

export const handler = resolver.getDefinitions();

