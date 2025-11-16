# Decision Flow Builder - Project Specification

## Overview
Build an Atlassian Forge app that allows Jira admins to create conditional decision flows that automatically trigger Jira actions based on user responses to questionnaires in the issue panel.

## Architecture

### Backend (src/)
- **Location**: `/src/index.js`
- **Purpose**: Forge resolver functions for flow management, execution, and storage
- **Technology**: Node.js with @forge/resolver, @forge/api, @forge/storage

### Frontend - Admin Page (static/admin-page/)
- **Location**: `/static/admin-page/`
- **Purpose**: Visual flow builder for admins
- **Technology**: React 16, React Flow (@xyflow/react v12), Atlaskit components
- **Build**: react-scripts (Create React App)
- **Entry**: `src/index.js` → `src/App.js` → `public/index.html`
- **Bridge**: `@forge/bridge` v5.8.0 for invoke() calls
- **Existing packages**: @atlaskit/css-reset, @forge/bridge, react ^16, react-dom ^16

### Frontend - Issue Panel (static/issue-panel/)
- **Location**: `/static/issue-panel/`
- **Purpose**: User-facing questionnaire interface
- **Technology**: React 16, React Flow (@xyflow/react v12), Atlaskit components
- **Build**: react-scripts (Create React App) - same structure as admin-page
- **Bridge**: `@forge/bridge` for invoke() and view.getContext()

## Core Features

### 1. Admin Flow Builder
- Visual drag-and-drop interface using React Flow (https://reactflow.dev/)
- Node types:
  - **Start Node**: Entry point
  - **Question Node**: Single/multiple choice, date, number questions
  - **Logic Node**: Conditional branching based on Jira field values
  - **Action Node**: Set field, add label, add comment
- Flow settings: Name, description, project bindings (multiple projects)
- CRUD operations for flows

### 2. Issue Panel Questionnaire
- Tabbed interface for multiple flows
- Color-coded tabs showing completion status
- Three sub-views:
  - **Questionnaire**: Interactive Q&A traversing the decision tree
  - **Flow Diagram**: Read-only visualization with current path highlighted
  - **Debugger**: Audit trail logs
- Only shows flows bound to the issue's project

### 3. Flow Execution
- Question nodes: User answers progress through tree
- Logic nodes: Auto-evaluate Jira field conditions
- Action nodes: Execute Jira operations (set field, add label, add comment)
- State persistence per issue+flow combination

### 4. Audit Trail
- Log every action execution
- Store: timestamp, node, action details, answers, result
- Viewable in debugger sub-view

## Data Models

### Flow Object
```javascript
{
  id: string,
  name: string,
  description: string,
  projectKeys: string[], // e.g., ["PROJ1", "PROJ2"]
  nodes: [], // React Flow nodes
  edges: [], // React Flow edges
  createdAt: timestamp,
  updatedAt: timestamp
}
```

### Node Types

#### Question Node
```javascript
{
  id: string,
  type: 'question',
  position: { x, y },
  data: {
    label: string,
    question: string,
    questionType: 'single' | 'multiple' | 'date' | 'number',
    options: string[] // for single/multiple choice
  }
}
```

#### Logic Node
```javascript
{
  id: string,
  type: 'logic',
  position: { x, y },
  data: {
    label: string,
    fieldKey: string, // Jira field key
    operator: 'equals' | 'notEquals' | 'contains' | 'greaterThan' | 'lessThan' | 'isEmpty' | 'isNotEmpty',
    expectedValue: any
  }
}
```

#### Action Node
```javascript
{
  id: string,
  type: 'action',
  position: { x, y },
  data: {
    label: string,
    actionType: 'setField' | 'addLabel' | 'addComment',
    fieldKey: string, // for setField
    fieldValue: any, // for setField
    label: string, // for addLabel
    comment: string // for addComment
  }
}
```

### Execution State
```javascript
{
  completed: boolean,
  currentNodeId: string,
  answers: { [nodeId]: answer },
  path: string[] // array of visited node IDs
}
```

### Audit Log Entry
```javascript
{
  nodeId: string,
  action: object, // action node data
  result: object, // API response
  timestamp: string,
  answers: object // all answers at time of execution
}
```

## Storage Keys
- `decision-flows`: Array of flow IDs
- `flow:{flowId}`: Individual flow data
- `exec:{issueKey}:{flowId}`: Execution state
- `audit:{issueKey}:{flowId}`: Audit logs array

## Implementation Tasks

### Phase 1: Backend Foundation
**Task 1.1**: Update manifest.yml
- Add jira:adminPage module
- Add jira:issuePanel module
- Add required scopes (read:jira-work, write:jira-work, storage:app)
- Configure resources for both UIs

**Task 1.2**: Implement backend resolvers (src/index.js)
- Flow management: getFlows, getFlow, saveFlow, deleteFlow
- Issue panel: getFlowsForIssue, getExecutionState
- Execution: submitAnswer, resetExecution, evaluateLogicNode
- Actions: setIssueField, addIssueLabel, addIssueComment
- Audit: getAuditLogs, logAudit
- Helper functions for flow traversal and condition evaluation

### Phase 2: Admin Page UI
**Task 2.1**: Setup admin page structure
- Review existing static/admin-page structure
- Update package.json with dependencies (react, react-dom, @xyflow/react, @atlaskit/*)
- Create component structure

**Task 2.2**: Implement Flow List view
- Display all flows in grid/list
- Create, edit, delete actions
- Use Atlaskit components (Button, DynamicTable, etc.)

**Task 2.3**: Implement Flow Builder
- Integrate React Flow library
- Create custom node components for each type
- Implement node palette (add nodes)
- Node properties panel for editing
- Flow settings modal (name, description, projects)
- Save/cancel functionality

**Task 2.4**: Custom Node Components
- StartNode component
- QuestionNode component with question preview
- LogicNode component with condition display
- ActionNode component with action preview
- Use Atlaskit styling

### Phase 3: Issue Panel UI
**Task 3.1**: Setup issue panel structure
- Review existing static/issue-panel structure
- Update package.json with dependencies
- Create component structure

**Task 3.2**: Implement Flow Tabs
- Display tabs for each applicable flow
- Color-coded completion indicators (green=complete, orange=incomplete)
- Tab selection

**Task 3.3**: Implement Questionnaire View
- Display current question
- Render appropriate input based on question type:
  - Single choice: Radio buttons (Atlaskit RadioGroup)
  - Multiple choice: Checkboxes (Atlaskit CheckboxGroup)
  - Date: Date picker (Atlaskit DatePicker)
  - Number: Number input (Atlaskit Textfield)
- Submit answer and progress to next node
- Handle logic nodes automatically
- Show completion message when reaching action node
- Reset button

**Task 3.4**: Implement Flow Diagram View
- Read-only React Flow visualization
- Highlight current path through the tree
- Show completed nodes in different color
- Disable interactions (allow dragging, but no editing)

**Task 3.5**: Implement Debugger View
- Display audit logs in table (Atlaskit DynamicTable)
- Show: timestamp, node, action type, result, answers
- Filter/search capabilities
- Refresh button

### Phase 4: Testing & Refinement
**Task 4.1**: End-to-end testing
- Create test flow in admin page
- Bind to test project
- Execute questionnaire in issue panel
- Verify actions execute correctly
- Check audit logs

**Task 4.2**: Error handling
- Validation in admin page (required fields)
- Error messages for failed actions
- Loading states
- Empty states

**Task 4.3**: Polish
- Responsive design
- Accessibility
- Performance optimization
- Documentation

## Technical Considerations

### React Flow Integration

#### Package & Version
```json
{
  "@xyflow/react": "^12.0.0"
}
```

#### Basic Setup Pattern
```javascript
import { ReactFlow, Background, Controls, MiniMap } from '@xyflow/react';
import '@xyflow/react/dist/style.css';

// Custom node types
const nodeTypes = {
  start: StartNode,
  question: QuestionNode,
  logic: LogicNode,
  action: ActionNode
};

// In component
<ReactFlow
  nodes={nodes}
  edges={edges}
  onNodesChange={onNodesChange}
  onEdgesChange={onEdgesChange}
  onConnect={onConnect}
  nodeTypes={nodeTypes}
  fitView
>
  <Background />
  <Controls />
  <MiniMap />
</ReactFlow>
```

#### Custom Node Structure
```javascript
import { Handle, Position } from '@xyflow/react';
import { token } from '@atlaskit/tokens';

function QuestionNode({ data }) {
  const borderColor = token('color.background.accent.red.bolder')
  return (
    <div style={{ padding: 10, border: `1px solid ${borderColor}`, borderRadius: 5 }}>
      <Handle type="target" position={Position.Top} />
      <div>{data.label}</div>
      <Handle type="source" position={Position.Bottom} />
    </div>
  );
}
```

#### Key Features to Use
- **Custom Nodes**: Create styled nodes with Atlaskit components
- **Edge Labels**: Add labels for logic branches (true/false, option names)
- **Node Handles**: Multiple handles for logic nodes (true/false outputs)
- **Read-only Mode**: Disable interactions in issue panel diagram view
- **Path Highlighting**: Style nodes/edges differently based on execution state
- **MiniMap**: For navigation in large flows
- **Controls**: Zoom, fit view controls
- **Design Tokens**: Use Atlaskit design tokens for theming (light/dark mode)

### Atlaskit Components to Use

#### Required Atlaskit Packages
```json
{
  "@atlaskit/button": "^23.0.0",
  "@atlaskit/textfield": "^8.0.0",
  "@atlaskit/textarea": "^8.0.0",
  "@atlaskit/select": "^21.0.0",
  "@atlaskit/modal-dialog": "^14.0.0",
  "@atlaskit/dynamic-table": "^18.0.0",
  "@atlaskit/lozenge": "^13.0.0",
  "@atlaskit/spinner": "^19.0.0",
  "@atlaskit/radio": "^8.0.0",
  "@atlaskit/checkbox": "^17.0.0",
  "@atlaskit/datetime-picker": "^17.0.0",
  "@atlaskit/tabs": "^18.0.0",
  "@atlaskit/section-message": "^8.0.0",
  "@atlaskit/form": "^14.0.0",
  "@atlaskit/icon": "^29.0.0",
  "@atlaskit/css-reset": "^7.0.0",
  "@atlaskit/tokens": "^8.0.0",
  "@atlaskit/primitives": "^16.0.0"
}
```

#### Component Usage by View

**Admin Page - Flow List**
- `@atlaskit/button` - Create, Edit, Delete buttons
- `@atlaskit/dynamic-table` - Flow list display
- `@atlaskit/lozenge` - Status badges
- `@atlaskit/spinner` - Loading states

**Admin Page - Flow Builder**
- `@atlaskit/button` - Save, Cancel, Add Node buttons
- `@atlaskit/textfield` - Node labels, field keys
- `@atlaskit/textarea` - Descriptions, questions, comments
- `@atlaskit/select` - Dropdowns for node types, operators, action types
- `@atlaskit/modal-dialog` - Flow settings modal
- `@atlaskit/form` - Form validation and structure

**Issue Panel - Questionnaire**
- `@atlaskit/radio` - Single choice questions
- `@atlaskit/checkbox` - Multiple choice questions
- `@atlaskit/datetime-picker` - Date questions
- `@atlaskit/textfield` - Number questions
- `@atlaskit/button` - Submit, Reset buttons
- `@atlaskit/section-message` - Success/error messages

**Issue Panel - Tabs & Debugger**
- `@atlaskit/tabs` - Flow tabs with completion status
- `@atlaskit/dynamic-table` - Audit log display
- `@atlaskit/lozenge` - Status indicators

### Forge Bridge
- Use `invoke()` to call backend resolvers
- Use `view.getContext()` to get issue context in issue panel

### Storage Strategy
- Forge Storage (key-value) is sufficient
- No need for Custom Entities or Entity Properties
- Keep flow data as JSON objects

## Success Criteria
1. Admin can create flows with visual builder
2. Admin can bind flows to multiple projects
3. Users see only flows for their project
4. Questionnaire correctly traverses decision tree
5. Logic nodes auto-evaluate field conditions
6. Actions execute and modify Jira issues
7. Audit trail captures all actions
8. UI is intuitive and uses Atlaskit components
9. App works in production environment

## Next Steps
Review this spec and confirm:
1. Architecture approach is correct
2. Data models are sufficient
3. Task breakdown makes sense
4. Any missing requirements

Once approved, we'll execute tasks progressively with validation at each step.
