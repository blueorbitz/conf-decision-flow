# Quick Test Scenarios
## Decision Flow Builder - Common Test Cases

This document provides quick, copy-paste ready test scenarios for common use cases.

---

## Scenario 1: Priority-Based Labeling

**Use Case**: Automatically label issues based on user-selected priority

**Flow Structure**:
```
Start → Question (Priority) → Action (Add Label)
```

**Configuration**:

1. **Question Node**:
   - Question: "What is the priority of this issue?"
   - Type: Single Choice
   - Options: "Critical", "High", "Medium", "Low"

2. **Action Node**:
   - Action Type: addLabel
   - Label: "priority-set"

**Expected Behavior**:
- User selects priority
- Label "priority-set" is added to issue
- Flow completes

---

## Scenario 2: Status-Based Routing

**Use Case**: Different actions based on issue status

**Flow Structure**:
```
Start → Logic (Check Status) → [True: Action 1] / [False: Action 2]
```

**Configuration**:

1. **Logic Node**:
   - Field Key: "status"
   - Operator: "equals"
   - Expected Value: "Done"

2. **Action Node 1** (True path):
   - Action Type: addComment
   - Comment: "Issue is complete!"

3. **Action Node 2** (False path):
   - Action Type: addComment
   - Comment: "Issue is still in progress."

**Expected Behavior**:
- Logic evaluates issue status automatically
- If status is "Done", adds completion comment
- If status is not "Done", adds progress comment

---

## Scenario 3: Multi-Question Survey

**Use Case**: Collect multiple pieces of information

**Flow Structure**:
```
Start → Question 1 → Question 2 → Question 3 → Action
```

**Configuration**:

1. **Question Node 1**:
   - Question: "What type of issue is this?"
   - Type: Single Choice
   - Options: "Bug", "Feature", "Task"

2. **Question Node 2**:
   - Question: "What is the estimated effort?"
   - Type: Number

3. **Question Node 3**:
   - Question: "When should this be completed?"
   - Type: Date

4. **Action Node**:
   - Action Type: addComment
   - Comment: "Survey completed. Thank you!"

**Expected Behavior**:
- User answers all three questions in sequence
- All answers are stored
- Completion comment is added

---

## Scenario 4: Conditional Field Update

**Use Case**: Update field based on condition

**Flow Structure**:
```
Start → Question → Logic → [True: Action (Set Field)] / [False: End]
```

**Configuration**:

1. **Question Node**:
   - Question: "Should this be escalated?"
   - Type: Single Choice
   - Options: "Yes", "No"

2. **Logic Node**:
   - Field Key: "priority"
   - Operator: "notEquals"
   - Expected Value: "Highest"

3. **Action Node** (True path):
   - Action Type: setField
   - Field Key: "priority"
   - Field Value: { "name": "Highest" }

**Expected Behavior**:
- User indicates escalation needed
- If priority is not already "Highest", updates it
- If priority is already "Highest", no action taken

---

## Scenario 5: Empty Field Check

**Use Case**: Prompt for information if field is empty

**Flow Structure**:
```
Start → Logic (Check Empty) → [True: Question → Action] / [False: Action]
```

**Configuration**:

1. **Logic Node**:
   - Field Key: "description"
   - Operator: "isEmpty"
   - Expected Value: (leave empty)

2. **Question Node** (True path):
   - Question: "Please provide a description"
   - Type: Single Choice
   - Options: "Added description manually"

3. **Action Node 1** (after question):
   - Action Type: addComment
   - Comment: "Please add a description to this issue."

4. **Action Node 2** (False path):
   - Action Type: addComment
   - Comment: "Description is present. Thank you!"

**Expected Behavior**:
- If description is empty, prompts user and adds reminder comment
- If description exists, adds thank you comment

---

## Scenario 6: Multiple Choice with Actions

**Use Case**: Apply multiple labels based on selections

**Flow Structure**:
```
Start → Question (Multiple Choice) → Action
```

**Configuration**:

1. **Question Node**:
   - Question: "Which areas does this affect?"
   - Type: Multiple Choice
   - Options: "Frontend", "Backend", "Database", "API"

2. **Action Node**:
   - Action Type: addLabel
   - Label: "multi-area"

**Expected Behavior**:
- User can select multiple options
- All selections are stored
- Label is added to indicate multi-area impact

---

## Scenario 7: Date-Based Workflow

**Use Case**: Set due date and add reminder

**Flow Structure**:
```
Start → Question (Date) → Action
```

**Configuration**:

1. **Question Node**:
   - Question: "When should this be completed?"
   - Type: Date

2. **Action Node**:
   - Action Type: addComment
   - Comment: "Due date has been noted. Please ensure completion by the specified date."

**Expected Behavior**:
- User selects a date
- Date is stored in answers
- Reminder comment is added

---

## Scenario 8: Numeric Threshold Check

**Use Case**: Different actions based on numeric value

**Flow Structure**:
```
Start → Question (Number) → Logic → [True: Action 1] / [False: Action 2]
```

**Configuration**:

1. **Question Node**:
   - Question: "How many hours will this take?"
   - Type: Number

2. **Logic Node**:
   - Field Key: "customfield_10001" (Story Points)
   - Operator: "greaterThan"
   - Expected Value: "5"

3. **Action Node 1** (True path):
   - Action Type: addLabel
   - Label: "large-effort"

4. **Action Node 2** (False path):
   - Action Type: addLabel
   - Label: "small-effort"

**Expected Behavior**:
- User enters estimated hours
- Logic checks story points
- Appropriate effort label is added

---

## Scenario 9: Contains Text Check

**Use Case**: Check if field contains specific text

**Flow Structure**:
```
Start → Logic (Contains) → [True: Action 1] / [False: Action 2]
```

**Configuration**:

1. **Logic Node**:
   - Field Key: "summary"
   - Operator: "contains"
   - Expected Value: "urgent"

2. **Action Node 1** (True path):
   - Action Type: addLabel
   - Label: "urgent-keyword"

3. **Action Node 2** (False path):
   - Action Type: addLabel
   - Label: "standard"

**Expected Behavior**:
- Logic checks if summary contains "urgent"
- Appropriate label is added based on result

---

## Scenario 10: Complex Multi-Path Flow

**Use Case**: Multiple decision points with different outcomes

**Flow Structure**:
```
Start → Question 1 → Logic 1 → [True: Question 2 → Action 1] / [False: Logic 2 → [True: Action 2] / [False: Action 3]]
```

**Configuration**:

1. **Question Node 1**:
   - Question: "Is this a production issue?"
   - Type: Single Choice
   - Options: "Yes", "No"

2. **Logic Node 1**:
   - Field Key: "priority"
   - Operator: "equals"
   - Expected Value: "Highest"

3. **Question Node 2** (True path):
   - Question: "Has the incident been logged?"
   - Type: Single Choice
   - Options: "Yes", "No"

4. **Action Node 1**:
   - Action Type: addLabel
   - Label: "production-critical"

5. **Logic Node 2** (False path):
   - Field Key: "status"
   - Operator: "equals"
   - Expected Value: "To Do"

6. **Action Node 2** (True from Logic 2):
   - Action Type: addLabel
   - Label: "needs-triage"

7. **Action Node 3** (False from Logic 2):
   - Action Type: addLabel
   - Label: "in-progress"

**Expected Behavior**:
- Multiple decision points guide flow
- Different labels applied based on conditions
- Complex routing works correctly

---

## Testing Tips

### Quick Verification Checklist

For each scenario:
1. ✓ Flow saves without errors
2. ✓ Flow appears in issue panel
3. ✓ Questions display correctly
4. ✓ Logic evaluates correctly
5. ✓ Actions execute successfully
6. ✓ Audit log records actions
7. ✓ Flow diagram shows path
8. ✓ Reset works

### Common Field Keys

Use these standard Jira field keys in logic nodes:

- `summary` - Issue summary/title
- `description` - Issue description
- `status` - Issue status
- `priority` - Issue priority
- `assignee` - Assigned user
- `reporter` - Reporter user
- `created` - Creation date
- `updated` - Last update date
- `labels` - Issue labels (array)
- `components` - Issue components (array)
- `fixVersions` - Fix versions (array)

### Custom Fields

Custom fields use the format: `customfield_XXXXX`

To find custom field IDs:
1. Go to Jira Settings → Issues → Custom Fields
2. Click on the custom field
3. Look at the URL for the field ID

### Priority Values

Standard priority values:
- "Highest"
- "High"
- "Medium"
- "Low"
- "Lowest"

### Status Values

Common status values (may vary by workflow):
- "To Do"
- "In Progress"
- "Done"
- "Blocked"
- "In Review"

---

## Troubleshooting Common Issues

### Issue: Logic node always takes false path
**Solution**: Check that field key is correct and value format matches (e.g., priority needs `{ "name": "High" }` not just `"High"`)

### Issue: Action doesn't execute
**Solution**: Verify user has permission to modify the issue and field exists

### Issue: Flow doesn't appear in issue panel
**Solution**: Check project key binding matches issue's project

### Issue: Question doesn't display
**Solution**: Ensure question text is not empty and question type is set

### Issue: Can't connect nodes
**Solution**: Ensure source node has source handle and target node has target handle

---

**Use these scenarios as templates for your own flows!**

