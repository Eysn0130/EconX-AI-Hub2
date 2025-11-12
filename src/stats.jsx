import React from 'react';
import ReactDOM from 'react-dom/client';
import { MemoryRouter } from 'react-router-dom';
import StatsPage from './pages/StatsPage.jsx';
import './styles/global.css';

const initialSearch = typeof window !== 'undefined' ? window.location.search : '';
const initialEntry = `/stats${initialSearch}`;

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <MemoryRouter initialEntries={[initialEntry]}>
      <StatsPage />
    </MemoryRouter>
  </React.StrictMode>
);
