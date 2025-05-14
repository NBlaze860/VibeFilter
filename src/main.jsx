import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import React from 'react';
import './index.css'
import Popup from './popup/Popup.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Popup />
  </StrictMode>,
)
