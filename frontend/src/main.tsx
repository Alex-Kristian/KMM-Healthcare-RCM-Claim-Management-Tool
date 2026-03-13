import React from 'react';
import ReactDOM from 'react-dom/client';
import { Amplify } from 'aws-amplify';
import { CognitoConfig } from './auth';
import App from './App';
import '@aws-amplify/ui-react/styles.css';

Amplify.configure(CognitoConfig);

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);