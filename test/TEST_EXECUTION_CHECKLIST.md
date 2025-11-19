# Test Execution Checklist
## Decision Flow Builder - End-to-End Validation

**Test Date**: _______________  
**Tester Name**: _______________  
**Environment**: ☐ Development  ☐ Staging  ☐ Production  
**Jira Site URL**: _______________  
**Test Project Key**: _______________

---

## Pre-Test Verification

- [ ] Application is deployed (run `forge deploy`)
- [ ] Application is installed on Jira site
- [ ] Test project exists in Jira
- [ ] Tester has admin access to Jira
- [ ] Browser developer tools are open (F12) for debugging

---

## Test Execution

### 1. Flow Creation - Basic Flow ⏱️ 5 min

**Test ID**: TC-001  
**Objective**: Create a simple flow with Start and Question nodes

- [ ] Navigate to Apps → Decision flow
- [ ] Admin page loads successfully
- [ ] Click "Create New Flow" button
- [ ] Flow builder opens with blank canvas
- [ ] Start node is visible or can be added
- [ ] Click "Settings" button
- [ ] Enter flow name: "Basic Test Flow"
- [ ] Enter project key: [Your test project]
- [ ] Save settings successfully
- [ ] Add Question node from palette
- [ ] Select Question node
- [ ] Configure in properties panel:
  - Question: "What is your priority?"
  - Type: Single Choice
  - Options: "High", "Medium", "Low"
- [ ] Connect Start node to Question node
- [ ] Click "Save" in toolbar
- [ ] Success message appears
- [ ] Flow appears in flow list

**Result**: ☐ PASS  ☐ FAIL  
**Notes**: _______________________________________________

---

### 2. Flow Creation - Complete Flow ⏱️ 10 min

**Test ID**: TC-002  
**Objective**: Create a complete flow with all node types

- [ ] Click "Edit" on "Basic Test Flow"
- [ ] Add Logic node from palette
- [ ] Configure Logic node:
  - Label: "Check Status"
  - Field Key: "status"
  - Operator: "equals"
  - Expected Value: "Done"
- [ ] Connect Question node to Logic node
- [ ] Add Action node (for true path)
- [ ] Configure Action node:
  - Label: "Add Complete Label"
  - Action Type: "addLabel"
  - Label: "test-complete"
- [ ] Connect Logic node (true handle) to Action node
- [ ] Add second Action node (for false path)
- [ ] Configure second Action node:
  - Label: "Add Pending Label"
  - Action Type: "addLabel"
  - Label: "test-pending"
- [ ] Connect Logic node (false handle) to second Action node
- [ ] Save flow
- [ ] All nodes and edges are preserved

**Result**: ☐ PASS  ☐ FAIL  
**Notes**: _______________________________________________

---

### 3. Issue Panel - Flow Display ⏱️ 3 min

**Test ID**: TC-003  
**Objective**: Verify flow appears in issue panel

- [ ] Navigate to an issue in test project
- [ ] Decision Flow panel is visible
- [ ] "Basic Test Flow" tab appears
- [ ] Tab shows incomplete status (orange indicator)
- [ ] Three view options visible: Questionnaire, Flow Diagram, Debugger

**Result**: ☐ PASS  ☐ FAIL  
**Notes**: _______________________________________________

---

### 4. Questionnaire Execution ⏱️ 5 min

**Test ID**: TC-004  
**Objective**: Complete questionnaire and verify flow execution

- [ ] Questionnaire view is selected by default
- [ ] Question "What is your priority?" is displayed
- [ ] Three radio buttons visible: High, Medium, Low
- [ ] Select "High" option
- [ ] Submit button is enabled
- [ ] Click Submit button
- [ ] Flow progresses to next node (no errors)
- [ ] Logic node evaluates automatically
- [ ] Correct action node is reached based on issue status
- [ ] Action executes successfully
- [ ] Success message is displayed
- [ ] Flow status changes to complete (green indicator)

**Result**: ☐ PASS  ☐ FAIL  
**Notes**: _______________________________________________

---

### 5. Action Verification ⏱️ 3 min

**Test ID**: TC-005  
**Objective**: Verify action modified the Jira issue

- [ ] Refresh the issue page
- [ ] Check issue labels
- [ ] Correct label is added ("test-complete" or "test-pending")
- [ ] Label matches the logic evaluation result

**Result**: ☐ PASS  ☐ FAIL  
**Notes**: _______________________________________________

---

### 6. Flow Diagram View ⏱️ 3 min

**Test ID**: TC-006  
**Objective**: Verify flow diagram shows execution path

- [ ] Switch to "Flow Diagram" view
- [ ] All nodes are displayed
- [ ] All edges are displayed
- [ ] Visited nodes are highlighted (green)
- [ ] Current/completed node is highlighted
- [ ] Unvisited nodes are gray
- [ ] Cannot edit or move nodes
- [ ] Zoom controls work
- [ ] Pan controls work

**Result**: ☐ PASS  ☐ FAIL  
**Notes**: _______________________________________________

---

### 7. Audit Log View ⏱️ 3 min

**Test ID**: TC-007  
**Objective**: Verify audit logs record actions

- [ ] Switch to "Debugger" view
- [ ] Audit log table is displayed
- [ ] At least one entry is present
- [ ] Entry shows timestamp
- [ ] Entry shows node identifier
- [ ] Entry shows action type
- [ ] Entry shows result (success)
- [ ] Entry shows user answers
- [ ] Click "Refresh" button
- [ ] Logs reload without errors

**Result**: ☐ PASS  ☐ FAIL  
**Notes**: _______________________________________________

---

### 8. Reset Functionality ⏱️ 3 min

**Test ID**: TC-008  
**Objective**: Verify reset clears execution state

- [ ] Switch back to "Questionnaire" view
- [ ] Click "Reset" button
- [ ] Flow returns to first question
- [ ] Previous answer is cleared
- [ ] Flow status changes to incomplete (orange)
- [ ] Can answer question again
- [ ] Submit works after reset

**Result**: ☐ PASS  ☐ FAIL  
**Notes**: _______________________________________________

---

### 9. Multiple Question Types ⏱️ 10 min

**Test ID**: TC-009  
**Objective**: Test all question types

- [ ] Create new flow: "Question Types Test"
- [ ] Add Single Choice question
  - Renders radio buttons
  - Can select one option
  - Submit works
- [ ] Add Multiple Choice question
  - Renders checkboxes
  - Can select multiple options
  - Submit works
- [ ] Add Date question
  - Renders date picker
  - Can select date
  - Submit works
- [ ] Add Number question
  - Renders number input
  - Can enter number
  - Submit works

**Result**: ☐ PASS  ☐ FAIL  
**Notes**: _______________________________________________

---

### 10. Logic Operators ⏱️ 15 min

**Test ID**: TC-010  
**Objective**: Test all logic operators

Create separate flows or test cases for each operator:

- [ ] equals operator works correctly
- [ ] notEquals operator works correctly
- [ ] contains operator works correctly
- [ ] greaterThan operator works correctly
- [ ] lessThan operator works correctly
- [ ] isEmpty operator works correctly
- [ ] isNotEmpty operator works correctly

**Result**: ☐ PASS  ☐ FAIL  
**Notes**: _______________________________________________

---

### 11. Action Types ⏱️ 10 min

**Test ID**: TC-011  
**Objective**: Test all action types

- [ ] setField action:
  - Updates issue field correctly
  - Field value changes in Jira
  - Audit log records action
- [ ] addLabel action:
  - Adds label to issue
  - Label appears in Jira
  - Audit log records action
- [ ] addComment action:
  - Adds comment to issue
  - Comment appears in Jira
  - Audit log records action

**Result**: ☐ PASS  ☐ FAIL  
**Notes**: _______________________________________________

---

### 12. Multi-Project Binding ⏱️ 5 min

**Test ID**: TC-012  
**Objective**: Verify flow can be bound to multiple projects

- [ ] Edit existing flow
- [ ] Add multiple project keys (comma-separated)
- [ ] Save flow
- [ ] Open issue in first project
- [ ] Flow appears in issue panel
- [ ] Open issue in second project
- [ ] Flow appears in issue panel
- [ ] Open issue in unbound project
- [ ] Flow does NOT appear

**Result**: ☐ PASS  ☐ FAIL  
**Notes**: _______________________________________________

---

### 13. Flow Editing ⏱️ 5 min

**Test ID**: TC-013  
**Objective**: Verify flows can be edited

- [ ] Edit existing flow
- [ ] All nodes load correctly
- [ ] All edges load correctly
- [ ] Can add new nodes
- [ ] Can delete nodes
- [ ] Can modify node properties
- [ ] Can add new edges
- [ ] Can delete edges
- [ ] Save changes
- [ ] Changes are persisted

**Result**: ☐ PASS  ☐ FAIL  
**Notes**: _______________________________________________

---

### 14. Flow Deletion ⏱️ 3 min

**Test ID**: TC-014  
**Objective**: Verify flows can be deleted

- [ ] Go to flow list
- [ ] Click "Delete" on a test flow
- [ ] Confirmation dialog appears
- [ ] Confirm deletion
- [ ] Flow is removed from list
- [ ] Open issue in bound project
- [ ] Flow no longer appears in issue panel

**Result**: ☐ PASS  ☐ FAIL  
**Notes**: _______________________________________________

---

### 15. Error Handling - Validation ⏱️ 5 min

**Test ID**: TC-015  
**Objective**: Verify validation prevents invalid data

- [ ] Try to save flow without name
  - Error message appears
  - Cannot save
- [ ] Try to save flow without project keys
  - Error message appears
  - Cannot save
- [ ] Try to submit question without answer
  - Appropriate handling (button disabled or error)

**Result**: ☐ PASS  ☐ FAIL  
**Notes**: _______________________________________________

---

### 16. Edge Cases ⏱️ 10 min

**Test ID**: TC-016  
**Objective**: Test edge cases and boundary conditions

- [ ] Flow with no edges (disconnected nodes)
  - Appropriate error or warning
- [ ] Flow with cycle (circular path)
  - Handles gracefully
- [ ] Very long flow (10+ nodes)
  - Renders correctly
  - Executes correctly
- [ ] Special characters in flow name
  - Saves correctly
  - Displays correctly
- [ ] Empty project key list
  - Validation prevents save

**Result**: ☐ PASS  ☐ FAIL  
**Notes**: _______________________________________________

---

### 17. Browser Compatibility ⏱️ 10 min

**Test ID**: TC-017  
**Objective**: Verify application works in different browsers

Test in at least 2 browsers:

**Browser 1**: _______________
- [ ] Admin page loads
- [ ] Flow builder works
- [ ] Issue panel loads
- [ ] Questionnaire works
- [ ] All features functional

**Browser 2**: _______________
- [ ] Admin page loads
- [ ] Flow builder works
- [ ] Issue panel loads
- [ ] Questionnaire works
- [ ] All features functional

**Result**: ☐ PASS  ☐ FAIL  
**Notes**: _______________________________________________

---

### 18. Performance ⏱️ 5 min

**Test ID**: TC-018  
**Objective**: Verify acceptable performance

- [ ] Admin page loads in < 3 seconds
- [ ] Flow builder is responsive
- [ ] Issue panel loads in < 2 seconds
- [ ] Questionnaire submission is quick (< 1 second)
- [ ] No noticeable lag when interacting with UI

**Result**: ☐ PASS  ☐ FAIL  
**Notes**: _______________________________________________

---

### 19. Console Errors ⏱️ Ongoing

**Test ID**: TC-019  
**Objective**: Verify no critical errors in console

Throughout all tests:
- [ ] No JavaScript errors in browser console
- [ ] No failed network requests (except expected)
- [ ] No React warnings (or only minor ones)
- [ ] Forge logs show no critical errors

**Result**: ☐ PASS  ☐ FAIL  
**Notes**: _______________________________________________

---

### 20. User Experience ⏱️ Ongoing

**Test ID**: TC-020  
**Objective**: Verify good user experience

Throughout all tests:
- [ ] UI is intuitive and easy to use
- [ ] Loading states are shown appropriately
- [ ] Error messages are clear and helpful
- [ ] Success messages are shown
- [ ] No confusing behavior
- [ ] Consistent styling and design

**Result**: ☐ PASS  ☐ FAIL  
**Notes**: _______________________________________________

---

## Summary

### Test Statistics

- **Total Test Cases**: 20
- **Passed**: _____
- **Failed**: _____
- **Blocked**: _____
- **Not Executed**: _____

### Pass Rate

**Pass Rate**: _____ % (Passed / Total * 100)

### Overall Result

☐ **PASS** - All critical tests passed, ready for production  
☐ **PASS WITH ISSUES** - Minor issues found, can proceed with caution  
☐ **FAIL** - Critical issues found, must fix before production

---

## Issues Found

| ID | Severity | Description | Steps to Reproduce | Status |
|----|----------|-------------|-------------------|--------|
| 1  |          |             |                   |        |
| 2  |          |             |                   |        |
| 3  |          |             |                   |        |
| 4  |          |             |                   |        |
| 5  |          |             |                   |        |

**Severity Levels**: Critical, High, Medium, Low

---

## Recommendations

Based on testing results:

1. _______________________________________________
2. _______________________________________________
3. _______________________________________________

---

## Sign-Off

**Tester Signature**: _______________  
**Date**: _______________

**Reviewer Signature**: _______________  
**Date**: _______________

---

## Appendix: Test Data

### Flows Created
1. Basic Test Flow
2. Question Types Test
3. [Add others as needed]

### Issues Used
1. [Issue Key] - [Project]
2. [Issue Key] - [Project]

### Labels Added
- test-complete
- test-pending
- [Others]

---

**End of Test Execution Checklist**

