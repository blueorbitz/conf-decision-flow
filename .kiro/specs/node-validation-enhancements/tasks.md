# Implementation Plan

- [x] 1. Create date expression utilities





  - Create date expression parser and evaluator utilities that will be shared between frontend and backend
  - Implement support for relative dates, date functions, and combined expressions
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.6, 1.7, 1.8, 1.9_

- [x] 1.1 Implement date expression parser


  - Write parser function to validate and parse date expressions
  - Support relative format: "{number}{unit}"
  - Support function format: "today()", "startofweek()", etc.
  - Support combined format: "function() +/- {number}{unit}"
  - _Requirements: 1.1, 1.2, 1.3_

- [ ]* 1.2 Write property test for date expression parser
  - **Property 1: Relative date expression parsing**
  - **Property 2: Date function parsing**
  - **Property 3: Combined date expression parsing**
  - **Validates: Requirements 1.1, 1.2, 1.3**

- [x] 1.3 Implement date expression evaluator


  - Write evaluator function to convert expressions to absolute dates
  - Implement relative date calculation (add days/weeks/months/years)
  - Implement date functions (today, startofweek, endofweek, etc.)
  - Implement expression evaluation (function + operator + relative)
  - _Requirements: 1.4, 1.6, 1.7, 1.8, 1.9, 4.2, 4.3, 4.4, 4.5, 4.6, 4.7, 4.8, 4.9, 4.10, 4.11, 4.12_

- [ ]* 1.4 Write property test for date expression evaluator
  - **Property 4: Relative date evaluation correctness**
  - **Property 5: Date function evaluation correctness**
  - **Property 6: Date expression evaluation with addition**
  - **Property 7: Date expression evaluation with subtraction**
  - **Validates: Requirements 1.4, 1.6, 1.7, 1.8, 1.9, 4.2-4.12**



- [ ] 1.5 Implement date expression validator
  - Write validation function with detailed error messages
  - Validate format, units, functions, and syntax
  - Return helpful error messages for invalid inputs
  - _Requirements: 8.1, 8.2, 8.3, 8.4, 8.5, 8.6_

- [ ]* 1.6 Write property test for date expression validator
  - **Property 28: Date expression format validation**
  - **Property 29: Invalid unit error messaging**
  - **Property 30: Non-numeric value error messaging**
  - **Property 31: Invalid syntax error messaging**
  - **Validates: Requirements 8.1, 8.2, 8.3, 8.4, 8.5, 8.6**

- [ ] 2. Create field metadata fetcher utility (Frontend)
  - Create utility to fetch Jira field metadata using requestJira from @forge/bridge
  - Detect field types (date, select, text, number, etc.)
  - Fetch select field options
  - Implement caching to minimize API calls
  - _Requirements: 5.1_

- [ ] 2.1 Implement field metadata fetcher
  - Write function to call Jira REST API /rest/api/3/field
  - Parse field schema to determine field type
  - Extract select field options from configuration
  - Implement error handling for API failures
  - _Requirements: 5.1, 5.5_

- [ ]* 2.2 Write property test for field metadata fetcher
  - **Property 18: Select field options fetching**
  - **Validates: Requirements 5.1**

- [ ] 2.3 Implement field metadata caching
  - Add caching layer with 5-minute TTL
  - Use component state for cache storage
  - Implement cache key format: "field-metadata:{projectKey}:{fieldKey}"
  - _Requirements: 5.1_

- [ ] 3. Create DateExpressionInput component
  - Create reusable component for date expression input with validation and preview
  - Show real-time validation errors
  - Display preview of evaluated date
  - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5, 8.7_

- [ ] 3.1 Implement DateExpressionInput component
  - Create component with Textfield from @atlaskit/textfield
  - Add real-time validation using date expression validator
  - Display validation errors inline
  - Show preview of evaluated date below input
  - Debounce validation by 300ms
  - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5, 8.7_

- [ ]* 3.2 Write property test for DateExpressionInput
  - **Property 26: Date expression preview display**
  - **Property 27: Invalid date expression error display**
  - **Property 32: Valid expression success indication**
  - **Validates: Requirements 7.1, 7.2, 7.3, 7.4, 7.5, 8.7**

- [ ] 4. Create SelectFieldDropdown component
  - Create reusable component for select field dropdown
  - Fetch options from Jira using requestJira
  - Handle loading and error states
  - _Requirements: 5.1, 5.2, 5.3, 5.5_

- [ ] 4.1 Implement SelectFieldDropdown component
  - Create component with Select from @atlaskit/select
  - Fetch field options using field metadata fetcher
  - Show loading spinner while fetching
  - Display error message and fallback to text input on failure
  - _Requirements: 5.1, 5.2, 5.3, 5.5_

- [ ]* 4.2 Write property test for SelectFieldDropdown
  - **Property 19: Select field dropdown rendering**
  - **Property 20: Select field value storage**
  - **Validates: Requirements 5.2, 5.3**

- [ ] 5. Update NodePropertiesPanel for Logic nodes
  - Enhance Logic node configuration to support date expressions
  - Add date expression input for date field comparisons
  - Support Question node references for comparison values
  - _Requirements: 1.1, 1.2, 1.3, 3.2, 3.4_

- [ ] 5.1 Add date expression support to Logic node panel
  - Detect when fieldKey is a date field
  - Render DateExpressionInput for expectedValue
  - Add option to select Question node as value source
  - Display dropdown of date Question nodes when valueSource is "question"
  - _Requirements: 1.1, 1.2, 1.3, 3.2, 3.4_

- [ ]* 5.2 Write property test for Logic node date expressions
  - **Property 13: Question node reference retrieval**
  - **Validates: Requirements 3.4**

- [ ] 6. Update NodePropertiesPanel for Action nodes
  - Enhance Action node configuration to support date expressions and select fields
  - Dynamically render appropriate input based on field type
  - _Requirements: 4.1, 5.1, 5.2_

- [ ] 6.1 Add field type detection to Action node panel
  - Fetch field metadata when fieldKey changes
  - Store field type in component state
  - Show loading indicator while fetching
  - _Requirements: 5.1_

- [ ] 6.2 Add dynamic input rendering to Action node panel
  - Render DateExpressionInput for date fields
  - Render SelectFieldDropdown for select fields
  - Render standard Textfield for other fields
  - _Requirements: 4.1, 5.2_

- [ ]* 6.3 Write property test for Action node field type handling
  - **Property 15: Action node date expression acceptance**
  - **Validates: Requirements 4.1**

- [ ] 7. Update node display components
  - Update LogicNode and ActionNode components to show date expression previews
  - Display both expression and evaluated date in node summary
  - _Requirements: 7.1, 7.3_

- [ ] 7.1 Update LogicNode component
  - Modify conditionSummary to detect date expressions
  - Show expression and preview: "duedate > today() + 7d (2024-01-15)"
  - _Requirements: 7.1_

- [ ] 7.2 Update ActionNode component
  - Modify actionSummary to detect date expressions
  - Show expression and preview: "Set duedate to startofweek() (2024-01-08)"
  - _Requirements: 7.3_

- [ ] 8. Implement Start node validation
  - Add validation to prevent multiple Start nodes on canvas
  - Display error message when attempting to add duplicate
  - Validate on flow load
  - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5_

- [ ] 8.1 Add Start node validation to FlowBuilder
  - Modify addNode function to check for existing Start nodes
  - Display error message when duplicate detected
  - Add state for error message display
  - _Requirements: 6.1, 6.3_

- [ ]* 8.2 Write property test for Start node validation
  - **Property 22: Start node uniqueness enforcement**
  - **Property 23: Flow load validation**
  - **Property 24: Start node addition when none exists**
  - **Property 25: Start node re-addition after deletion**
  - **Validates: Requirements 6.1, 6.2, 6.3, 6.4, 6.5**

- [ ] 8.3 Add Start node validation on flow load
  - Check nodes array for multiple Start nodes
  - Display warning message if multiple found
  - Prevent saving until resolved
  - _Requirements: 6.2_

- [ ] 9. Update backend execution logic
  - Enhance backend resolvers to support date expressions and Question node references
  - Update Logic node evaluation
  - Update Action node execution
  - _Requirements: 1.5, 2.1, 2.2, 2.3, 2.4, 2.5, 3.1, 3.3, 4.13, 4.14, 5.4_

- [ ] 9.1 Update evaluateLogicNode resolver
  - Add date expression evaluation for expectedValue
  - Support Question node references (valueSource: "question")
  - Implement date comparison operators (equals, greaterThan, lessThan, isEmpty, isNotEmpty)
  - Compare dates at day level for "equals" operator
  - _Requirements: 1.5, 2.1, 2.2, 2.3, 2.4, 2.5, 3.3_

- [ ]* 9.2 Write property test for Logic node evaluation
  - **Property 8: Date comparison at day level**
  - **Property 9: Date greater than comparison**
  - **Property 10: Date less than comparison**
  - **Property 11: Date field non-empty check**
  - **Property 14: Date comparison operator consistency**
  - **Validates: Requirements 2.1, 2.2, 2.3, 2.5, 3.3**

- [ ] 9.3 Update submitAnswer resolver
  - Store date answers as Date objects in execution state
  - Validate date format from user input
  - _Requirements: 3.1_

- [ ]* 9.4 Write property test for Question node date storage
  - **Property 12: Question node date storage**
  - **Validates: Requirements 3.1**

- [ ] 9.5 Update setIssueField action
  - Add date expression evaluation before API call
  - Format date according to Jira requirements (YYYY-MM-DD)
  - Handle select field values
  - _Requirements: 4.13, 4.14, 5.4_

- [ ]* 9.6 Write property test for Action node execution
  - **Property 16: Action node date expression evaluation**
  - **Property 17: Jira date format compliance**
  - **Property 21: Select field execution**
  - **Validates: Requirements 4.13, 4.14, 5.4**

- [ ] 10. Copy date utilities to frontend
  - Copy date expression parser and evaluator to admin-page and issue-panel
  - Ensure consistent behavior between frontend and backend
  - _Requirements: All date-related requirements_

- [ ] 10.1 Copy utilities to admin-page
  - Copy dateExpressionParser.js to static/admin-page/src/utils/
  - Copy dateExpressionEvaluator.js to static/admin-page/src/utils/
  - Verify imports work correctly
  - _Requirements: All date-related requirements_

- [ ] 10.2 Copy utilities to issue-panel
  - Copy dateExpressionParser.js to static/issue-panel/src/utils/
  - Copy dateExpressionEvaluator.js to static/issue-panel/src/utils/
  - Verify imports work correctly
  - _Requirements: All date-related requirements_

- [ ] 11. Checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 12. Update issue panel for date expressions
  - Update QuestionnaireView to handle date expressions in Logic nodes
  - Display evaluated dates in flow execution
  - _Requirements: 1.5, 2.1, 2.2, 2.3_

- [ ] 12.1 Update QuestionnaireView Logic node handling
  - Evaluate date expressions when Logic node is reached
  - Use date comparison logic from backend
  - Display evaluated dates in UI for debugging
  - _Requirements: 1.5, 2.1, 2.2, 2.3_

- [ ] 13. Add error handling and user feedback
  - Implement comprehensive error handling for all new features
  - Add user-friendly error messages
  - Add loading states
  - _Requirements: 5.5, 7.4, 8.2, 8.3, 8.6_

- [ ] 13.1 Add error handling for field metadata fetching
  - Display error message when API fails
  - Fallback to text input on error
  - Log errors for debugging
  - _Requirements: 5.5_

- [ ] 13.2 Add error handling for date expression validation
  - Display inline validation errors
  - Show helpful error messages with correct format
  - Clear errors when input becomes valid
  - _Requirements: 7.4, 8.2, 8.3, 8.6_

- [ ] 13.3 Add error handling for Start node validation
  - Display error banner when duplicate Start node attempted
  - Auto-dismiss after 5 seconds
  - Show warning on flow load if multiple Start nodes exist
  - _Requirements: 6.1, 6.2_

- [ ] 14. Final checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.
