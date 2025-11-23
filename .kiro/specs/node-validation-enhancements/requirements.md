# Requirements Document

## Introduction

This feature enhances the Decision Flow Builder with improved node validation and date handling capabilities. The enhancements focus on three key areas: (1) supporting relative date comparisons in Logic nodes (e.g., "7d" to represent 7 days from today), (2) enabling date field comparisons across Question, Logic, and Action nodes, and (3) enforcing the constraint that only one Start node can exist on the canvas at any time.

## Glossary

- **Decision Flow Builder**: The Atlassian Forge app that allows Jira admins to create conditional decision flows
- **Logic Node**: A node type that evaluates Jira field values or user answers against conditions to determine flow branching
- **Question Node**: A node type that prompts users for input during flow execution
- **Action Node**: A node type that performs operations on Jira issues when reached during flow execution
- **Start Node**: The entry point node where flow execution begins
- **Relative Date Expression**: A string format representing a date relative to today (e.g., "7d" = 7 days from today, "2w" = 2 weeks from today)
- **Date Function**: A function that returns a date value (e.g., "today()", "startofweek()", "endofmonth()")
- **Date Expression**: A combination of date functions and relative date expressions (e.g., "today() + 7d", "startofweek() - 1d")
- **Flow Canvas**: The visual workspace in the admin page where nodes are placed and connected
- **Date Field**: A Jira field or question response that contains date values
- **Select Field**: A Jira field that allows selection from a predefined list of options

## Requirements

### Requirement 1

**User Story:** As a flow designer, I want to compare date fields using date expressions and functions, so that I can create time-based logic that automatically adjusts based on the current date and calendar boundaries.

#### Acceptance Criteria

1. WHEN a Logic Node is configured with a date field comparison THEN the system SHALL accept relative date expressions in the format "{number}{unit}" where unit is "d" (days), "w" (weeks), "m" (months), or "y" (years)
2. WHEN a Logic Node is configured with a date field comparison THEN the system SHALL accept date functions including "today()", "startofweek()", "endofweek()", "startofmonth()", "endofmonth()", "startofyear()", and "endofyear()"
3. WHEN a Logic Node is configured with a date field comparison THEN the system SHALL accept date expressions combining functions and relative expressions using "+" or "-" operators
4. WHEN a relative date expression is evaluated THEN the system SHALL calculate the absolute date by adding the specified duration to the current date
5. WHEN a Logic Node compares a date field against a date expression THEN the system SHALL evaluate the expression to an absolute date before performing the comparison
6. WHEN a relative date expression uses "d" as the unit THEN the system SHALL interpret it as calendar days from today
7. WHEN a relative date expression uses "w" as the unit THEN the system SHALL interpret it as weeks (7 days) from today
8. WHEN a relative date expression uses "m" as the unit THEN the system SHALL interpret it as months from today
9. WHEN a relative date expression uses "y" as the unit THEN the system SHALL interpret it as years from today

### Requirement 2

**User Story:** As a flow designer, I want to use date comparisons with all supported operators, so that I can create flexible date-based conditional logic.

#### Acceptance Criteria

1. WHEN a Logic Node evaluates a date field with the "equals" operator THEN the system SHALL compare dates at the day level ignoring time components
2. WHEN a Logic Node evaluates a date field with the "greaterThan" operator THEN the system SHALL return true if the field date is after the comparison date
3. WHEN a Logic Node evaluates a date field with the "lessThan" operator THEN the system SHALL return true if the field date is before the comparison date
4. WHEN a Logic Node evaluates a date field with the "isEmpty" operator THEN the system SHALL return true if the date field has no value
5. WHEN a Logic Node evaluates a date field with the "isNotEmpty" operator THEN the system SHALL return true if the date field has a value

### Requirement 3

**User Story:** As a flow designer, I want to compare date values from Question nodes against Jira date fields, so that I can create logic based on user-provided dates.

#### Acceptance Criteria

1. WHEN a Question Node has questionType "date" THEN the system SHALL store the user's answer as a date value
2. WHEN a Logic Node is configured to compare against a Question Node answer THEN the system SHALL support date comparisons if the question type is "date"
3. WHEN a Logic Node compares a Jira date field against a date Question answer THEN the system SHALL perform date comparison using the same operators as static date comparisons
4. WHEN a Logic Node references a Question Node for comparison value THEN the system SHALL retrieve the answer from the execution state

### Requirement 4

**User Story:** As a flow designer, I want Action nodes to support setting date fields with date functions and expressions, so that I can automatically set dates based on the current date and calendar boundaries.

#### Acceptance Criteria

1. WHEN an Action Node is configured with actionType "setField" and the target field is a date field THEN the system SHALL accept relative date expressions as the fieldValue
2. WHEN an Action Node is configured with a date field THEN the system SHALL support date functions including "today()", "startofweek()", "endofweek()", "startofmonth()", "endofmonth()", "startofyear()", and "endofyear()"
3. WHEN an Action Node is configured with a date field THEN the system SHALL support date expressions combining functions and relative expressions using "+" or "-" operators (e.g., "today() + 7d", "startofweek() - 1d")
4. WHEN a date function "today()" is evaluated THEN the system SHALL return the current date at midnight
5. WHEN a date function "startofweek()" is evaluated THEN the system SHALL return the first day of the current week (Monday)
6. WHEN a date function "endofweek()" is evaluated THEN the system SHALL return the last day of the current week (Sunday)
7. WHEN a date function "startofmonth()" is evaluated THEN the system SHALL return the first day of the current month
8. WHEN a date function "endofmonth()" is evaluated THEN the system SHALL return the last day of the current month
9. WHEN a date function "startofyear()" is evaluated THEN the system SHALL return the first day of the current year (January 1)
10. WHEN a date function "endofyear()" is evaluated THEN the system SHALL return the last day of the current year (December 31)
11. WHEN a date expression contains a "+" operator THEN the system SHALL add the relative duration to the function result
12. WHEN a date expression contains a "-" operator THEN the system SHALL subtract the relative duration from the function result
13. WHEN an Action Node executes with a date expression THEN the system SHALL evaluate the expression to an absolute date before updating the Jira field
14. WHEN an Action Node sets a date field THEN the system SHALL format the date value according to Jira's date field requirements

### Requirement 5

**User Story:** As a flow designer, I want Action nodes to support setting select fields with dropdown selection, so that I can set field values from the available options defined in Jira.

#### Acceptance Criteria

1. WHEN an Action Node is configured with actionType "setField" and the target field is a select field THEN the system SHALL fetch the available options from Jira
2. WHEN the Node Properties Panel displays an Action Node with a select field THEN the system SHALL render a dropdown component populated with the field's available options
3. WHEN a user selects an option from the dropdown THEN the system SHALL store the selected option value as the fieldValue
4. WHEN an Action Node executes with a select field THEN the system SHALL set the Jira field to the selected option value
5. WHEN the system fails to fetch select field options THEN the system SHALL display an error message and fall back to a text input

### Requirement 6

**User Story:** As a flow designer, I want the system to prevent multiple Start nodes on the canvas, so that flows have a single, unambiguous entry point.

#### Acceptance Criteria

1. WHEN a user attempts to add a Start node to the canvas and a Start node already exists THEN the system SHALL prevent the addition and display an error message
2. WHEN a flow is loaded from storage THEN the system SHALL validate that at most one Start node exists
3. WHEN a user clicks the "Start" button in the node palette and a Start node already exists THEN the system SHALL display a message indicating that only one Start node is allowed
4. WHEN a flow contains zero Start nodes THEN the system SHALL allow adding a Start node
5. WHEN a user deletes the only Start node THEN the system SHALL allow adding a new Start node

### Requirement 7

**User Story:** As a flow designer, I want clear visual feedback when configuring date comparisons and expressions, so that I understand how they will be evaluated.

#### Acceptance Criteria

1. WHEN a Logic Node displays a relative date expression in its summary THEN the system SHALL show both the expression and the calculated absolute date
2. WHEN the Node Properties Panel displays a Logic Node with a relative date expression THEN the system SHALL show a preview of the calculated date
3. WHEN an Action Node displays a date expression in its summary THEN the system SHALL show both the expression and the calculated absolute date
4. WHEN a user enters an invalid date expression THEN the system SHALL display a validation error message
5. WHEN the Node Properties Panel displays a date expression THEN the system SHALL show a real-time preview of the evaluated date

### Requirement 8

**User Story:** As a flow designer, I want the system to validate date expressions at configuration time, so that I can catch errors before flow execution.

#### Acceptance Criteria

1. WHEN a user enters a relative date expression in the Node Properties Panel THEN the system SHALL validate the format matches "{number}{unit}"
2. WHEN a relative date expression has an invalid unit THEN the system SHALL display an error message listing valid units (d, w, m, y)
3. WHEN a relative date expression has a non-numeric value THEN the system SHALL display an error message
4. WHEN a user enters a date function THEN the system SHALL validate it matches one of the supported functions
5. WHEN a date expression contains an operator THEN the system SHALL validate the syntax matches "function() +/- {number}{unit}"
6. WHEN a date expression has invalid syntax THEN the system SHALL display an error message with the correct format
7. WHEN a date expression is valid THEN the system SHALL display a success indicator or preview
