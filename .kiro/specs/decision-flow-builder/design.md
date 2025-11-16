# Design Document

## Overview

The Decision Flow Builder is implemented as an Atlassian Forge application with a backend resolver layer and two frontend UI modules. The architecture follows a clear separation between administrative flow management (Admin Page) and user-facing flow execution (Issue Panel). The system uses Forge Storage for persistence, React Flow for visual flow building, and Atlaskit components for consistent UI design.

## Architecture

### System Components

```
┌─────────────────────────────────────────────────────────────┐
│                     Forge Platform                          │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌──────────────┐         ┌──────────────┐                │
│  │  Admin Page  │         │ Issue Panel  │                │
│  │   (React)    │         │   (React)    │                │
│  └──────┬───────┘         └──────┬───────┘                │
│         │                        │                         │
│         │  @forge/bridge         │  @forge/bridge          │
│         │  invoke()              │  invoke()               │
│         │                        │  view.getContext()      │
│         └────────┬───────────────┘                         │
│                  │                                          │
│         ┌────────▼────────┐                                │
│         │   Resolvers     │                                │
│         │  (src/index.js) │                                │
│         └────────┬────────┘                                │
│                  │                                          │
│         ┌────────▼────────┐      ┌──────────────┐         │
│         │ Forge Storage   │      │  Jira REST   │         │
│         │   (Key-Value)   │      │     API      │         │
│         └─────────────────┘      └──────────────┘         │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### Technology Stack

**Backend**
- Runtime: Node.js 22.x (ARM64)
- Framework: @forge/resolver
- APIs: @forge/api (Jira REST API client)
- Storage: @forge/storage (key-value store)

**Admin Page Frontend**
- Framework: React 18.x
- Build Tool: react-scripts (Create React App)
- Flow Visualization: @xyflow/react v12
- UI Components: Atlaskit (@atlaskit/*)
- Bridge: @forge/bridge v5.8.0
- Location: static/admin-page/

**Issue Panel Frontend**
- Framework: React 18.x
- Build Tool: react-scripts (Create React App)
- Flow Visualization: @xyflow/react v12
- UI Components: Atlaskit (@atlaskit/*)
- Bridge: @forge/bridge v5.8.0
- Location: static/issue-panel/

## Components and Interfaces

### Backend Resolvers

#### Flow Management Resolvers

**getFlows()**
- Purpose: Retrieve all flow definitions
- Returns: Array of flow objects
- Storage Access: Read "decision-flows" key, then read each "flow:{flowId}"

**getFlow(flowId)**
- Purpose: Retrieve a single flow definition
- Parameters: flowId (string)
- Returns: Flow object or null
- Storage Access: Read "flow:{flowId}"

**saveFlow(flow)**
- Purpose: Create or update a flow definition
- Parameters: flow (object with id, name, description, projectKeys, nodes, edges)
- Returns: Saved flow object
- Storage Access: Write "flow:{flowId}", update "decision-flows" list
- Validation: Ensure name is non-empty, projectKeys array has at least one element

**deleteFlow(flowId)**
- Purpose: Remove a flow definition
- Parameters: flowId (string)
- Returns: Success boolean
- Storage Access: Delete "flow:{flowId}", remove from "decision-flows" list

#### Issue Panel Resolvers

**getFlowsForIssue(issueKey)**
- Purpose: Retrieve flows applicable to an issue's project
- Parameters: issueKey (string)
- Returns: Array of flow objects
- Logic:
  1. Extract project key from issueKey (e.g., "PROJ-123" → "PROJ")
  2. Get all flows
  3. Filter flows where projectKeys array includes the project key
- Jira API: GET /rest/api/3/issue/{issueKey} to verify project

**getExecutionState(issueKey, flowId)**
- Purpose: Retrieve current execution state for an issue+flow
- Parameters: issueKey (string), flowId (string)
- Returns: Execution state object or default state
- Storage Access: Read "exec:{issueKey}:{flowId}"
- Default State: { completed: false, currentNodeId: startNodeId, answers: {}, path: [] }

#### Execution Resolvers

**submitAnswer(issueKey, flowId, nodeId, answer)**
- Purpose: Record user answer and progress to next node
- Parameters: issueKey, flowId, nodeId, answer (any type)
- Returns: Updated execution state
- Logic:
  1. Load execution state
  2. Store answer in state.answers[nodeId]
  3. Add nodeId to state.path
  4. Find outgoing edge from current node
  5. Determine next node
  6. If next node is Logic type, call evaluateLogicNode()
  7. If next node is Action type, execute action and mark completed
  8. Update state.currentNodeId
  9. Save execution state
- Storage Access: Read/Write "exec:{issueKey}:{flowId}"

**resetExecution(issueKey, flowId)**
- Purpose: Clear execution state and return to start
- Parameters: issueKey, flowId
- Returns: Reset execution state
- Storage Access: Delete "exec:{issueKey}:{flowId}"

**evaluateLogicNode(issueKey, nodeId, flowId)**
- Purpose: Evaluate logic condition and determine next path
- Parameters: issueKey, nodeId, flowId
- Returns: Next node ID (following true or false edge)
- Logic:
  1. Load flow to get node data
  2. Get logic node configuration (fieldKey, operator, expectedValue)
  3. Fetch issue data from Jira API
  4. Extract field value from issue
  5. Apply operator comparison
  6. Find edge labeled "true" or "false" based on result
  7. Return target node ID of selected edge
- Jira API: GET /rest/api/3/issue/{issueKey}

#### Action Functions

**setIssueField(issueKey, fieldKey, value)**
- Purpose: Update a Jira issue field
- Parameters: issueKey, fieldKey, value
- Returns: API response object
- Jira API: PUT /rest/api/3/issue/{issueKey} with body { fields: { [fieldKey]: value } }
- Authorization: Use .asUser() for user context

**addIssueLabel(issueKey, label)**
- Purpose: Add a label to a Jira issue
- Parameters: issueKey, label
- Returns: API response object
- Jira API: PUT /rest/api/3/issue/{issueKey} with body { update: { labels: [{ add: label }] } }
- Authorization: Use .asUser() for user context

**addIssueComment(issueKey, comment)**
- Purpose: Add a comment to a Jira issue
- Parameters: issueKey, comment
- Returns: API response object
- Jira API: POST /rest/api/3/issue/{issueKey}/comment with body { body: { type: "doc", content: [...] } }
- Authorization: Use .asUser() for user context
- Note: Use Atlassian Document Format (ADF) for comment body

#### Audit Functions

**getAuditLogs(issueKey, flowId)**
- Purpose: Retrieve audit log entries
- Parameters: issueKey, flowId
- Returns: Array of audit log entry objects
- Storage Access: Read "audit:{issueKey}:{flowId}"

**logAudit(issueKey, flowId, entry)**
- Purpose: Append an audit log entry
- Parameters: issueKey, flowId, entry (object with nodeId, action, result, timestamp, answers)
- Returns: Success boolean
- Storage Access: Read "audit:{issueKey}:{flowId}", append entry, write back
- Entry Format: { nodeId, action, result, timestamp: new Date().toISOString(), answers }

### Frontend Components

#### Admin Page Components

**App.js**
- Root component
- State: currentView ('list' | 'builder'), selectedFlowId
- Renders FlowList or FlowBuilder based on currentView

**FlowList.js**
- Displays all flows in DynamicTable
- Columns: Name, Description, Projects, Actions
- Actions: Create (navigate to builder), Edit (load flow in builder), Delete (confirm and delete)
- Uses: @atlaskit/dynamic-table, @atlaskit/button, @atlaskit/lozenge
- Bridge Calls: invoke('getFlows'), invoke('deleteFlow')

**FlowBuilder.js**
- Main flow editing canvas
- State: nodes, edges, selectedNode, flowMetadata (name, description, projectKeys)
- Components:
  - ReactFlow canvas with custom node types
  - Node palette (sidebar with node type buttons)
  - Node properties panel (conditional render based on selectedNode)
  - Top toolbar (Settings, Save, Cancel buttons)
- Uses: @xyflow/react, @atlaskit/button
- Bridge Calls: invoke('getFlow'), invoke('saveFlow')

**FlowSettings.js**
- Modal dialog for flow metadata
- Fields: Name (required), Description (optional), Project Keys (comma-separated, required)
- Uses: @atlaskit/modal-dialog, @atlaskit/textfield, @atlaskit/textarea, @atlaskit/form
- Validation: Name non-empty, at least one project key

**NodePropertiesPanel.js**
- Side panel for editing selected node
- Conditional rendering based on node type:
  - Question: question text, question type dropdown, options (for single/multiple choice)
  - Logic: field key, operator dropdown, expected value
  - Action: action type dropdown, conditional fields (fieldKey+value, label, or comment)
- Uses: @atlaskit/textfield, @atlaskit/textarea, @atlaskit/select, @atlaskit/button
- Delete Node button

**Custom Node Components**

**StartNode.js**
- Visual: Green circle with rocket icon 🚀
- Handles: One source handle (bottom)
- Non-editable label: "Start"
- Uses: @xyflow/react Handle, @atlaskit/tokens for colors

**QuestionNode.js**
- Visual: Blue rounded rectangle
- Handles: One target (top), one source (bottom)
- Display: Question text preview, question type badge, options as chips
- Uses: @xyflow/react Handle, @atlaskit/lozenge

**LogicNode.js**
- Visual: Purple diamond shape
- Handles: One target (top), two sources (left="false", right="true")
- Display: Condition summary (e.g., "status equals Done")
- Uses: @xyflow/react Handle, @atlaskit/tokens

**ActionNode.js**
- Visual: Orange/red rounded rectangle
- Handles: One target (top), One sources (bottom or terminal node)
- Display: Action type and summary (e.g., "Set priority to High")
- Uses: @xyflow/react Handle, @atlaskit/lozenge

#### Issue Panel Components

**App.js**
- Root component
- State: issueKey, flows, selectedFlowId, currentView ('questionnaire' | 'diagram' | 'debugger')
- Initialization: Call view.getContext() to get issueKey, then invoke('getFlowsForIssue')
- Renders: FlowTabs, ViewSelector, conditional view component

**FlowTabs.js**
- Displays tab for each flow
- Tab styling: Green border if completed, orange if incomplete
- Uses: @atlaskit/tabs
- Bridge Calls: invoke('getExecutionState') for each flow to determine completion

**QuestionnaireView.js**
- Displays current question based on execution state
- Conditional input rendering:
  - Single choice: @atlaskit/radio RadioGroup
  - Multiple choice: Multiple @atlaskit/checkbox components
  - Date: @atlaskit/datetime-picker DatePicker
  - Number: @atlaskit/textfield with type="number"
- Submit button: Calls invoke('submitAnswer')
- Reset button: Calls invoke('resetExecution')
- Completion message: SectionMessage when state.completed is true
- Uses: @atlaskit/button, @atlaskit/section-message
- Bridge Calls: invoke('getExecutionState'), invoke('submitAnswer'), invoke('resetExecution')

**FlowDiagramView.js**
- Read-only ReactFlow visualization
- Styling: Highlight visited nodes (green), current node (blue), unvisited (gray)
- Disable editing: nodesDraggable={false}, nodesConnectable={false}, elementsSelectable={false}
- Uses: @xyflow/react with custom node types
- Bridge Calls: invoke('getExecutionState') to get path and currentNodeId

**DebuggerView.js**
- Displays audit logs in DynamicTable
- Columns: Timestamp, Node, Action Type, Result, Answers
- Refresh button: Reload audit logs
- Empty state: "No actions executed yet"
- Uses: @atlaskit/dynamic-table, @atlaskit/button
- Bridge Calls: invoke('getAuditLogs')

## Data Models

### Flow Object
```javascript
{
  id: string,                    // UUID
  name: string,                  // Display name
  description: string,           // Optional description
  projectKeys: string[],         // Array of Jira project keys
  nodes: ReactFlowNode[],        // React Flow node array
  edges: ReactFlowEdge[],        // React Flow edge array
  createdAt: string,             // ISO timestamp
  updatedAt: string              // ISO timestamp
}
```

### Node Data Structures

**Start Node**
```javascript
{
  id: string,
  type: 'start',
  position: { x: number, y: number },
  data: {
    label: 'Start'
  }
}
```

**Question Node**
```javascript
{
  id: string,
  type: 'question',
  position: { x: number, y: number },
  data: {
    label: string,                                    // Node label
    question: string,                                 // Question text
    questionType: 'single' | 'multiple' | 'date' | 'number',
    options: string[]                                 // For single/multiple choice
  }
}
```

**Logic Node**
```javascript
{
  id: string,
  type: 'logic',
  position: { x: number, y: number },
  data: {
    label: string,                                    // Node label
    fieldKey: string,                                 // Jira field key (e.g., 'status', 'priority')
    operator: 'equals' | 'notEquals' | 'contains' | 'greaterThan' | 'lessThan' | 'isEmpty' | 'isNotEmpty',
    expectedValue: any                                // Value to compare against
  }
}
```

**Action Node**
```javascript
{
  id: string,
  type: 'action',
  position: { x: number, y: number },
  data: {
    label: string,                                    // Node label
    actionType: 'setField' | 'addLabel' | 'addComment',
    fieldKey: string,                                 // For setField
    fieldValue: any,                                  // For setField
    label: string,                                    // For addLabel
    comment: string                                   // For addComment
  }
}
```

### Edge Structure
```javascript
{
  id: string,
  source: string,                                     // Source node ID
  target: string,                                     // Target node ID
  label: string,                                      // Optional (e.g., 'true', 'false', 'Option A')
  type: 'default' | 'smoothstep'
}
```

### Execution State
```javascript
{
  completed: boolean,                                 // True when flow reaches action node
  currentNodeId: string,                              // ID of current node
  answers: { [nodeId: string]: any },                 // Map of node ID to user answer
  path: string[]                                      // Array of visited node IDs in order
}
```

### Audit Log Entry
```javascript
{
  nodeId: string,                                     // Action node ID
  action: {                                           // Copy of action node data
    actionType: string,
    fieldKey?: string,
    fieldValue?: any,
    label?: string,
    comment?: string
  },
  result: {                                           // API response
    success: boolean,
    data?: any,
    error?: string
  },
  timestamp: string,                                  // ISO timestamp
  answers: { [nodeId: string]: any }                  // Snapshot of all answers at execution time
}
```

## Error Handling

### Backend Error Handling

**Storage Errors**
- Catch storage read/write failures
- Return error response with message
- Log error details for debugging

**Jira API Errors**
- Catch API request failures (network, authentication, authorization)
- Return error response with status code and message
- Create audit log entry with error details
- Use .asUser() to ensure proper authorization context

**Validation Errors**
- Validate flow data before saving (required fields, data types)
- Return validation error messages
- Prevent invalid data from being stored

### Frontend Error Handling

**Network Errors**
- Display SectionMessage with error appearance
- Provide retry mechanism
- Show user-friendly error messages

**Loading States**
- Display Spinner while data is loading
- Disable interactive elements during operations
- Prevent duplicate submissions

**Empty States**
- Display informative messages when no data exists
- Provide call-to-action (e.g., "Create your first flow")

**Form Validation**
- Use @atlaskit/form validation
- Display inline error messages
- Prevent submission of invalid data

## Testing Strategy

### Unit Testing

**Backend Resolvers**
- Test flow CRUD operations
- Test execution state management
- Test logic evaluation with various operators
- Test action execution (mock Jira API)
- Test audit logging
- Mock Forge Storage and API clients

**Frontend Components**
- Test component rendering
- Test user interactions (button clicks, form submissions)
- Test state management
- Mock @forge/bridge invoke() calls

### Integration Testing

**Flow Creation to Execution**
1. Create flow in admin page
2. Bind to test project
3. Open issue in test project
4. Verify flow appears in issue panel
5. Complete questionnaire
6. Verify action executes on issue
7. Verify audit log records action

**Logic Node Evaluation**
1. Create flow with logic node
2. Set up test issue with specific field values
3. Execute flow
4. Verify correct path is taken based on field value

**Multi-Project Binding**
1. Create flow bound to multiple projects
2. Verify flow appears in issues from all bound projects
3. Verify flow does not appear in issues from unbound projects

### Manual Testing

**Admin Page**
- Create, edit, delete flows
- Add all node types
- Connect nodes with edges
- Configure node properties
- Save and reload flows
- Validate form inputs

**Issue Panel**
- Answer all question types
- Verify logic node auto-evaluation
- Verify action execution
- View flow diagram with path highlighting
- View audit logs
- Reset execution

**Error Scenarios**
- Network failures
- Invalid data
- Missing permissions
- Empty states

## Security Considerations

### Authorization

**Admin Page**
- Only accessible to Jira administrators
- Configured via jira:adminPage module (inherently restricted)

**Issue Panel**
- Accessible to all users with issue view permission
- Use .asUser() for all Jira API calls to respect user permissions
- Actions execute in user context (user must have permission to modify issue)

### Data Validation

**Input Sanitization**
- Validate all user inputs before storage
- Sanitize strings to prevent injection attacks
- Validate data types and formats

**Storage Access**
- Use namespaced storage keys to prevent collisions
- Validate storage key formats before access
- Handle missing or corrupted data gracefully

### Scopes

**Required Scopes**
- read:jira-work (read issue data, project data)
- write:jira-work (update issues, add comments, add labels)
- storage:app (access Forge Storage)

**Scope Minimization**
- Only request scopes necessary for functionality
- Use .asUser() to leverage user permissions
- Avoid .asApp() unless necessary (not used in this app)

## Performance Considerations

### Storage Optimization

**Flow Storage**
- Store flows individually to avoid loading all flows unnecessarily
- Use flow ID list for efficient retrieval
- Consider pagination if flow count grows large

**Execution State**
- Store per issue+flow to avoid conflicts
- Clean up old execution states periodically (future enhancement)

### Frontend Performance

**React Flow**
- Use memoization for custom node components
- Limit number of nodes displayed (warn if flow exceeds 100 nodes)
- Use MiniMap for navigation in large flows

**Data Fetching**
- Load flows on demand (not all at once)
- Cache execution state in component state
- Debounce property panel updates

### API Rate Limiting

**Jira API Calls**
- Batch operations where possible
- Cache issue data during logic evaluation
- Handle rate limit errors gracefully

## Deployment Considerations

### Build Process

**Admin Page**
1. Navigate to static/admin-page
2. Run `npm install`
3. Run `npm run build`
4. Output: static/admin-page/build

**Issue Panel**
1. Navigate to static/issue-panel
2. Run `npm install`
3. Run `npm run build`
4. Output: static/issue-panel/build

### Manifest Configuration

**Modules**
- jira:adminPage pointing to admin-page build
- jira:issuePanel pointing to issue-panel build
- function resolver pointing to src/index.js

**Resources**
- admin-page resource: static/admin-page/build
- issue-panel resource: static/issue-panel/build

### Deployment Steps

1. Build both frontend applications
2. Run `forge lint` to validate manifest
3. Run `forge deploy --environment development --non-interactive`
4. Run `forge install --site <site-url> --product jira --environment development --non-interactive`
5. Test in development environment
6. Deploy to production when validated

### Upgrade Considerations

**Scope Changes**
- If scopes are added, must reinstall app (not just redeploy)
- Use `forge install --upgrade` flag

**Data Migration**
- No migration needed for initial release
- Future versions may require storage migration scripts

## Future Enhancements

### Potential Features

**Advanced Logic**
- Support for AND/OR compound conditions
- Support for custom JavaScript expressions
- Support for comparing multiple fields

**Additional Actions**
- Transition issue to different status
- Assign issue to user
- Create sub-task
- Send notification

**Flow Templates**
- Pre-built flow templates for common scenarios
- Import/export flows as JSON

**Analytics**
- Track flow completion rates
- Identify bottlenecks in flows
- User engagement metrics

**Collaboration**
- Flow versioning
- Flow sharing between projects
- Flow approval workflow

### Scalability

**Large Flows**
- Implement flow validation (detect cycles, unreachable nodes)
- Optimize rendering for flows with 100+ nodes
- Implement flow search/filter in admin page

**High Volume**
- Consider Custom Entities for better query performance
- Implement caching layer
- Optimize storage key structure
