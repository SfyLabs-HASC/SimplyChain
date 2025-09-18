// FILE: src/App.tsx (versione corretta)

import React from 'react';
import { Routes, Route } from 'react-router-dom';

// 1. Importiamo TUTTE le pagine necessarie per la navigazione
import HomePage from './pages/HomePage';
import AdminPage from './pages/AdminPage';
import AziendaPage from "./pages/AziendaPage";
import FormPage from "./pages/FormPage";
import GestisciPage from "./pages/GestisciPage";
import RicaricaCreditiPage from "./pages/RicaricaCreditiPage";
import CookiePolicyPage from './pages/CookiePolicyPage';
import PrivacyPolicyPage from './pages/PrivacyPolicyPage';
import TermsPage from './pages/TermsPage';
import './App.css';

function App() {
  return (
    // Questo componente <Routes> decide quale pagina mostrare in base all'URL
    <Routes>
      {/* Rotta principale: ora punta correttamente a HomePage */}
      <Route path="/" element={<HomePage />} />

      {/* Rotte specifiche per le altre sezioni */}
      <Route path="/sys-mgmt-panel" element={<AdminPage />} />
      <Route path="/azienda" element={<AziendaPage />} />
      <Route path="/form" element={<FormPage />} />

      {/* Rotta dinamica per la gestione di una singola iscrizione (questa era già giusta) */}
      <Route path="/gestisci/:batchId" element={<GestisciPage />} />
      <Route path="/ricaricacrediti" element={<RicaricaCreditiPage />} />
      {/* Legal pages and aliases */}
      <Route path="/cookie-policy" element={<CookiePolicyPage />} />
      <Route path="/cookies" element={<CookiePolicyPage />} />
      <Route path="/privacy-policy" element={<PrivacyPolicyPage />} />
      <Route path="/privacy" element={<PrivacyPolicyPage />} />
      <Route path="/termini-e-condizioni" element={<TermsPage />} />
      <Route path="/terms-conditions" element={<TermsPage />} />
      <Route path="/terms" element={<TermsPage />} />
      </Routes>
  );
}

export default App;