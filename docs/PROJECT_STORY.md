# Decision Flow Builder - Project Story

## Inspiration

Every Jira admin knows the pain: users constantly asking "What should I do with this issue?" or "Which field should I update?" The answer often depends on a complex web of conditions—project type, issue status, custom field values, and business rules that live only in someone's head or buried in a wiki page.

We've all seen the workarounds: massive wiki pages with decision trees, Slack channels filled with "quick questions," and automation rules that become unmaintainable spaghetti. What if we could turn those implicit decision trees into explicit, visual workflows that guide users through the right questions and automatically execute the right actions?

That's where Decision Flow Builder was born—from the simple idea that **conditional logic shouldn't require code, and guidance shouldn't require hunting through documentation**.

---

## What It Does

Decision Flow Builder transforms Jira into an intelligent assistant that guides users through complex decisions and automates the resulting actions.

### For Admins
Admins use a **visual flow builder** (powered by React Flow) to create decision trees without writing a single line of code. They drag and drop nodes to build flows:

- **Question Nodes**: Ask users single-choice, multiple-choice, date, or numeric questions
- **Logic Nodes**: Branch based on Jira field values (status, priority, custom fields)
- **Action Nodes**: Automatically set fields, add labels, or post comments

Each flow can be bound to multiple projects, making it reusable across teams.

### For Users
When users open a Jira issue, they see an **interactive questionnaire** in the issue panel. The app guides them through relevant questions, automatically evaluates conditions based on the issue's data, and executes Jira actions when they reach the end of the flow.

Users also get:
- **Flow Diagram View**: A visual map showing where they are in the decision tree
- **Debugger View**: An audit trail of every action taken and why

### Real-World Example
Imagine a support team that needs to triage incoming tickets:
1. Question: "Is this a bug or feature request?"
2. Logic: Check if priority is "Critical"
3. If critical bug → Action: Add "urgent" label, set assignee, post comment to on-call engineer
4. If feature request → Action: Move to backlog, add "enhancement" label

All of this happens automatically as the user answers one simple question.

---

## How We Built It

### Technology Stack
- **Platform**: Atlassian Forge (cloud-native app framework)
- **Backend**: Node.js with Forge resolvers for flow management and execution
- **Frontend**: React 16 with two separate apps:
  - **Admin Page**: Visual flow builder using React Flow (@xyflow/react v12)
  - **Issue Panel**: User-facing questionnaire interface
- **UI Components**: Atlassian's Atlaskit design system for consistent UX
- **Storage**: Forge Storage API (key-value store) for flows and execution state
- **APIs**: Jira REST API for reading/writing issue data

### Architecture Decisions

**Why Two Separate React Apps?**
We separated the admin builder from the user questionnaire to optimize bundle size and loading performance. Admins need the full React Flow library and complex editing tools, while users just need a lightweight questionnaire interface.

**Why React Flow?**
After evaluating several visual flow libraries, React Flow stood out for its:
- Excellent TypeScript support and documentation
- Customizable node components (perfect for our node types)
- Built-in features like minimap, controls, and edge routing
- Active community and regular updates

**Why Forge Storage Over Custom Entities?**
For this use case, simple key-value storage was sufficient. We used a clear key pattern:
- `decision-flows`: Array of flow IDs
- `flow:{flowId}`: Individual flow data
- `exec:{issueKey}:{flowId}`: Execution state per issue
- `audit:{issueKey}:{flowId}`: Audit logs

This kept the architecture simple and performant.

### Development Process

We followed a phased approach:

**Phase 1: Backend Foundation** (Week 1)
- Implemented 15+ resolver functions for flow CRUD, execution, and actions
- Built helper functions for flow traversal and logic evaluation
- Integrated Jira REST API with proper `.asUser()` authorization

**Phase 2: Admin Page** (Week 2-3)
- Set up React Flow canvas with custom node components
- Built node properties panel with conditional forms
- Implemented flow settings modal and project binding
- Created flow list view with CRUD operations

**Phase 3: Issue Panel** (Week 3-4)
- Built tabbed interface with completion status indicators
- Implemented questionnaire view with dynamic input rendering
- Created read-only flow diagram with path highlighting
- Added debugger view with audit log table

**Phase 4: Testing & Polish** (Week 4-5)
- Comprehensive end-to-end testing with 50+ test cases
- Error handling and loading states
- Accessibility improvements
- Performance optimization for large flows

---

## Challenges We Ran Into

### 1. **React Flow Learning Curve**
React Flow v12 introduced breaking changes from v11, and many online examples were outdated. We had to dive deep into the official docs and experiment with custom node implementations.

**Solution**: We created reusable node templates with Atlaskit styling and documented patterns for future reference.

### 2. **Flow Traversal Logic**
Determining the "next node" in a decision tree is trickier than it sounds. Question nodes can have multiple outgoing edges (one per answer option), logic nodes have true/false branches, and we needed to handle cycles and dead ends gracefully.

**Solution**: We implemented a robust `findNextNode()` function that:
- Matches answer values to edge labels for question nodes
- Evaluates true/false conditions for logic nodes
- Returns null when reaching action nodes (end of flow)
- Handles edge cases like missing edges or invalid connections

### 3. **Forge Storage Limitations**
Forge Storage is eventually consistent, which caused race conditions when rapidly updating execution state during flow progression.

**Solution**: We implemented optimistic updates on the frontend and added retry logic with exponential backoff for storage operations.

### 4. **Dynamic Form Rendering**
The node properties panel needed to show completely different forms based on node type—question nodes need question text and options, logic nodes need field keys and operators, action nodes need action-specific fields.

**Solution**: We used a switch statement with conditional rendering and Atlaskit's Form component for validation. Each node type got its own form section component.

### 5. **Multi-Handle Nodes**
Question nodes with multiple choice options needed a separate handle (connection point) for each option. React Flow's handle system required careful positioning and labeling.

**Solution**: We dynamically generated handles based on the options array and used CSS to position them evenly along the node's bottom edge.

### 6. **Jira Field Value Comparison**
Logic nodes need to compare Jira field values, but fields come in many types—strings, numbers, arrays (for multi-select), objects (for users), and more.

**Solution**: We built a flexible comparison engine that:
- Normalizes field values based on type
- Supports 7 operators (equals, notEquals, contains, greaterThan, lessThan, isEmpty, isNotEmpty)
- Handles edge cases like null values and type mismatches

### 7. **Testing in Forge Environment**
Testing Forge apps requires deploying to Atlassian's cloud, which slows down the feedback loop compared to local development.

**Solution**: We used `forge tunnel` for hot-reloading during development and created a comprehensive validation script (`validate-deployment.js`) to catch issues before deployment.

---

## Accomplishments That We're Proud Of

### 1. **Zero-Code Flow Creation**
Non-technical Jira admins can create sophisticated conditional workflows without writing a single line of code or learning automation syntax. The visual builder makes complex logic accessible.

### 2. **Comprehensive Testing Suite**
We created 5 testing documents covering 50+ test cases, automated validation scripts, and quick-start guides. The app shipped with production-ready quality.

### 3. **Elegant Flow Traversal**
The algorithm that walks through decision trees, evaluates conditions, and executes actions is clean, maintainable, and handles edge cases gracefully. It's the heart of the app.

### 4. **Beautiful Custom Nodes**
Our React Flow nodes use Atlaskit design tokens, support light/dark mode automatically, and provide clear visual feedback. They look like native Jira components.

### 5. **Real-Time Audit Trail**
Every action is logged with full context—what was executed, when, why, and what the user's answers were. This transparency builds trust and enables debugging.

### 6. **Multi-Project Flexibility**
Flows can be bound to multiple projects, making them reusable across teams while still maintaining project-specific isolation in the issue panel.

### 7. **Performance at Scale**
The app handles flows with 50+ nodes smoothly, thanks to React Flow's virtualization and our optimized storage patterns.

---

## What We Learned

### Technical Lessons

**1. Visual Programming is Hard**
Building a visual programming interface taught us that the UI is only 30% of the challenge. The real complexity is in:
- Validating flow structure (no orphaned nodes, cycles, etc.)
- Traversing graphs efficiently
- Providing helpful error messages
- Handling edge cases gracefully

**2. Forge's Strengths and Limitations**
Forge is excellent for building secure, scalable Jira apps, but it has constraints:
- No direct DOM access (security sandbox)
- Storage is eventually consistent
- Limited to approved npm packages
- Deployment takes 2-3 minutes

Understanding these constraints early shaped our architecture decisions.

**3. Atlaskit is Powerful but Opinionated**
Atlaskit provides beautiful, accessible components, but you need to work within its design system. Fighting against it leads to inconsistent UX.

**4. Testing Forge Apps Requires Discipline**
Without local testing, we relied heavily on:
- Comprehensive validation scripts
- Detailed test plans
- Forge tunnel for rapid iteration
- Structured deployment checklists

### Product Lessons

**1. Users Want Guidance, Not Automation**
Early feedback showed users appreciated the questionnaire guiding them through decisions more than the automated actions. The value is in **reducing cognitive load**, not just saving clicks.

**2. Visual Feedback is Critical**
The flow diagram view was initially an afterthought, but testers loved seeing where they were in the decision tree. Visual context matters.

**3. Audit Trails Build Trust**
Users were initially skeptical of automated actions ("What did it change?"). The debugger view with full audit logs eliminated that concern.

**4. Start Simple, Add Complexity**
We initially planned 10+ node types. Shipping with 4 (Start, Question, Logic, Action) was the right call. Users can build sophisticated flows with just these basics.

---

## What's Next for Decision Flow

### Short-Term Enhancements (Next 3 Months)

**1. Advanced Question Types**
- Text input (free-form answers)
- User picker (assign to specific people)
- Multi-select with "other" option
- Conditional question visibility

**2. Enhanced Logic Nodes**
- Compare two Jira fields (not just field vs. static value)
- Date comparisons (due date is within X days)
- User-based conditions (reporter is in group X)
- JQL-based conditions (issue matches JQL query)

**3. More Action Types**
- Transition issue to new status
- Create linked issue
- Send notification to user/group
- Update multiple fields at once

**4. Flow Templates**
- Pre-built flows for common scenarios:
  - Bug triage workflow
  - Feature request intake
  - Incident response checklist
  - Approval routing
- One-click import and customize

**5. Flow Analytics**
- Dashboard showing flow completion rates
- Most common answer paths
- Average completion time
- Drop-off points (where users abandon flows)

### Medium-Term Features (6-12 Months)

**1. Conditional Branching Enhancements**
- AND/OR logic combinations
- Nested conditions
- Variable storage (remember answers for later use)
- Loop support (repeat questions until condition met)

**2. Integration with Other Tools**
- Trigger flows from Slack commands
- Send flow results to external systems (webhooks)
- Import/export flows as JSON
- Version control for flows (track changes over time)

**3. Collaboration Features**
- Flow comments and annotations
- Share flows between Jira instances
- Flow marketplace (community-contributed templates)
- Role-based permissions (who can edit vs. view flows)

**4. AI-Powered Suggestions**
- Suggest next questions based on flow context
- Recommend logic conditions based on issue history
- Auto-generate flows from natural language descriptions
- Predict user answers based on similar issues

**5. Advanced Visualization**
- Heatmap showing most-traveled paths
- A/B testing different flow variations
- Real-time flow execution monitoring
- Export flow diagrams as images/PDFs

### Long-Term Vision (12+ Months)

**1. Multi-Product Support**
- Extend to Confluence (content creation workflows)
- Extend to Bitbucket (code review checklists)
- Cross-product flows (create Jira issue from Confluence page)

**2. Enterprise Features**
- Flow governance and approval workflows
- Compliance audit reports
- SLA tracking for flow completion
- Integration with Jira Service Management SLAs

**3. Mobile Optimization**
- Native mobile app for flow execution
- Offline mode (complete flows without internet)
- Push notifications for flow assignments

**4. Advanced Automation**
- Schedule flows to run automatically (daily triage)
- Trigger flows from Jira automation rules
- Bulk execute flows across multiple issues
- Flow orchestration (chain multiple flows together)

---

## Community and Adoption

We envision Decision Flow Builder becoming a standard tool in every Jira admin's toolkit, similar to how automation rules are ubiquitous today. Our roadmap prioritizes:

1. **Ease of Use**: Keep the visual builder intuitive for non-technical users
2. **Flexibility**: Support increasingly complex use cases without sacrificing simplicity
3. **Transparency**: Always show users what's happening and why
4. **Performance**: Scale to enterprise deployments with thousands of flows
5. **Community**: Build a marketplace of shared flows and best practices

---

## Conclusion

Decision Flow Builder started with a simple observation: **people need guidance, not just automation**. By combining visual flow building with intelligent questionnaires and automated actions, we've created a tool that makes Jira more helpful, more intuitive, and more powerful.

The journey from idea to production taught us that building developer tools requires empathy—understanding not just what users want to accomplish, but how they think about problems. Visual programming isn't about replacing code; it's about making logic accessible to everyone.

We're excited to see how teams use Decision Flow Builder to encode their institutional knowledge, streamline their processes, and help their users make better decisions faster.

**The future of Jira is conversational, visual, and intelligent. Decision Flow Builder is just the beginning.**

---

*Built with ❤️ using Atlassian Forge, React Flow, and Atlaskit*
