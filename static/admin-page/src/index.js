import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';

import '@atlaskit/css-reset';
import { setGlobalTheme } from '@atlaskit/tokens';

// Set AtlasKit theme
setGlobalTheme({ colorMode: 'auto' });

const root = createRoot(document.getElementById('root'));
root.render(
    <React.StrictMode>
        <App />
    </React.StrictMode>
);
