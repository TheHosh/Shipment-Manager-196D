// src/index.js

import 'bootstrap/dist/css/bootstrap.min.css'; // Import Bootstrap CSS for styling
import './index.css';
import React from 'react';
import ReactDOM from 'react-dom';
import App from './App'; // Import the main App component

// Render the App component into the root DOM element
ReactDOM.render(
  <App />, // The main application component
  document.getElementById('root') // The root element in index.html
);
