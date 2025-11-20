import React, { useState } from 'react';
import FlowList from './components/FlowList.jsx';
import FlowBuilder from './components/FlowBuilder.jsx';
import { Box } from '@atlaskit/primitives';

/**
 * Main App Component
 * 
 * Manages the overall application state and navigation between different views:
 * - 'list': Display all flows in a table (FlowList component)
 * - 'builder': Visual flow builder for creating/editing flows (FlowBuilder component)
 */
function App() {
    // Current view state: 'list' or 'builder'
    const [currentView, setCurrentView] = useState('list');
    
    // ID of the flow being edited (null for new flow creation)
    const [selectedFlowId, setSelectedFlowId] = useState(null);

    /**
     * Navigate to the flow builder to create a new flow
     */
    const handleCreateFlow = () => {
        setSelectedFlowId(null);
        setCurrentView('builder');
    };

    /**
     * Navigate to the flow builder to edit an existing flow
     * @param {string} flowId - The ID of the flow to edit
     */
    const handleEditFlow = (flowId) => {
        setSelectedFlowId(flowId);
        setCurrentView('builder');
    };

    /**
     * Navigate back to the flow list view
     */
    const handleBackToList = () => {
        setSelectedFlowId(null);
        setCurrentView('list');
    };

    /**
     * Render the appropriate view based on currentView state
     */
    return (
        <Box style={{ height: '100vh' }}>
            {currentView === 'list' && (
                <FlowList 
                    onCreateFlow={handleCreateFlow}
                    onEditFlow={handleEditFlow}
                />
            )}
            
            {currentView === 'builder' && (
                <FlowBuilder
                    flowId={selectedFlowId}
                    onCancel={handleBackToList}
                />
            )}
        </Box>
    );
}

export default App;
