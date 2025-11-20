/**
 * Custom Node Components Index
 * 
 * Exports all custom node components for use in ReactFlow.
 * These components define the visual appearance and behavior of
 * different node types in the decision flow builder.
 * 
 * Node Types:
 * - StartNode: Entry point of the flow (green circle with rocket icon)
 * - QuestionNode: User input node (blue rectangle with question preview)
 * - LogicNode: Conditional branching node (purple diamond with condition)
 * - ActionNode: Jira action node (orange rectangle with action details)
 * 
 * Usage:
 * Import these components and register them with ReactFlow using the nodeTypes prop:
 * 
 * import { StartNode, QuestionNode, LogicNode, ActionNode } from './components/nodes';
 * 
 * const nodeTypes = {
 *   start: StartNode,
 *   question: QuestionNode,
 *   logic: LogicNode,
 *   action: ActionNode
 * };
 * 
 * <ReactFlow nodeTypes={nodeTypes} ... />
 */

export { default as StartNode } from './StartNode.jsx';
export { default as QuestionNode } from './QuestionNode.jsx';
export { default as LogicNode } from './LogicNode.jsx';
export { default as ActionNode } from './ActionNode.jsx';
