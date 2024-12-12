import './index.css';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import React from 'react';
import { BrowserRouter } from 'react-router-dom';

createRoot(document.getElementById('root')!).render(
  <BrowserRouter>
    <App />
  </BrowserRouter>,
);
