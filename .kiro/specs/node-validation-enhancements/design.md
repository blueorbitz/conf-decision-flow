# Design Document

## Overview

This design document outlines the implementation approach for enhancing the Decision Flow Builder with advanced date handling capabilities and improved node validation. The enhancements include:

1. **Date Expression System**: A comprehensive date expression parser and evaluator supporting relative dates, date functions, and combined expressions
2. **Select Field Support**: Dynamic dropdown rendering for Jira select fields in Action nodes
3. **Start Node Validation**: Enforcement of the single Start node constraint across the canvas

These enhancements will be implemented across the frontend (admin page and issue panel) and backend (resolver functions) to provide a seamless experience for flow designers and end users.

## Architecture

### Component Overview

The implementation spans three main areas:

1. **Date Expression Engine** (Backend + Frontend)
   - Parser: Validates and parses date expressions
   - Evaluator: Converts expressions to absolute dates
   - Utilities: Shared functions for date manipulation

2. **Field Type Detection** (Backend)
   - Jira API integration to fetch field metadata
   - Field type identification (date, select, text, etc.)
   - Option fetching for select fields

3. **UI Enhancements** (Frontend)
   - Node Properties Panel updates for date expressions
   - Select field dropdown rendering
   - Start node validation in FlowBuilder
   - Real-time date preview components

### Data Flow

```
┌─────────────────────────────────────────────────────────────┐
│                     Admin Page (Frontend)                    │
│                                                               │
│  ┌──────────────────┐         ┌─────────────────────────┐  │
│  │ Node Properties  │────────▶│  Date Expression        │  │
│  │ Panel            │         │  Validator & Preview    │  │
│  └──────────────────┘         └─────────────────────────┘  │
│           │                              │                   │
│           │                              │                   │
│           ▼                              ▼                   │
│  ┌──────────────────┐         ┌─────────────────────────┐  │
│  │ FlowBuilder      │────────▶│  Start Node Validator   │  │
│  │ (Canvas)         │         │                         │  │
│  └──────────────────┘         └─────────────────────────┘  │
│           │                                                  │
└───────────┼──────────────────────────────────────────────────┘
            │
            │ invoke('saveFlow', ...)
            │ requestJira('/rest/api/3/field')
            ▼
┌─────────────────────────────────────────────────────────────┐
│                    Backend (Resolvers)                       │
│                                                               │
│  ┌──────────────────┐         ┌─────────────────────────┐  │
│  │ Flow Execution   │────────▶│  Date Expression        │  │
│  │ Engine           │         │  Evaluator              │  │
│  └──────────────────┘         └─────────────────────────┘  │
│           │                                                  │
│           ▼                                                  │
│  ┌──────────────────┐                                       │
│  │ Action Executor  │                                       │
│  │ (setField, etc.) │                                       │
│  └──────────────────┘                                       │
└─────────────────────────────────────────────────────────────┘
```

## Components and Interfaces

### 1. Date Expression Parser (Backend & Frontend)

**Location**: 
- Backend: `src/utils/dateExpressionParser.js`
- Frontend: `static/admin-page/src/utils/dateExpressionParser.js` (shared copy)

**Purpose**: Parse and validate date expressions

**Interface**:
```javascript
/**
 * Parse a date expression string
 * @param {string} expression - The date expression (e.g., "today() + 7d", "startofweek()")
 * @returns {Object} Parsed expression object or error
 */
function parseDateExpression(expression) {
  // Returns: { valid: boolean, type: 'relative'|'function'|'expression', error?: string, parsed?: Object }
}

/**
 * Validate date expression format
 * @param {string} expression - The date expression
 * @returns {Object} Validation result with error message if invalid
 */
function validateDateExpression(expression) {
  // Returns: { valid: boolean, error?: string }
}
```

**Supported Formats**:
- Relative: `7d`, `2w`, `3m`, `1y`
- Functions: `today()`, `startofweek()`, `endofweek()`, `startofmonth()`, `endofmonth()`, `startofyear()`, `endofyear()`
- Expressions: `today() + 7d`, `startofweek() - 1d`, `endofmonth() + 2w`

### 2. Date Expression Evaluator (Backend & Frontend)

**Location**: 
- Backend: `src/utils/dateExpressionEvaluator.js`
- Frontend: `static/admin-page/src/utils/dateExpressionEvaluator.js` (shared copy)

**Purpose**: Evaluate date expressions to absolute dates

**Interface**:
```javascript
/**
 * Evaluate a date expression to an absolute date
 * @param {string} expression - The date expression
 * @param {Date} baseDate - Optional base date (defaults to now)
 * @returns {Date} The evaluated date
 */
function evaluateDateExpression(expression, baseDate = new Date()) {
  // Returns: Date object
}

/**
 * Evaluate a relative date expression
 * @param {string} expression - Relative expression (e.g., "7d")
 * @param {Date} baseDate - Base date to add to
 * @returns {Date} The calculated date
 */
function evaluateRelativeDate(expression, baseDate) {
  // Returns: Date object
}

/**
 * Evaluate a date function
 * @param {string} functionName - Function name (e.g., "today", "startofweek")
 * @param {Date} baseDate - Base date for calculation
 * @returns {Date} The calculated date
 */
function evaluateDateFunction(functionName, baseDate) {
  // Returns: Date object
}
```

### 3. Field Metadata Fetcher (Frontend)

**Location**: `static/admin-page/src/utils/fieldMetadata.js`

**Purpose**: Fetch Jira field metadata including type and options

**Interface**:
```javascript
/**
 * Get metadata for a Jira field
 * @param {string} fieldKey - The Jira field key
 * @param {string} projectKey - The project key for context
 * @returns {Promise<Object>} Field metadata
 */
async function getFieldMetadata(fieldKey, projectKey) {
  // Returns: { 
  //   fieldKey: string,
  //   fieldType: 'date'|'select'|'text'|'number'|...,
  //   options?: Array<{ value: string, label: string }>,
  //   error?: string
  // }
}
```

**Implementation Details**:
- Uses `requestJira` from `@forge/bridge` to call Jira REST API
- Calls `/rest/api/3/field` to fetch field definitions
- Identifies field type from schema
- For select fields, fetches available options from field configuration
- Caches results in component state to minimize API calls
- No backend resolver needed - all done on frontend

### 4. Node Properties Panel Enhancements (Frontend)

**Location**: `static/admin-page/src/components/NodePropertiesPanel.jsx`

**Enhancements**:

**For Logic Nodes**:
- Add date expression input with validation
- Show real-time preview of evaluated date
- Display validation errors inline
- Support for selecting Question nodes as comparison values

**For Action Nodes**:
- Detect field type when fieldKey changes using `requestJira` from `@forge/bridge`
- Render appropriate input:
  - Date fields: Text input with date expression support + preview
  - Select fields: Dropdown populated from Jira options (fetched via `requestJira`)
  - Other fields: Standard text input
- Show loading state while fetching field metadata from Jira API

**New Components**:

```javascript
/**
 * DateExpressionInput Component
 * Input field with validation and preview for date expressions
 */
function DateExpressionInput({ value, onChange, error }) {
  // Renders: Textfield + validation message + date preview
}

/**
 * SelectFieldDropdown Component
 * Dropdown for select field options
 */
function SelectFieldDropdown({ fieldKey, projectKey, value, onChange }) {
  // Uses: requestJira from @forge/bridge to fetch options
  // Renders: Select component with options from Jira
}
```

### 5. Start Node Validation (Frontend)

**Location**: `static/admin-page/src/components/FlowBuilder.jsx`

**Implementation**:
- Modify `addNode` function to check for existing Start nodes
- Add validation in flow load to ensure single Start node
- Display error message when attempting to add duplicate Start node

**Changes**:
```javascript
const addNode = (nodeType) => {
  // Check if adding Start node and one already exists
  if (nodeType === 'start') {
    const existingStartNode = nodes.find(n => n.type === 'start');
    if (existingStartNode) {
      // Show error message
      setStartNodeError('Only one Start node is allowed per flow');
      return;
    }
  }
  
  // Proceed with adding node...
};
```

### 6. Backend Execution Updates

**Location**: `src/index.js`

**Updates to `evaluateLogicNode` resolver**:
- Add date expression evaluation for expectedValue
- Support date comparisons with proper operators
- Handle Question node references for date values

**Updates to `setIssueField` resolver**:
- Add date expression evaluation before setting field
- Format date according to Jira requirements
- Handle select field values

## Data Models

### Date Expression Object

```javascript
{
  type: 'relative' | 'function' | 'expression',
  
  // For type: 'relative'
  value: number,        // e.g., 7
  unit: 'd'|'w'|'m'|'y', // e.g., 'd'
  
  // For type: 'function'
  function: string,     // e.g., 'today', 'startofweek'
  
  // For type: 'expression'
  function: string,     // e.g., 'today'
  operator: '+'|'-',    // e.g., '+'
  relative: {           // e.g., { value: 7, unit: 'd' }
    value: number,
    unit: 'd'|'w'|'m'|'y'
  }
}
```

### Field Metadata Object

```javascript
{
  fieldKey: string,           // e.g., 'duedate', 'priority'
  fieldType: string,          // e.g., 'date', 'select', 'text'
  name: string,               // e.g., 'Due Date', 'Priority'
  options?: Array<{           // For select fields
    value: string,            // e.g., 'high'
    label: string             // e.g., 'High'
  }>,
  error?: string              // If fetch failed
}
```

### Updated Logic Node Data

```javascript
{
  fieldKey: string,
  operator: 'equals' | 'notEquals' | 'contains' | 'greaterThan' | 'lessThan' | 'isEmpty' | 'isNotEmpty',
  expectedValue: any,
  
  // New fields for Question node references
  valueSource: 'static' | 'question',  // Where the comparison value comes from
  questionNodeId?: string               // ID of Question node if valueSource is 'question'
}
```

### Updated Action Node Data

```javascript
{
  actionType: 'setField' | 'addLabel' | 'addComment',
  
  // For setField
  fieldKey: string,
  fieldValue: any,
  fieldType?: string,  // New: Cached field type for UI rendering
  
  // For addLabel
  label: string,
  
  // For addComment
  comment: string
}
```


## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system-essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property 1: Relative date expression parsing
*For any* valid relative date expression in the format "{number}{unit}" where unit is one of [d, w, m, y], the parser should successfully parse it and return a valid parsed object.
**Validates: Requirements 1.1**

### Property 2: Date function parsing
*For any* date function from the set [today(), startofweek(), endofweek(), startofmonth(), endofmonth(), startofyear(), endofyear()], the parser should successfully parse it and return a valid parsed object.
**Validates: Requirements 1.2**

### Property 3: Combined date expression parsing
*For any* valid combination of a date function, an operator (+/-), and a relative date expression, the parser should successfully parse it and return a valid parsed object.
**Validates: Requirements 1.3**

### Property 4: Relative date evaluation correctness
*For any* relative date expression and base date, evaluating the expression should produce a date that is exactly the specified duration from the base date.
**Validates: Requirements 1.4, 1.6, 1.7, 1.8, 1.9**

### Property 5: Date function evaluation correctness
*For any* date function and base date, evaluating the function should produce the correct calendar boundary date (e.g., startofweek returns Monday, endofmonth returns last day of month).
**Validates: Requirements 4.2, 4.3, 4.4, 4.5, 4.6, 4.7, 4.8, 4.9, 4.10**

### Property 6: Date expression evaluation with addition
*For any* date function result and relative date expression with "+" operator, the evaluated result should equal the function result plus the relative duration.
**Validates: Requirements 4.11**

### Property 7: Date expression evaluation with subtraction
*For any* date function result and relative date expression with "-" operator, the evaluated result should equal the function result minus the relative duration.
**Validates: Requirements 4.12**

### Property 8: Date comparison at day level
*For any* two dates with the same year, month, and day but different times, comparing them with the "equals" operator should return true.
**Validates: Requirements 2.1**

### Property 9: Date greater than comparison
*For any* two dates where date A is chronologically after date B, comparing A > B should return true.
**Validates: Requirements 2.2**

### Property 10: Date less than comparison
*For any* two dates where date A is chronologically before date B, comparing A < B should return true.
**Validates: Requirements 2.3**

### Property 11: Date field non-empty check
*For any* non-null date value, the "isNotEmpty" operator should return true.
**Validates: Requirements 2.5**

### Property 12: Question node date storage
*For any* date value provided as an answer to a Question node with questionType "date", the value should be stored in execution state as a date type.
**Validates: Requirements 3.1**

### Property 13: Question node reference retrieval
*For any* Logic Node that references a Question Node for its comparison value, the system should retrieve the answer from the execution state.
**Validates: Requirements 3.4**

### Property 14: Date comparison operator consistency
*For any* date comparison operator (equals, greaterThan, lessThan), the behavior should be identical whether comparing against a static value or a Question node answer.
**Validates: Requirements 3.3**

### Property 15: Action node date expression acceptance
*For any* Action Node with actionType "setField" targeting a date field, the system should accept any valid date expression as the fieldValue.
**Validates: Requirements 4.1**

### Property 16: Action node date expression evaluation
*For any* Action Node executing with a date expression, the expression should be evaluated to an absolute date before the Jira API call.
**Validates: Requirements 4.13**

### Property 17: Jira date format compliance
*For any* date value being set on a Jira field, the formatted output should comply with Jira's date field format requirements.
**Validates: Requirements 4.14**

### Property 18: Select field options fetching
*For any* Action Node configured with a select field, the system should fetch the available options from Jira.
**Validates: Requirements 5.1**

### Property 19: Select field dropdown rendering
*For any* select field with fetched options, the Node Properties Panel should render a dropdown component containing all available options.
**Validates: Requirements 5.2**

### Property 20: Select field value storage
*For any* option selected from a select field dropdown, the selected value should be stored as the fieldValue in the node data.
**Validates: Requirements 5.3**

### Property 21: Select field execution
*For any* Action Node executing with a select field, the selected option value should be sent to the Jira API.
**Validates: Requirements 5.4**

### Property 22: Start node uniqueness enforcement
*For any* flow canvas that already contains a Start node, attempting to add another Start node should be prevented and an error message should be displayed.
**Validates: Requirements 6.1, 6.3**

### Property 23: Flow load validation
*For any* flow loaded from storage, the system should validate that at most one Start node exists in the nodes array.
**Validates: Requirements 6.2**

### Property 24: Start node addition when none exists
*For any* flow canvas that contains zero Start nodes, adding a Start node should succeed.
**Validates: Requirements 6.4**

### Property 25: Start node re-addition after deletion
*For any* flow canvas where the only Start node is deleted, adding a new Start node should succeed.
**Validates: Requirements 6.5**

### Property 26: Date expression preview display
*For any* node (Logic or Action) displaying a date expression, the UI should show both the expression text and a preview of the evaluated absolute date.
**Validates: Requirements 7.1, 7.2, 7.3, 7.5**

### Property 27: Invalid date expression error display
*For any* invalid date expression entered by the user, the system should display a validation error message.
**Validates: Requirements 7.4**

### Property 28: Date expression format validation
*For any* date expression input, the system should validate it matches one of the supported formats (relative, function, or combined expression).
**Validates: Requirements 8.1, 8.4, 8.5**

### Property 29: Invalid unit error messaging
*For any* relative date expression with an invalid unit (not d, w, m, or y), the system should display an error message listing the valid units.
**Validates: Requirements 8.2**

### Property 30: Non-numeric value error messaging
*For any* relative date expression with a non-numeric value, the system should display an error message.
**Validates: Requirements 8.3**

### Property 31: Invalid syntax error messaging
*For any* date expression with invalid syntax, the system should display an error message indicating the correct format.
**Validates: Requirements 8.6**

### Property 32: Valid expression success indication
*For any* valid date expression, the system should display a success indicator or preview.
**Validates: Requirements 8.7**

## Error Handling

### Date Expression Errors

1. **Invalid Format**: When a date expression doesn't match any supported format
   - Display: "Invalid date expression format. Use: {number}{unit}, function(), or function() +/- {number}{unit}"
   - Example: "abc" → Error

2. **Invalid Unit**: When a relative expression uses an unsupported unit
   - Display: "Invalid unit. Supported units: d (days), w (weeks), m (months), y (years)"
   - Example: "7x" → Error

3. **Invalid Function**: When a function name is not recognized
   - Display: "Unknown date function. Supported: today(), startofweek(), endofweek(), startofmonth(), endofmonth(), startofyear(), endofyear()"
   - Example: "tomorrow()" → Error

4. **Invalid Expression Syntax**: When a combined expression has incorrect syntax
   - Display: "Invalid expression syntax. Use: function() +/- {number}{unit}"
   - Example: "today() 7d" → Error (missing operator)

### Field Metadata Errors

1. **Field Not Found**: When a Jira field doesn't exist
   - Display: "Field '{fieldKey}' not found in project"
   - Fallback: Allow text input

2. **API Failure**: When Jira API call fails
   - Display: "Failed to fetch field metadata. Using text input."
   - Fallback: Render text input instead of dropdown

3. **Options Fetch Failure**: When select field options can't be retrieved
   - Display: "Failed to fetch field options. Using text input."
   - Fallback: Render text input
   - Log error for debugging

### Start Node Validation Errors

1. **Duplicate Start Node**: When attempting to add a second Start node
   - Display: "Only one Start node is allowed per flow"
   - Action: Prevent node addition
   - UI: Show error message banner for 5 seconds

2. **Multiple Start Nodes on Load**: When loading a flow with multiple Start nodes
   - Display: "Warning: Flow contains multiple Start nodes. Please remove duplicates."
   - Action: Allow editing but highlight issue
   - Validation: Prevent saving until resolved

### Execution Errors

1. **Date Evaluation Failure**: When a date expression can't be evaluated during execution
   - Log error with expression details
   - Skip action or use fallback value
   - Add to audit log

2. **Field Update Failure**: When Jira API rejects a field update
   - Log error with field details
   - Add to audit log with error message
   - Display error in debugger view

## Testing Strategy

### Unit Testing

Unit tests will cover specific examples and edge cases:

1. **Date Expression Parser**
   - Valid formats: "7d", "today()", "today() + 7d"
   - Invalid formats: "abc", "7x", "tomorrow()"
   - Edge cases: "0d", "999y", empty string

2. **Date Expression Evaluator**
   - Each date function with known dates
   - Relative expressions with known base dates
   - Combined expressions
   - Edge cases: leap years, month boundaries, year boundaries

3. **Field Metadata Fetching**
   - Successful fetch with mock API
   - API failure handling
   - Different field types (date, select, text)

4. **Start Node Validation**
   - Adding Start node to empty canvas
   - Attempting to add duplicate Start node
   - Deleting and re-adding Start node

### Property-Based Testing

Property-based tests will verify universal properties across many inputs:

**Testing Framework**: We will use **fast-check** for JavaScript property-based testing, as it's the most mature and widely-used PBT library for JavaScript/Node.js.

**Configuration**: Each property-based test will run a minimum of 100 iterations to ensure thorough coverage of the input space.

**Test Organization**: 
- Backend tests: `src/__tests__/dateExpression.pbt.test.js`
- Frontend tests: `static/admin-page/src/__tests__/dateExpression.pbt.test.js`

**Property Tests**:

1. **Date Expression Round-Trip** (Properties 1-3)
   - Generate random valid expressions
   - Parse and verify success
   - Verify parsed structure is correct

2. **Date Evaluation Correctness** (Properties 4-7)
   - Generate random dates and expressions
   - Evaluate and verify result matches expected calculation
   - Test all units (d, w, m, y)
   - Test all functions
   - Test all operators (+, -)

3. **Date Comparison Consistency** (Properties 8-11, 14)
   - Generate random date pairs
   - Verify comparison operators work correctly
   - Verify consistency between static and question values

4. **Start Node Uniqueness** (Properties 22-25)
   - Generate random node arrays
   - Verify validation logic
   - Test addition/deletion scenarios

5. **Validation Error Messages** (Properties 27-32)
   - Generate random invalid inputs
   - Verify appropriate error messages
   - Verify valid inputs show success

### Integration Testing

Integration tests will verify component interactions:

1. **Admin Page Flow**
   - Create Logic node with date expression
   - Verify preview updates in real-time
   - Save and reload flow
   - Verify expression persists

2. **Action Node Field Type Detection**
   - Configure Action node with date field
   - Verify date expression input appears
   - Configure Action node with select field
   - Verify dropdown appears with options

3. **Start Node Validation Flow**
   - Add Start node to canvas
   - Attempt to add second Start node
   - Verify error message
   - Delete Start node
   - Add new Start node
   - Verify success

4. **Execution Flow**
   - Create flow with date Logic node
   - Execute in issue panel
   - Verify date expression evaluates correctly
   - Verify action executes with correct date

### Manual Testing Scenarios

1. **Date Expression UI**
   - Enter various date expressions
   - Verify preview updates
   - Verify validation messages
   - Test with different date functions

2. **Select Field Dropdown**
   - Configure Action node with select field
   - Verify dropdown loads options
   - Select option and save
   - Verify value persists

3. **Start Node Constraint**
   - Create new flow (has default Start node)
   - Try to add another Start node
   - Verify error message
   - Delete Start node
   - Add new Start node
   - Verify success

## Implementation Notes

### Date Calculation Libraries

We will use native JavaScript `Date` object for date calculations to avoid external dependencies. For more complex date operations (like "startofweek"), we'll implement utility functions:

```javascript
function getStartOfWeek(date) {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1); // Adjust for Sunday
  return new Date(d.setDate(diff));
}
```

### Caching Strategy

To minimize API calls for field metadata:

1. **Frontend Cache**: Store field metadata in component state with 5-minute TTL
2. **Backend Cache**: Use Forge Storage with 1-hour TTL for field metadata
3. **Cache Key**: `field-metadata:{projectKey}:{fieldKey}`

### Performance Considerations

1. **Debounce Input**: Debounce date expression input validation by 300ms to avoid excessive calculations
2. **Lazy Loading**: Only fetch field metadata when field key changes
3. **Memoization**: Memoize date function results within the same render cycle

### Backward Compatibility

Existing flows without date expressions will continue to work:
- Logic nodes with static date values will work as before
- Action nodes with static values will work as before
- No migration needed for existing flows

New features are additive and don't break existing functionality.

