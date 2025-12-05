# Decision Flow Builder

A Forge app that allows Jira admins to create conditional decision flows that automatically trigger Jira actions based on user responses to questionnaires in the issue panel.

## Overview

This app provides two main interfaces:

1. **Admin Page**: Visual flow builder where admins create decision trees with questions, logic branches, and automated actions
2. **Issue Panel**: User-facing questionnaire interface that guides users through flows and executes Jira actions based on their responses

### Kiroween Hackathon Demo

**PS: Only for the Hackathon Judge for evaluation.**

- Login to Atlassian using this [instance](https://decisionflowdemo.atlassian.net/jira/for-you)
  - Email: decisionflowdemo@monthmail.com
  - Password: xsUU90wpX4We6DcS
  - PS: You may need the email's MFA to login. For that, go to [MonthMail](https://monthmail.com), and edit the email to match the email below:
- Quick link to access to the product:
  - [Admin Page](https://decisionflowdemo.atlassian.net/jira/settings/apps/7342c3eb-9504-43fc-bdbf-d7bf32e7dce7/a8577110-235f-42ba-8d3b-1eccdaf8ab09) for setup and configuration.
  - [Issue Page - DEMO-1](https://decisionflowdemo.atlassian.net/browse/DEMO-1) to explore the questionnaire feature.

## Features

- **Visual Flow Builder**: Drag-and-drop interface using React Flow for creating decision trees
- **Multiple Node Types**:
  - Start nodes (entry points)
  - Question nodes (single/multiple choice, date, number inputs)
  - Logic nodes (conditional branching based on Jira field values)
  - Action nodes (set field, add label, add comment)
- **Project Binding**: Bind flows to multiple Jira projects
- **Interactive Questionnaires**: Users answer questions that traverse the decision tree
- **Automated Actions**: Execute Jira operations when flows complete
- **Audit Trail**: Complete logging of all actions and decisions
- **Flow Visualization**: Read-only diagram view showing the current execution path

## Architecture

- **Backend** (`src/`): Node.js resolvers for flow management, execution, and storage
- **Admin Page** (`static/admin-page/`): React app with React Flow and Atlaskit components
- **Issue Panel** (`static/issue-panel/`): React app for user questionnaires and flow execution

## Requirements

- Node.js 22.x
- Forge CLI installed and configured
- See [Set up Forge](https://developer.atlassian.com/platform/forge/set-up-forge/) for setup instructions

## Quick Start

### 1. Install Dependencies

Install root dependencies:
```bash
npm install
```

Install admin page dependencies:
```bash
cd static/admin-page
npm install
cd ../..
```

Install issue panel dependencies:
```bash
cd static/issue-panel
npm install
cd ../..
```

### 2. Build Frontend Apps

Build the admin page:
```bash
cd static/admin-page
npm run build
cd ../..
```

Build the issue panel:
```bash
cd static/issue-panel
npm run build
cd ../..
```

### 3. Deploy and Install

Deploy the app:
```bash
forge deploy --non-interactive --environment development
```

Install to your Jira site:
```bash
forge install --non-interactive --site <your-site-url> --product jira --environment development
```

### 4. Access the App

- **Admin Page**: Navigate to Jira Settings → Apps → Decision Flow
- **Issue Panel**: Open any Jira issue and look for the "Decision Flow" activity panel

## Development

### Using Forge Tunnel

For faster development with hot reloading:

```bash
forge tunnel
```

This allows you to make changes to the frontend code without redeploying. You'll still need to redeploy if you change `manifest.yml` or backend code.

### Project Structure

```
├── src/
│   └── index.js              # Backend resolvers
├── static/
│   ├── admin-page/           # Admin flow builder UI
│   │   ├── src/
│   │   │   ├── App.js
│   │   │   └── components/
│   │   └── package.json
│   └── issue-panel/          # User questionnaire UI
│       ├── src/
│       │   ├── App.js
│       │   └── components/
│       └── package.json
├── docs/                     # Detailed specifications
├── manifest.yml              # Forge app configuration
└── package.json              # Root dependencies
```

### Key Technologies

- **Forge Platform**: Atlassian's cloud app framework
- **React 18**: Frontend framework
- **React Flow (@xyflow/react)**: Visual flow builder
- **Atlaskit**: Atlassian's design system components
- **Forge Storage**: Key-value storage for flows and execution state

## Documentation

- `docs/DECISION_FLOW_SPEC.md`: Complete technical specification
- `docs/IMPLEMENTATION_TASKS.md`: Development task breakdown
- [Forge Documentation](https://developer.atlassian.com/platform/forge/)
- [React Flow Documentation](https://reactflow.dev/)
- [Atlaskit Components](https://atlaskit.atlassian.com/)

## Permissions

The app requires the following scopes:
- `read:jira-work`: Read Jira issues and fields
- `write:jira-work`: Update issues, add labels, add comments
- `read:jira-user`: Access user information
- `storage:app`: Store flow definitions and execution state

## Support

See [Get help](https://developer.atlassian.com/platform/forge/get-help/) for how to get help and provide feedback.

