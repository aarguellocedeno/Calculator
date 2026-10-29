import React from 'react';
import ReactDOM from 'react-dom/client';
import Calculator from './components/Calculator';
import './styles.css';

// mount the app in the #root div from index.html
ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <Calculator />
  </React.StrictMode>
);
