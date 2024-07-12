import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';
import reportWebVitals from './reportWebVitals';
import { CameraStateProvider } from './state/CameraStateContext';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <CameraStateProvider>
      <App />
    </CameraStateProvider>
  </React.StrictMode>
);

reportWebVitals();

