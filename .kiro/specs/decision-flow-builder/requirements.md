# Requirements Document

## Introduction

The Decision Flow Builder is an Atlassian Forge application that enables Jira administrators to create conditional decision flows with visual questionnaires. The System shall allow administrators to design branching logic trees that guide users through questions, evaluate Jira field conditions, and automatically execute actions on Jira issues based on user responses. The System shall provide a visual flow builder interface for administrators and an interactive questionnaire interface for end users within the Jira issue panel.

## Glossary

- **System**: The Decision Flow Builder Forge application
- **Admin Page**: The visual flow builder interface accessible to Jira administrators
- **Issue Panel**: The user-facing questionnaire interface displayed within Jira issues
- **Flow**: A directed graph consisting of nodes and edges that defines a decision tree
- **Node**: A single element in a flow (Start, Question, Logic, or Action type)
- **Edge**: A connection between two nodes that defines the flow path
- **Execution State**: The current progress of a user through a specific flow on a specific issue
- **Audit Log**: A chronological record of all actions executed by the System
- **Project Binding**: The association of a flow with one or more Jira project keys
- **Logic Evaluation**: The automatic assessment of Jira field conditions to determine flow path

## Requirements

### Requirement 1: Flow Creation and Management

**User Story:** As a Jira administrator, I want to create and manage decision flows using a visual interface, so that I can design conditional workflows without writing code.

#### Acceptance Criteria

1. THE System SHALL provide an admin page module that displays a list of all existing flows
2. WHEN the administrator selects the create flow action, THE System SHALL open a visual flow builder interface
3. THE System SHALL allow the administrator to add nodes of type Start, Question, Logic, and Action to the flow canvas
4. THE System SHALL allow the administrator to connect nodes with edges to define the flow path
5. WHEN the administrator saves a flow, THE System SHALL persist the flow data including nodes, edges, name, description, and project bindings to storage
6. THE System SHALL allow the administrator to edit existing flows by loading the flow data into the visual builder
7. WHEN the administrator deletes a flow, THE System SHALL remove the flow data and all associated execution states from storage

### Requirement 2: Flow Configuration

**User Story:** As a Jira administrator, I want to configure flow properties and node behaviors, so that I can customize how the flow operates for specific projects.

#### Acceptance Criteria

1. THE System SHALL require the administrator to provide a flow name with a minimum length of 1 character
2. THE System SHALL allow the administrator to provide an optional flow description
3. THE System SHALL require the administrator to bind the flow to at least one Jira project key
4. WHEN the administrator selects a Question node, THE System SHALL allow configuration of question text, question type (single choice, multiple choice, date, or number), and answer options
5. WHEN the administrator selects a Logic node, THE System SHALL allow configuration of a Jira field key, comparison operator (equals, notEquals, contains, greaterThan, lessThan, isEmpty, isNotEmpty), and expected value
6. WHEN the administrator selects an Action node, THE System SHALL allow configuration of action type (setField, addLabel, or addComment) and corresponding action parameters

### Requirement 3: Issue Panel Display

**User Story:** As a Jira user, I want to see applicable decision flows in the issue panel, so that I can complete questionnaires relevant to my issue's project.

#### Acceptance Criteria

1. WHEN a user views an issue, THE System SHALL retrieve all flows bound to the issue's project key
2. THE System SHALL display a tab for each applicable flow in the issue panel
3. THE System SHALL indicate flow completion status using color-coded visual indicators (green for completed, orange for incomplete)
4. WHEN no flows are bound to the issue's project, THE System SHALL display an empty state message
5. THE System SHALL provide three sub-views for each flow: Questionnaire, Flow Diagram, and Debugger

### Requirement 4: Questionnaire Execution

**User Story:** As a Jira user, I want to answer questions in a guided flow, so that the system can automatically perform actions based on my responses.

#### Acceptance Criteria

1. WHEN the user opens the Questionnaire view, THE System SHALL display the current question node based on the execution state
2. WHEN the question type is single choice, THE System SHALL render radio button inputs with the configured options
3. WHEN the question type is multiple choice, THE System SHALL render checkbox inputs with the configured options
4. WHEN the question type is date, THE System SHALL render a date picker input
5. WHEN the question type is number, THE System SHALL render a number input field
6. WHEN the user submits an answer, THE System SHALL store the answer in the execution state and progress to the next connected node
7. WHEN the System encounters a Logic node during execution, THE System SHALL automatically evaluate the configured condition against the current Jira issue fields
8. WHEN a Logic node condition evaluates to true, THE System SHALL follow the true edge to the next node
9. WHEN a Logic node condition evaluates to false, THE System SHALL follow the false edge to the next node
10. WHEN the System reaches an Action node, THE System SHALL execute the configured action on the Jira issue
11. WHEN the user selects the reset action, THE System SHALL clear the execution state and return to the start node

### Requirement 5: Action Execution

**User Story:** As a Jira user, I want the system to automatically update my issue based on my questionnaire responses, so that I don't have to manually perform repetitive tasks.

#### Acceptance Criteria

1. WHEN an Action node with type setField is reached, THE System SHALL update the specified Jira field with the configured value using the Jira REST API
2. WHEN an Action node with type addLabel is reached, THE System SHALL add the configured label to the Jira issue using the Jira REST API
3. WHEN an Action node with type addComment is reached, THE System SHALL add the configured comment text to the Jira issue using the Jira REST API
4. WHEN an action execution succeeds, THE System SHALL create an audit log entry with timestamp, node identifier, action details, and success result
5. WHEN an action execution fails, THE System SHALL create an audit log entry with timestamp, node identifier, action details, and error information
6. THE System SHALL display a success message to the user when all actions in a flow complete successfully
7. THE System SHALL display an error message to the user when an action fails to execute

### Requirement 6: Flow Visualization

**User Story:** As a Jira user, I want to see a visual representation of the decision flow, so that I can understand the path I have taken and what remains.

#### Acceptance Criteria

1. WHEN the user opens the Flow Diagram view, THE System SHALL render a read-only visualization of the flow using the same node and edge structure as the admin builder
2. THE System SHALL highlight nodes that have been visited during the current execution with a distinct visual style
3. THE System SHALL highlight the current node in the execution with a distinct visual style
4. THE System SHALL display unvisited nodes with a neutral visual style
5. THE System SHALL disable all editing interactions in the Flow Diagram view
6. THE System SHALL allow zoom and pan interactions in the Flow Diagram view

### Requirement 7: Audit Trail

**User Story:** As a Jira user or administrator, I want to view a history of all actions executed by decision flows, so that I can audit and troubleshoot flow behavior.

#### Acceptance Criteria

1. WHEN the user opens the Debugger view, THE System SHALL display all audit log entries for the current issue and flow combination
2. THE System SHALL display audit log entries in a table format with columns for timestamp, node identifier, action type, result status, and user answers
3. THE System SHALL sort audit log entries in reverse chronological order (newest first)
4. WHEN no audit logs exist for the current issue and flow, THE System SHALL display an empty state message
5. THE System SHALL allow the user to refresh the audit log display to retrieve the latest entries

### Requirement 8: Data Persistence

**User Story:** As a system administrator, I want flow data and execution states to be reliably stored, so that users can resume flows and administrators can manage flows across sessions.

#### Acceptance Criteria

1. THE System SHALL store all flow definitions in Forge Storage using the key pattern "flow:{flowId}"
2. THE System SHALL store a list of all flow identifiers in Forge Storage using the key "decision-flows"
3. THE System SHALL store execution state for each issue and flow combination using the key pattern "exec:{issueKey}:{flowId}"
4. THE System SHALL store audit logs for each issue and flow combination using the key pattern "audit:{issueKey}:{flowId}"
5. WHEN a flow is deleted, THE System SHALL remove the flow definition and the flow identifier from the list
6. THE System SHALL maintain execution state persistence across browser sessions and page refreshes

### Requirement 9: Visual Flow Builder

**User Story:** As a Jira administrator, I want to use drag-and-drop interactions to build flows, so that I can quickly design complex decision trees.

#### Acceptance Criteria

1. THE System SHALL provide a node palette that displays all available node types (Start, Question, Logic, Action)
2. WHEN the administrator selects a node type from the palette, THE System SHALL add a new node of that type to the canvas at a default position
3. THE System SHALL allow the administrator to drag nodes to reposition them on the canvas
4. WHEN the administrator drags from a node handle to another node handle, THE System SHALL create an edge connecting the two nodes
5. THE System SHALL display a properties panel when a node is selected
6. THE System SHALL update node data in real-time as the administrator modifies properties in the properties panel
7. THE System SHALL provide controls for zooming, panning, and fitting the view to the canvas content

### Requirement 10: Multi-Project Support

**User Story:** As a Jira administrator, I want to bind a single flow to multiple projects, so that I can reuse flows across different project contexts.

#### Acceptance Criteria

1. THE System SHALL allow the administrator to specify multiple project keys when configuring a flow
2. WHEN a flow is bound to multiple projects, THE System SHALL display the flow in the issue panel for issues belonging to any of the bound projects
3. THE System SHALL store project bindings as an array of project key strings in the flow definition
4. THE System SHALL validate that at least one project key is provided before allowing the administrator to save a flow
