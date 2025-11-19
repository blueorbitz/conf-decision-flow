# Testing Flow Diagram
## Decision Flow Builder - Visual Testing Guide

This document provides visual representations of the testing workflow and application flow.

---

## Testing Workflow Diagram

```mermaid
graph TD
    Start([Start Testing]) --> Validate[Run validate-deployment.js]
    Validate --> ValidateCheck{All Checks Pass?}
    ValidateCheck -->|No| FixIssues[Fix Issues]
    FixIssues --> Validate
    ValidateCheck -->|Yes| Deploy[Deploy Application]
    
    Deploy --> Lint[Run forge lint]
    Lint --> LintCheck{Lint Pass?}
    LintCheck -->|No| FixManifest[Fix Manifest]
    FixManifest --> Lint
    LintCheck -->|Yes| ForgeDeploy[forge deploy]
    
    ForgeDeploy --> Install[forge install]
    Install --> SmokeTest[Run Smoke Test]
    
    SmokeTest --> SmokeCheck{Smoke Test Pass?}
    SmokeCheck -->|No| Debug[Debug Issues]
    Debug --> SmokeTest
    SmokeCheck -->|Yes| CompTest[Comprehensive Testing]
    
    CompTest --> ScenarioTest[Scenario Testing]
    ScenarioTest --> Review[Review Results]
    
    Review --> Decision{All Tests Pass?}
    Decision -->|No| FixBugs[Fix Bugs]
    FixBugs --> CompTest
    Decision -->|Yes| SignOff[Sign-Off]
    
    SignOff --> Production[Deploy to Production]
    Production --> End([Testing Complete])
    
    style Start fill:#90EE90
    style End fill:#90EE90
    style Production fill:#FFD700
    style Decision fill:#87CEEB
    style ValidateCheck fill:#87CEEB
    style LintCheck fill:#87CEEB
    style SmokeCheck fill:#87CEEB
```

---

## Application Flow Diagram

```mermaid
graph LR
    Admin[Admin Page] -->|Create/Edit| Flow[Flow Definition]
    Flow -->|Save| Storage[(Forge Storage)]
    
    Storage -->|Load| IssuePanel[Issue Panel]
    IssuePanel -->|Display| Questionnaire[Questionnaire View]
    IssuePanel -->|Display| Diagram[Flow Diagram View]
    IssuePanel -->|Display| Debugger[Debugger View]
    
    Questionnaire -->|Submit Answer| Resolver[Backend Resolver]
    Resolver -->|Evaluate| Logic[Logic Node]
    Logic -->|Execute| Action[Action Node]
    
    Action -->|Update| Jira[Jira Issue]
    Action -->|Log| Audit[(Audit Logs)]
    
    Resolver -->|Update| ExecState[(Execution State)]
    
    style Admin fill:#FFB6C1
    style IssuePanel fill:#87CEEB
    style Resolver fill:#DDA0DD
    style Storage fill:#F0E68C
    style Jira fill:#98FB98
```

---

## Test Coverage Map

```mermaid
mindmap
  root((Testing))
    Flow Management
      Create Flow
      Edit Flow
      Delete Flow
      Save Flow
      Load Flow
    Node Types
      Start Node
      Question Node
        Single Choice
        Multiple Choice
        Date
        Number
      Logic Node
        equals
        notEquals
        contains
        greaterThan
        lessThan
        isEmpty
        isNotEmpty
      Action Node
        setField
        addLabel
        addComment
    User Interface
      Admin Page
        Flow Builder
        Flow List
        Settings Modal
        Properties Panel
      Issue Panel
        Questionnaire View
        Flow Diagram View
        Debugger View
        Flow Tabs
    Integration
      Jira API
      Storage API
      Multi-Project
      Permissions
    Error Handling
      Validation
      Network Errors
      Empty States
      Loading States
```

---

## Test Execution Flow

```mermaid
sequenceDiagram
    participant Tester
    participant Script as validate-deployment.js
    participant Forge as Forge CLI
    participant Jira as Jira Site
    participant App as Application
    
    Tester->>Script: Run validation
    Script->>Script: Check files
    Script->>Script: Check dependencies
    Script->>Script: Check manifest
    Script-->>Tester: Validation results
    
    Tester->>Forge: forge lint
    Forge-->>Tester: No issues
    
    Tester->>Forge: forge deploy
    Forge->>Forge: Build & deploy
    Forge-->>Tester: Deployment success
    
    Tester->>Forge: forge install
    Forge->>Jira: Install app
    Jira-->>Tester: Installation success
    
    Tester->>Jira: Open admin page
    Jira->>App: Load admin page
    App-->>Tester: Display flow builder
    
    Tester->>App: Create test flow
    App->>App: Save flow
    App-->>Tester: Flow saved
    
    Tester->>Jira: Open issue
    Jira->>App: Load issue panel
    App-->>Tester: Display questionnaire
    
    Tester->>App: Submit answer
    App->>App: Execute flow
    App->>Jira: Update issue
    Jira-->>Tester: Issue updated
    
    Tester->>App: Check audit log
    App-->>Tester: Display logs
    
    Tester->>Tester: Document results
```

---

## Decision Flow Example

```mermaid
graph TD
    Start([Start]) --> Q1{Question: Priority?}
    Q1 -->|High| L1{Logic: Status = Done?}
    Q1 -->|Medium| L1
    Q1 -->|Low| L1
    
    L1 -->|True| A1[Action: Add 'complete' label]
    L1 -->|False| A2[Action: Add 'pending' label]
    
    A1 --> End1([End])
    A2 --> End2([End])
    
    style Start fill:#90EE90
    style Q1 fill:#87CEEB
    style L1 fill:#DDA0DD
    style A1 fill:#FFB6C1
    style A2 fill:#FFB6C1
    style End1 fill:#90EE90
    style End2 fill:#90EE90
```

---

## Test Case Relationships

```mermaid
graph TD
    TC001[TC-001: Basic Flow] --> TC002[TC-002: Complete Flow]
    TC002 --> TC003[TC-003: Issue Panel Display]
    TC003 --> TC004[TC-004: Questionnaire Execution]
    TC004 --> TC005[TC-005: Action Verification]
    TC004 --> TC006[TC-006: Flow Diagram]
    TC004 --> TC007[TC-007: Audit Log]
    TC004 --> TC008[TC-008: Reset]
    
    TC002 --> TC009[TC-009: Question Types]
    TC002 --> TC010[TC-010: Logic Operators]
    TC002 --> TC011[TC-011: Action Types]
    
    TC001 --> TC012[TC-012: Multi-Project]
    TC001 --> TC013[TC-013: Flow Editing]
    TC001 --> TC014[TC-014: Flow Deletion]
    
    TC001 --> TC015[TC-015: Validation]
    TC001 --> TC016[TC-016: Edge Cases]
    
    TC003 --> TC017[TC-017: Browser Compat]
    TC003 --> TC018[TC-018: Performance]
    
    style TC001 fill:#90EE90
    style TC002 fill:#87CEEB
    style TC003 fill:#FFB6C1
    style TC004 fill:#DDA0DD
```

---

## Component Architecture

```mermaid
graph TB
    subgraph "Admin Page"
        App1[App.js]
        FlowList[FlowList.js]
        FlowBuilder[FlowBuilder.js]
        FlowSettings[FlowSettings.js]
        NodeProps[NodePropertiesPanel.js]
        
        App1 --> FlowList
        App1 --> FlowBuilder
        FlowBuilder --> FlowSettings
        FlowBuilder --> NodeProps
    end
    
    subgraph "Issue Panel"
        App2[App.js]
        FlowTabs[FlowTabs.js]
        Questionnaire[QuestionnaireView.js]
        Diagram[FlowDiagramView.js]
        Debugger[DebuggerView.js]
        
        App2 --> FlowTabs
        App2 --> Questionnaire
        App2 --> Diagram
        App2 --> Debugger
    end
    
    subgraph "Backend"
        Resolver[Resolver]
        Storage[Storage API]
        JiraAPI[Jira API]
        
        Resolver --> Storage
        Resolver --> JiraAPI
    end
    
    FlowBuilder -->|invoke| Resolver
    Questionnaire -->|invoke| Resolver
    
    style App1 fill:#FFB6C1
    style App2 fill:#87CEEB
    style Resolver fill:#DDA0DD
```

---

## Data Flow Diagram

```mermaid
graph LR
    subgraph "Admin Creates Flow"
        A1[Admin] -->|Create| A2[Flow Builder]
        A2 -->|Configure| A3[Nodes & Edges]
        A3 -->|Save| A4[Resolver]
        A4 -->|Store| A5[(Storage)]
    end
    
    subgraph "User Executes Flow"
        U1[User] -->|Open Issue| U2[Issue Panel]
        U2 -->|Load| U3[Resolver]
        U3 -->|Retrieve| U4[(Storage)]
        U4 -->|Display| U5[Questionnaire]
        U5 -->|Submit| U6[Resolver]
        U6 -->|Evaluate| U7[Logic]
        U7 -->|Execute| U8[Action]
        U8 -->|Update| U9[Jira Issue]
        U8 -->|Log| U10[(Audit)]
    end
    
    A5 -.->|Flow Data| U4
    
    style A1 fill:#FFB6C1
    style U1 fill:#87CEEB
    style A5 fill:#F0E68C
    style U4 fill:#F0E68C
    style U9 fill:#98FB98
    style U10 fill:#F0E68C
```

---

## Testing Phases Timeline

```mermaid
gantt
    title Testing Timeline
    dateFormat  HH:mm
    axisFormat %H:%M
    
    section Setup
    Run Validation Script    :done, setup1, 00:00, 2m
    Deploy Application       :done, setup2, 00:02, 5m
    Install on Jira         :done, setup3, 00:07, 3m
    
    section Smoke Test
    Access Admin Page       :active, smoke1, 00:10, 1m
    Create Simple Flow      :smoke2, 00:11, 2m
    Test in Issue Panel     :smoke3, 00:13, 2m
    
    section Comprehensive
    Flow Creation Tests     :comp1, 00:15, 15m
    Questionnaire Tests     :comp2, 00:30, 15m
    Visualization Tests     :comp3, 00:45, 10m
    Advanced Tests          :comp4, 00:55, 20m
    
    section Scenarios
    Test Scenarios          :scen1, 01:15, 30m
    
    section Review
    Document Results        :review1, 01:45, 15m
    Sign-Off               :review2, 02:00, 5m
```

---

## Test Priority Matrix

```mermaid
quadrantChart
    title Test Priority Matrix
    x-axis Low Impact --> High Impact
    y-axis Low Effort --> High Effort
    quadrant-1 Plan Carefully
    quadrant-2 Must Do First
    quadrant-3 Low Priority
    quadrant-4 Quick Wins
    
    Smoke Test: [0.9, 0.1]
    Flow Creation: [0.8, 0.3]
    Questionnaire: [0.9, 0.4]
    Actions Execute: [0.95, 0.5]
    Flow Diagram: [0.6, 0.3]
    Audit Logs: [0.5, 0.2]
    Reset Function: [0.7, 0.2]
    Multi-Project: [0.6, 0.4]
    Error Handling: [0.7, 0.5]
    Performance: [0.5, 0.6]
```

---

## Success Criteria Checklist

```mermaid
graph TD
    Start([Begin Testing]) --> Critical{Critical Tests}
    
    Critical -->|Pass| Important{Important Tests}
    Critical -->|Fail| Stop1[STOP - Fix Critical Issues]
    
    Important -->|Pass| NiceToHave{Nice-to-Have Tests}
    Important -->|Fail| Warning1[Warning - Document Issues]
    Warning1 --> NiceToHave
    
    NiceToHave -->|Pass| Perfect[Perfect! Ready for Production]
    NiceToHave -->|Fail| Warning2[Warning - Document Issues]
    Warning2 --> Good[Good! Ready for Production]
    
    Perfect --> Production([Deploy to Production])
    Good --> Production
    
    Stop1 --> Fix[Fix Issues]
    Fix --> Start
    
    style Start fill:#90EE90
    style Production fill:#90EE90
    style Perfect fill:#FFD700
    style Good fill:#87CEEB
    style Stop1 fill:#FF6B6B
    style Warning1 fill:#FFA500
    style Warning2 fill:#FFA500
```

---

## Issue Severity Flow

```mermaid
graph TD
    Issue([Issue Found]) --> Severity{Severity?}
    
    Severity -->|Critical| Critical[Critical Issue]
    Severity -->|High| High[High Priority]
    Severity -->|Medium| Medium[Medium Priority]
    Severity -->|Low| Low[Low Priority]
    
    Critical --> StopTest[Stop Testing]
    StopTest --> FixNow[Fix Immediately]
    FixNow --> Retest[Retest]
    
    High --> Document1[Document Issue]
    Document1 --> Continue1[Continue Testing]
    Continue1 --> FixSoon[Fix Before Production]
    
    Medium --> Document2[Document Issue]
    Document2 --> Continue2[Continue Testing]
    Continue2 --> FixLater[Fix in Next Release]
    
    Low --> Document3[Document Issue]
    Document3 --> Continue3[Continue Testing]
    Continue3 --> Backlog[Add to Backlog]
    
    Retest --> Verify{Fixed?}
    Verify -->|Yes| Resume[Resume Testing]
    Verify -->|No| FixNow
    
    style Critical fill:#FF6B6B
    style High fill:#FFA500
    style Medium fill:#FFD700
    style Low fill:#90EE90
```

---

## Documentation Navigation Map

```mermaid
graph TD
    Start([Start Here]) --> Summary[TESTING_SUMMARY.md]
    
    Summary --> FirstTime{First Time Testing?}
    FirstTime -->|Yes| Guide[E2E_VALIDATION_GUIDE.md]
    FirstTime -->|No| Formal{Formal Testing?}
    
    Guide --> Scenarios[QUICK_TEST_SCENARIOS.md]
    Scenarios --> Execute[Execute Tests]
    
    Formal -->|Yes| TestPlan[E2E_TEST_PLAN.md]
    Formal -->|No| Checklist[TEST_EXECUTION_CHECKLIST.md]
    
    TestPlan --> Checklist
    Checklist --> Execute
    
    Execute --> Results[Document Results]
    Results --> Issues{Issues Found?}
    
    Issues -->|Yes| Debug[Debug & Fix]
    Issues -->|No| SignOff[Sign-Off]
    
    Debug --> Execute
    SignOff --> Done([Complete])
    
    style Start fill:#90EE90
    style Done fill:#90EE90
    style Summary fill:#FFD700
    style Guide fill:#87CEEB
    style TestPlan fill:#FFB6C1
```

---

**Use these diagrams to understand the testing workflow and application architecture!**

