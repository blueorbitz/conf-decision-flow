# End-to-End Validation Test Plan
## Decision Flow Builder Application

This document provides a comprehensive test plan for validating the Decision Flow Builder application from end to end.

---

## Prerequisites

Before starting the tests, ensure:
1. The application is deployed to a Jira development environment
2. You have access to a Jira site with administrator privileges
3. You have at least one test project created (e.g., "TEST" project)
4. The application is installed on your Jira site

---

## Test Suite 1: Flow Creation in Admin Page

### Test 1.1: Create a Complete Test Flow

**Objective**: Create a flow with all node types (Start, Question, Logic, Action)

**Steps**:
1. Navigate to Jira → Apps → Decision flow (admin page)
2. Click "Create New Flow" button
3. Add nodes in the following order:
   - **Start Node**: Should be automatically present or add one
   - **Question Node 1**: 
     - Label: "Priority Question"
     - Question: "What is the priority level?"
     - Type: Single Choice
     - Options: "High", "Medium", "Low"
   - **Logic Node 1**:
     - Label: "Check Status"
     - Field Key: "status"
     - Operator: "equals"
     - Expected Value: "Done"
   - **Action Node 1** (for true path):
     - Label: "Add Completion Label"
     - Action Type: "addLabel"
     - Label: "flow-completed"
   - **Action Node 2** (for false path):
     - Label: "Add Pending Label"
     - Action Type: "addLabel"
     - Label: "flow-pending"

4. Connect the nodes:
   - Start → Question Node 1
   - Question Node 1 → Logic Node 1 (any option path)
   - Logic Node 1 → Action Node 1 (true path)
   - Logic Node 1 → Action Node 2 (false path)

**Expected Results**:
- All nodes should be added successfully
- Nodes should be draggable and repositionable
- Edges should connect properly
- Node properties panel should update when selecting each node

**Validation**:
- [ ] All node types are present on the canvas
- [ ] Nodes can be repositioned by dragging
- [ ] Edges connect nodes correctly
- [ ] Properties panel shows correct fields for each node type

---

### Test 1.2: Configure Flow Settings

**Objective**: Set flow metadata and bind to test project

**Steps**:
1. Click the "Settings" button in the toolbar
2. Fill in the flow settings:
   - Name: "E2E Test Flow"
   - Description: "End-to-end validation test flow"
   - Project Keys: "TEST" (or your test project key)
3. Click "Save" in the settings modal
4. Click "Save" in the main toolbar to save the flow

**Expected Results**:
- Settings modal should open and close properly
- Form validation should work (name and project keys required)
- Flow should be saved successfully
- Success message should appear

**Validation**:
- [ ] Settings modal opens and displays form
- [ ] Form validation prevents saving without required fields
- [ ] Flow saves successfully with valid data
- [ ] Success message is displayed

---

### Test 1.3: Edit Existing Flow

**Objective**: Verify flow can be loaded and edited

**Steps**:
1. Return to the flow list view
2. Find "E2E Test Flow" in the list
3. Click "Edit" button
4. Verify all nodes and edges are loaded correctly
5. Make a minor change (e.g., update a node label)
6. Save the flow again

**Expected Results**:
- Flow should load with all nodes and edges intact
- Changes should be saved successfully

**Validation**:
- [ ] Flow loads correctly in the builder
- [ ] All nodes and edges are present
- [ ] Changes can be saved
- [ ] Updated flow appears in the list

---

## Test Suite 2: Issue Panel Display

### Test 2.1: Verify Flow Appears in Issue Panel

**Objective**: Confirm flow is displayed for issues in the bound project

**Steps**:
1. Navigate to an issue in the TEST project (create one if needed)
2. Look for the "Decision Flow" panel in the issue view
3. Verify the flow tab appears

**Expected Results**:
- Decision Flow panel should be visible
- "E2E Test Flow" tab should appear
- Tab should show incomplete status (orange indicator)

**Validation**:
- [ ] Decision Flow panel is visible in issue view
- [ ] Flow tab is present
- [ ] Status indicator shows incomplete (orange)

---

### Test 2.2: Verify Flow Does Not Appear for Other Projects

**Objective**: Confirm project binding works correctly

**Steps**:
1. Navigate to an issue in a different project (not TEST)
2. Check the Decision Flow panel

**Expected Results**:
- Either no Decision Flow panel appears, or
- Panel shows "No flows available" message

**Validation**:
- [ ] Flow does not appear for issues outside bound projects
- [ ] Appropriate empty state message is shown

---

## Test Suite 3: Questionnaire Execution

### Test 3.1: Answer Question Node

**Objective**: Complete a question and verify answer is stored

**Steps**:
1. Open the TEST project issue
2. Select the "E2E Test Flow" tab
3. Ensure "Questionnaire" view is selected
4. Answer the priority question by selecting "High"
5. Click "Submit" button

**Expected Results**:
- Question should be displayed with radio buttons
- Submit button should be enabled after selection
- Flow should progress to the next node
- Answer should be stored

**Validation**:
- [ ] Question displays correctly with options
- [ ] Radio buttons work properly
- [ ] Submit button progresses the flow
- [ ] Next node is displayed

---

### Test 3.2: Logic Node Auto-Evaluation

**Objective**: Verify logic node evaluates automatically

**Steps**:
1. Continue from previous test
2. Observe the logic node evaluation
3. Check which path was taken based on the issue's status field

**Expected Results**:
- Logic node should evaluate automatically (no user input required)
- Correct path should be taken based on issue status
- If status is "Done", should go to "Add Completion Label" action
- If status is not "Done", should go to "Add Pending Label" action

**Validation**:
- [ ] Logic node evaluates without user interaction
- [ ] Correct path is taken based on field value
- [ ] Flow progresses to appropriate action node

---

### Test 3.3: Action Node Execution

**Objective**: Verify action executes and modifies the Jira issue

**Steps**:
1. Continue from previous test
2. Observe the action node execution
3. Check the Jira issue for the added label
4. Refresh the issue page if needed

**Expected Results**:
- Action should execute automatically
- Label should be added to the issue
- Success message should be displayed
- Flow should be marked as completed

**Validation**:
- [ ] Action executes successfully
- [ ] Label appears on the Jira issue
- [ ] Success message is displayed
- [ ] Flow status changes to completed (green indicator)

---

## Test Suite 4: Flow Visualization

### Test 4.1: View Flow Diagram

**Objective**: Verify flow diagram shows execution path

**Steps**:
1. In the same issue, switch to "Flow Diagram" view
2. Observe the node highlighting

**Expected Results**:
- Flow diagram should display all nodes and edges
- Visited nodes should be highlighted in green
- Current/completed node should be highlighted
- Unvisited nodes should be gray
- Diagram should be read-only (no editing)

**Validation**:
- [ ] Flow diagram renders correctly
- [ ] Visited nodes are highlighted (green)
- [ ] Current node is highlighted (blue or distinct color)
- [ ] Unvisited nodes are gray
- [ ] Nodes cannot be edited or moved
- [ ] Zoom and pan controls work

---

## Test Suite 5: Audit Trail

### Test 5.1: View Audit Logs

**Objective**: Verify audit logs record all actions

**Steps**:
1. In the same issue, switch to "Debugger" view
2. Review the audit log entries

**Expected Results**:
- Audit log table should display
- At least one entry should be present (the action execution)
- Entry should include:
  - Timestamp
  - Node identifier
  - Action type
  - Result status (success)
  - User answers

**Validation**:
- [ ] Audit log table displays
- [ ] Action execution is logged
- [ ] Timestamp is present and correct
- [ ] Node information is accurate
- [ ] Action details are complete
- [ ] Result shows success
- [ ] Answers are recorded

---

### Test 5.2: Refresh Audit Logs

**Objective**: Verify audit logs can be refreshed

**Steps**:
1. Click the "Refresh" button in the debugger view
2. Verify logs reload

**Expected Results**:
- Logs should reload
- Same entries should appear (no duplicates)

**Validation**:
- [ ] Refresh button works
- [ ] Logs reload correctly
- [ ] No duplicate entries appear

---

## Test Suite 6: Reset Functionality

### Test 6.1: Reset Execution State

**Objective**: Verify reset clears execution and returns to start

**Steps**:
1. Switch back to "Questionnaire" view
2. Click the "Reset" button
3. Observe the flow state

**Expected Results**:
- Execution state should be cleared
- Flow should return to the first question
- Answers should be cleared
- Path should be reset
- Flow status should change to incomplete (orange)

**Validation**:
- [ ] Reset button works
- [ ] Flow returns to start
- [ ] Previous answers are cleared
- [ ] Status indicator shows incomplete

---

### Test 6.2: Re-execute Flow with Different Answers

**Objective**: Verify flow can be completed multiple times

**Steps**:
1. Answer the question again, but select a different option (e.g., "Low")
2. Complete the flow again
3. Verify the action executes

**Expected Results**:
- Flow should execute normally
- Action should execute again
- New audit log entry should be created

**Validation**:
- [ ] Flow executes with new answers
- [ ] Action executes successfully
- [ ] New audit log entry appears
- [ ] Flow completes successfully

---

## Test Suite 7: Advanced Scenarios

### Test 7.1: Multiple Question Types

**Objective**: Test all question types

**Steps**:
1. Create a new flow with different question types:
   - Single choice question
   - Multiple choice question
   - Date question
   - Number question
2. Execute the flow and answer each question type

**Expected Results**:
- Each question type should render appropriate input controls
- All answers should be stored correctly

**Validation**:
- [ ] Single choice renders radio buttons
- [ ] Multiple choice renders checkboxes
- [ ] Date renders date picker
- [ ] Number renders number input
- [ ] All answers are stored and displayed correctly

---

### Test 7.2: Complex Logic Conditions

**Objective**: Test different logic operators

**Steps**:
1. Create flows with logic nodes using different operators:
   - equals
   - notEquals
   - contains
   - greaterThan
   - lessThan
   - isEmpty
   - isNotEmpty
2. Execute flows and verify correct path is taken

**Expected Results**:
- Each operator should evaluate correctly
- Correct path should be taken based on evaluation

**Validation**:
- [ ] equals operator works correctly
- [ ] notEquals operator works correctly
- [ ] contains operator works correctly
- [ ] greaterThan operator works correctly
- [ ] lessThan operator works correctly
- [ ] isEmpty operator works correctly
- [ ] isNotEmpty operator works correctly

---

### Test 7.3: Multiple Actions

**Objective**: Test all action types

**Steps**:
1. Create flows with different action types:
   - setField (update a field)
   - addLabel (add a label)
   - addComment (add a comment)
2. Execute flows and verify actions execute

**Expected Results**:
- Each action type should execute successfully
- Jira issue should be modified accordingly

**Validation**:
- [ ] setField updates issue field correctly
- [ ] addLabel adds label to issue
- [ ] addComment adds comment to issue
- [ ] All actions are logged in audit trail

---

## Test Suite 8: Error Handling

### Test 8.1: Invalid Flow Configuration

**Objective**: Verify validation prevents invalid flows

**Steps**:
1. Try to save a flow without a name
2. Try to save a flow without project keys
3. Try to create a flow with disconnected nodes

**Expected Results**:
- Validation should prevent saving invalid flows
- Error messages should be displayed

**Validation**:
- [ ] Cannot save flow without name
- [ ] Cannot save flow without project keys
- [ ] Appropriate error messages are shown

---

### Test 8.2: Network Errors

**Objective**: Verify graceful handling of network issues

**Steps**:
1. Simulate network issues (if possible)
2. Observe error handling

**Expected Results**:
- Error messages should be displayed
- Application should not crash
- User should be able to retry

**Validation**:
- [ ] Network errors are caught
- [ ] Error messages are user-friendly
- [ ] Application remains functional

---

## Test Suite 9: Multi-Project Support

### Test 9.1: Bind Flow to Multiple Projects

**Objective**: Verify flow can be bound to multiple projects

**Steps**:
1. Edit the "E2E Test Flow"
2. Add multiple project keys (e.g., "TEST,DEMO")
3. Save the flow
4. Check issues in both projects

**Expected Results**:
- Flow should appear in issues from all bound projects
- Flow should not appear in issues from unbound projects

**Validation**:
- [ ] Flow appears in all bound projects
- [ ] Flow does not appear in unbound projects
- [ ] Multiple project keys are stored correctly

---

## Test Suite 10: Delete Flow

### Test 10.1: Delete Flow

**Objective**: Verify flow can be deleted

**Steps**:
1. Return to the flow list
2. Click "Delete" on the "E2E Test Flow"
3. Confirm deletion
4. Verify flow is removed from list
5. Check issue panel to confirm flow no longer appears

**Expected Results**:
- Flow should be deleted from storage
- Flow should be removed from list
- Flow should no longer appear in issue panels

**Validation**:
- [ ] Delete confirmation appears
- [ ] Flow is removed from list
- [ ] Flow no longer appears in issue panels
- [ ] Execution states are cleaned up

---

## Summary Checklist

### Admin Page Functionality
- [ ] Create flow with all node types
- [ ] Configure flow settings
- [ ] Save flow successfully
- [ ] Edit existing flow
- [ ] Delete flow
- [ ] Drag and drop nodes
- [ ] Connect nodes with edges
- [ ] Configure node properties
- [ ] Form validation works

### Issue Panel Functionality
- [ ] Flow appears for bound projects
- [ ] Flow does not appear for unbound projects
- [ ] Questionnaire view displays questions
- [ ] All question types work correctly
- [ ] Submit answer progresses flow
- [ ] Logic nodes evaluate automatically
- [ ] Action nodes execute successfully
- [ ] Flow diagram shows execution path
- [ ] Audit logs record actions
- [ ] Reset functionality works

### Integration
- [ ] Actions modify Jira issues correctly
- [ ] Labels are added
- [ ] Comments are added
- [ ] Fields are updated
- [ ] Audit trail is complete
- [ ] User context is preserved

### Error Handling
- [ ] Validation prevents invalid data
- [ ] Network errors are handled gracefully
- [ ] Empty states are displayed appropriately
- [ ] Loading states work correctly

---

## Test Results

**Test Date**: _________________

**Tester**: _________________

**Environment**: _________________

**Overall Result**: ☐ PASS  ☐ FAIL

**Notes**:
_________________________________________________________________
_________________________________________________________________
_________________________________________________________________

**Issues Found**:
_________________________________________________________________
_________________________________________________________________
_________________________________________________________________

