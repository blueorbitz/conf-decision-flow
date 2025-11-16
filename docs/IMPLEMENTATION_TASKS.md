# Decision Flow Builder - Implementation Tasks

## Task Execution Guide
Execute tasks sequentially. After each task, validate the changes before proceeding.

---

## PHASE 1: Backend Foundation

### Task 1.1: Update manifest.yml ✓ (Already done)
**Status**: Review existing manifest
**Files**: `manifest.yml`

**Validation**:
- [ ] jira:adminPage module configured
- [ ] jira:issuePanel module configured  
- [ ] Required scopes present
- [ ] Resources point to correct build directories

---

### Task 1.2: Implement Backend Resolvers
**Status**: To Do
**Files**: `src/index.js`

**Subtasks**:
1. Flow Management Resolvers
   - [ ] `getFlows()` - Return all flows
   - [ ] `getFlow(flowId)` - Return single flow
   - [ ] `saveFlow(flow)` - Create/update flow
   - [ ] `deleteFlow(flowId)` - Delete flow

2. Issue Panel Resolvers
   - [ ] `getFlowsForIssue(issueKey)` - Get flows for project
   - [ ] `getExecutionState(issueKey, flowId)` - Get current state

3. Execution Resolvers
   - [ ] `submitAnswer(issueKey, flowId, nodeId, answer)` - Progress flow
   - [ ] `resetExecution(issueKey, flowId)` - Reset state
   - [ ] `evaluateLogicNode(issueKey, nodeId, flowId)` - Check conditions

4. Action Functions
   - [ ] `setIssueField(issueKey, fieldKey, value)` - Update field
   - [ ] `addIssueLabel(issueKey, label)` - Add label
   - [ ] `addIssueComment(issueKey, comment)` - Add comment

5. Audit Functions
   - [ ] `getAuditLogs(issueKey, flowId)` - Get logs
   - [ ] `logAudit(issueKey, flowId, entry)` - Write log

**Validation**:
- [ ] Run `forge lint` - no errors
- [ ] All resolver functions defined
- [ ] Storage keys documented

---

## PHASE 2: Admin Page UI

### Task 2.1: Setup Admin Page Dependencies
**Status**: To Do
**Files**: `static/admin-page/package.json`

**Actions**:
- [ ] Add @xyflow/react ^12.0.0
- [ ] Add Atlaskit packages (button, textfield, textarea, select, modal-dialog, etc.)
- [ ] Run `npm install` in static/admin-page directory

**Validation**:
- [ ] All packages install without errors
- [ ] No peer dependency warnings

---

### Task 2.2: Create Component Structure
**Status**: To Do
**Files**: Create new files in `static/admin-page/src/`

**Structure**:
```
src/
├── App.js (main container)
├── components/
│   ├── FlowList.js
│   ├── FlowBuilder.js
│   ├── FlowSettings.js
│   ├── NodePropertiesPanel.js
│   └── nodes/
│       ├── StartNode.js
│       ├── QuestionNode.js
│       ├── LogicNode.js
│       └── ActionNode.js
└── styles/
    └── (component CSS files)
```

**Validation**:
- [ ] All files created
- [ ] Import structure correct

---

### Task 2.3: Implement Flow List View
**Status**: To Do
**Files**: `static/admin-page/src/components/FlowList.js`

**Features**:
- [ ] Display flows in DynamicTable
- [ ] Create New Flow button
- [ ] Edit flow button per row
- [ ] Delete flow button per row
- [ ] Loading state with Spinner
- [ ] Empty state message

**Validation**:
- [ ] Renders without errors
- [ ] Calls `invoke('getFlows')` on mount
- [ ] Create button navigates to builder

---

### Task 2.4: Implement Flow Builder Core
**Status**: To Do
**Files**: `static/admin-page/src/components/FlowBuilder.js`

**Features**:
- [ ] ReactFlow canvas setup
- [ ] Node palette (add nodes)
- [ ] Save/Cancel buttons
- [ ] Settings button
- [ ] Node selection handling
- [ ] Edge connection handling

**Validation**:
- [ ] ReactFlow renders
- [ ] Can add nodes from palette
- [ ] Can connect nodes
- [ ] Can select nodes

---

### Task 2.5: Implement Custom Nodes
**Status**: To Do
**Files**: `static/admin-page/src/components/nodes/*.js`

**Nodes to Create**:
1. **StartNode**
   - [ ] Single source handle
   - [ ] Green styling
   - [ ] Icon: 🚀

2. **QuestionNode**
   - [ ] Target and source handles
   - [ ] Display question text
   - [ ] Show options as badges
   - [ ] Blue styling

3. **LogicNode**
   - [ ] Target handle
   - [ ] Two source handles (true/false)
   - [ ] Display condition
   - [ ] Purple styling

4. **ActionNode**
   - [ ] Target handle only
   - [ ] Display action type
   - [ ] Red/orange styling

**Validation**:
- [ ] All nodes render in ReactFlow
- [ ] Handles connect properly
- [ ] Styling uses Atlaskit tokens

---

### Task 2.6: Implement Node Properties Panel
**Status**: To Do
**Files**: `static/admin-page/src/components/NodePropertiesPanel.js`

**Features**:
- [ ] Side panel when node selected
- [ ] Form fields based on node type
- [ ] Question node: question text, type, options
- [ ] Logic node: field key, operator, expected value
- [ ] Action node: action type, field/label/comment
- [ ] Delete node button
- [ ] Real-time updates to node data

**Validation**:
- [ ] Opens when node selected
- [ ] Updates node data on change
- [ ] Form validation works
- [ ] Delete removes node and edges

---

### Task 2.7: Implement Flow Settings Modal
**Status**: To Do
**Files**: `static/admin-page/src/components/FlowSettings.js`

**Features**:
- [ ] Modal dialog with form
- [ ] Flow name (required)
- [ ] Description (optional)
- [ ] Project keys (comma-separated, required)
- [ ] Save/Cancel buttons
- [ ] Validation

**Validation**:
- [ ] Modal opens/closes
- [ ] Form validation works
- [ ] Updates flow metadata
- [ ] Project keys parse correctly

---

## PHASE 3: Issue Panel UI

### Task 3.1: Setup Issue Panel Structure
**Status**: To Do
**Files**: Create `static/issue-panel/` directory

**Actions**:
- [ ] Copy structure from admin-page
- [ ] Create package.json with dependencies
- [ ] Create public/index.html
- [ ] Create src/index.js entry point
- [ ] Run `npm install`

**Validation**:
- [ ] Directory structure matches admin-page
- [ ] Dependencies install correctly

---

### Task 3.2: Implement Issue Panel App
**Status**: To Do
**Files**: `static/issue-panel/src/App.js`

**Features**:
- [ ] Get issue context with `view.getContext()`
- [ ] Load flows with `invoke('getFlowsForIssue')`
- [ ] Flow tabs component
- [ ] View selector (Questionnaire/Diagram/Debugger)
- [ ] Conditional rendering of views
- [ ] Loading state
- [ ] Empty state (no flows)

**Validation**:
- [ ] Gets issue key from context
- [ ] Loads applicable flows
- [ ] Tabs display correctly
- [ ] View switching works

---

### Task 3.3: Implement Flow Tabs
**Status**: To Do
**Files**: `static/issue-panel/src/components/FlowTabs.js`

**Features**:
- [ ] Tab for each flow
- [ ] Color-coded completion status
  - Green border: completed
  - Orange border: incomplete
- [ ] Checkmark/circle icon
- [ ] Active tab highlighting

**Validation**:
- [ ] Tabs render for all flows
- [ ] Completion status shows correctly
- [ ] Tab selection works
- [ ] Colors match spec

---

### Task 3.4: Implement Questionnaire View
**Status**: To Do
**Files**: `static/issue-panel/src/components/QuestionnaireView.js`

**Features**:
- [ ] Display current question
- [ ] Render input based on question type:
  - Single choice: Radio buttons
  - Multiple choice: Checkboxes
  - Date: DatePicker
  - Number: Textfield (type=number)
- [ ] Submit button
- [ ] Reset button
- [ ] Progress indicator
- [ ] Completion message
- [ ] Handle logic nodes automatically

**Validation**:
- [ ] Questions display correctly
- [ ] Inputs work for all types
- [ ] Submit progresses to next node
- [ ] Logic nodes evaluate automatically
- [ ] Actions execute at end
- [ ] Reset clears state

---

### Task 3.5: Implement Flow Diagram View
**Status**: To Do
**Files**: `static/issue-panel/src/components/FlowDiagramView.js`

**Features**:
- [ ] Read-only ReactFlow display
- [ ] Highlight current path
- [ ] Different styling for:
  - Completed nodes (green)
  - Current node (blue)
  - Unvisited nodes (gray)
- [ ] Disable all interactions (no drag, no edit)
- [ ] Fit view on load

**Validation**:
- [ ] Flow diagram displays
- [ ] Path highlighting works
- [ ] Cannot edit or drag
- [ ] Zooming still works

---

### Task 3.6: Implement Debugger View
**Status**: To Do
**Files**: `static/issue-panel/src/components/DebuggerView.js`

**Features**:
- [ ] DynamicTable for audit logs
- [ ] Columns: Timestamp, Node, Action Type, Result, Answers
- [ ] Refresh button
- [ ] Empty state (no logs yet)
- [ ] Format timestamps nicely
- [ ] Show action details

**Validation**:
- [ ] Logs display in table
- [ ] Refresh loads latest logs
- [ ] Data formats correctly
- [ ] Empty state shows

---

## PHASE 4: Testing & Polish

### Task 4.1: End-to-End Testing
**Status**: To Do

**Test Scenarios**:
1. **Create Flow**
   - [ ] Create new flow in admin page
   - [ ] Add nodes and connect them
   - [ ] Configure node properties
   - [ ] Set flow settings (name, projects)
   - [ ] Save flow

2. **Execute Flow**
   - [ ] Open issue in bound project
   - [ ] See flow in issue panel
   - [ ] Answer questions
   - [ ] Verify logic nodes work
   - [ ] Verify action executes
   - [ ] Check audit log

3. **Multiple Flows**
   - [ ] Create second flow
   - [ ] Bind to same project
   - [ ] Verify both tabs appear
   - [ ] Complete one flow
   - [ ] Verify tab colors update

**Validation**:
- [ ] All scenarios pass
- [ ] No console errors
- [ ] Actions execute correctly

---

### Task 4.2: Error Handling
**Status**: To Do

**Areas to Cover**:
- [ ] Network errors (show SectionMessage)
- [ ] Validation errors (form feedback)
- [ ] Missing data (empty states)
- [ ] Failed actions (error messages)
- [ ] Loading states (spinners)

**Validation**:
- [ ] Errors display user-friendly messages
- [ ] App doesn't crash on errors
- [ ] Loading states show appropriately

---

### Task 4.3: Final Polish
**Status**: To Do

**Items**:
- [ ] Consistent spacing and layout
- [ ] Responsive design (works at different widths)
- [ ] Accessibility (keyboard navigation, ARIA labels)
- [ ] Performance (large flows render smoothly)
- [ ] Documentation (README with setup instructions)

**Validation**:
- [ ] UI looks polished
- [ ] Works on different screen sizes
- [ ] Keyboard navigation works
- [ ] README is complete

---

## Deployment Checklist

- [ ] Run `npm run build` in static/admin-page
- [ ] Run `npm run build` in static/issue-panel
- [ ] Run `forge lint` - no errors
- [ ] Run `forge deploy --environment development`
- [ ] Run `forge install --site <site-url> --product jira --environment development`
- [ ] Test in real Jira instance
- [ ] Deploy to production when ready

---

## Notes

- Execute tasks in order
- Validate each task before moving to next
- Commit code after each completed task
- Test frequently in Forge tunnel mode
- Ask for clarification if requirements unclear
