import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import NotesAppRouter from './NotesApp';
import './theme.css';

/**
 * PUBLIC_INTERFACE
 * App is the entry component that sets up routing for the Notes application.
 */
function App() {
  return (
    <BrowserRouter>
      <NotesAppRouter />
    </BrowserRouter>
  );
}

export default App;
