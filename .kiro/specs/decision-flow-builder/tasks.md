# Implementation Plan

- [x] 1. Backend resolver implementation
  - Implement all resolver functions in src/index.js for flow management, execution, and audit logging
  - Create helper functions for flow traversal, logic evaluation, and condition checking
  - Implement storage operations using Forge Storage API with proper key patterns
  - Implement Jira API integration for field updates, label additions, and comment creation using .asUser()
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 1.6, 1.7, 2.1, 2.2, 2.3, 2.4, 2.5, 2.6, 4.6, 4.7, 4.8, 4.9, 4.10, 4.11, 5.1, 5.2, 5.3, 5.4, 5.5, 5.6, 5.7, 7.1, 7.2, 7.3, 7.4, 7.5, 8.1, 8.2, 8.3, 8.4, 8.5, 8.6_

- [x] 2. Update manifest configuration
  - Add jira:issuePanel module configuration pointing to issue-panel build directory
  - Add required scopes (read:jira-work, write:jira-work, storage:app) if not already present
  - Configure issue-panel resource pointing to static/issue-panel/build
  - Validate manifest syntax using forge lint command
  - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5_

- [x] 3. Setup admin page dependencies and structure
  - Update static/admin-page/package.json with @xyflow/react v12 and required Atlaskit packages
  - Install dependencies using npm install in static/admin-page directory
  - Create component directory structure (components/, components/nodes/, styles/)
  - _Requirements: 9.1, 9.2, 9.3, 9.4, 9.5, 9.6, 9.7_

- [x] 4. Implement admin page flow list view
  - Create FlowList.js component with DynamicTable displaying all flows
  - Implement Create New Flow button that navigates to flow builder
  - Implement Edit and Delete actions for each flow row
  - Add loading state with Spinner and empty state message
  - Integrate @forge/bridge invoke() calls for getFlows and deleteFlow
  - _Requirements: 1.1, 1.2, 1.6, 1.7_

- [ ] 5. Implement admin page flow builder core
  - Create FlowBuilder.js component with ReactFlow canvas setup
  - Implement node palette sidebar with buttons for each node type (Start, Question, Logic, Action)
  - Implement node addition, dragging, and edge connection functionality
  - Add top toolbar with Settings, Save, and Cancel buttons
  - Integrate @forge/bridge invoke() calls for getFlow and saveFlow
  - _Requirements: 1.2, 1.3, 1.4, 1.5, 9.1, 9.2, 9.3, 9.4, 9.5, 9.6, 9.7_

- [ ] 6. Implement custom node components for flow builder
  - Create StartNode.js with green styling, rocket icon, and single source handle
  - Create QuestionNode.js with blue styling, question preview, and target/source handles
  - Create LogicNode.js with purple styling, condition display, and two source handles (true/false)
  - Create ActionNode.js with orange styling, action preview, and single target handle
  - Use Atlaskit design tokens for consistent theming
  - _Requirements: 9.1, 9.2, 9.3, 9.4, 9.5, 9.6, 9.7_

- [ ] 7. Implement node properties panel
  - Create NodePropertiesPanel.js component that displays when a node is selected
  - Implement conditional form fields based on node type (Question, Logic, Action)
  - Add real-time updates to node data as properties are modified
  - Implement Delete Node button that removes node and connected edges
  - Use Atlaskit form components (Textfield, Textarea, Select) with validation
  - _Requirements: 2.4, 2.5, 2.6, 9.6_

- [ ] 8. Implement flow settings modal
  - Create FlowSettings.js modal dialog component
  - Add form fields for flow name (required), description (optional), and project keys (comma-separated, required)
  - Implement form validation ensuring name is non-empty and at least one project key is provided
  - Add Save and Cancel buttons with proper modal close handling
  - _Requirements: 2.1, 2.2, 2.3, 10.1, 10.2, 10.3, 10.4_

- [ ] 9. Setup issue panel structure and dependencies
  - Create static/issue-panel directory with Create React App structure
  - Create package.json with React 16, @xyflow/react v12, Atlaskit packages, and @forge/bridge
  - Create public/index.html and src/index.js entry point
  - Install dependencies using npm install in static/issue-panel directory
  - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5_

- [ ] 10. Implement issue panel app and flow tabs
  - Create App.js that retrieves issue context using view.getContext()
  - Implement flow loading using invoke('getFlowsForIssue') based on issue's project key
  - Create FlowTabs.js component displaying tabs for each applicable flow
  - Implement color-coded completion status indicators (green for completed, orange for incomplete)
  - Add view selector for Questionnaire, Flow Diagram, and Debugger sub-views
  - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5_

- [ ] 11. Implement questionnaire view
  - Create QuestionnaireView.js component that displays current question based on execution state
  - Implement conditional input rendering: RadioGroup for single choice, Checkboxes for multiple choice, DatePicker for date, Textfield for number
  - Add Submit button that calls invoke('submitAnswer') and progresses to next node
  - Add Reset button that calls invoke('resetExecution') and returns to start
  - Implement automatic logic node evaluation when encountered during flow progression
  - Display completion message using SectionMessage when flow reaches action node
  - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5, 4.6, 4.7, 4.8, 4.9, 4.10, 4.11_

- [ ] 12. Implement flow diagram view
  - Create FlowDiagramView.js component with read-only ReactFlow visualization
  - Implement path highlighting: green for completed nodes, blue for current node, gray for unvisited
  - Disable all editing interactions (nodesDraggable=false, nodesConnectable=false, elementsSelectable=false)
  - Load execution state using invoke('getExecutionState') to determine path and current node
  - Enable zoom and pan controls while preventing node editing
  - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5, 6.6_

- [ ] 13. Implement debugger view
  - Create DebuggerView.js component with DynamicTable displaying audit logs
  - Add columns for Timestamp, Node, Action Type, Result, and Answers
  - Implement Refresh button that reloads audit logs using invoke('getAuditLogs')
  - Display empty state message when no audit logs exist
  - Format timestamps and action details for readability
  - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5_

- [ ] 14. Build and deploy application
  - Run npm run build in static/admin-page directory to create production build
  - Run npm run build in static/issue-panel directory to create production build
  - Run forge lint to validate manifest configuration
  - Run forge deploy --environment development --non-interactive to deploy to development environment
  - Run forge install --site <site-url> --product jira --environment development --non-interactive to install app
  - _Requirements: All requirements_

- [ ] 15. Implement error handling and loading states
  - Add error handling for network failures in all invoke() calls with SectionMessage error display
  - Add loading states with Spinner components during data fetching operations
  - Implement form validation error messages in admin page
  - Add empty state messages for flows, audit logs, and questionnaires
  - _Requirements: All requirements_

- [ ] 16. End-to-end validation testing
  - Create test flow in admin page with all node types (Start, Question, Logic, Action)
  - Bind flow to test project and save
  - Open issue in test project and verify flow appears in issue panel
  - Complete questionnaire by answering all questions
  - Verify logic node evaluates correctly based on issue field values
  - Verify action node executes and modifies Jira issue (field update, label addition, or comment)
  - Check audit log in debugger view to confirm action was recorded
  - Test flow diagram view to verify path highlighting
  - Test reset functionality to clear execution state
  - _Requirements: All requirements_
