// FILE: src/App.tsx (versione corretta)

import React from 'react';
import { Routes, Route } from 'react-router-dom';

// 1. Importiamo TUTTE le pagine necessarie per la navigazione
import HomePage from './pages/HomePage';
import AdminPage from './pages/AdminPage';
import AziendaPage from "./pages/AziendaPage";
import GestisciPage from "./pages/GestisciPage";
import QRCodePage from "./pages/QRCodePage";
import RicaricaCreditiPage from "./pages/RicaricaCreditiPage";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import TermsOfService from "./pages/TermsOfService";
import CookiePolicy from "./pages/CookiePolicy";
import './App.css';

function App() {
  return (
    // Questo componente <Routes> decide quale pagina mostrare in base all'URL
    <Routes>
      {/* Rotta principale: ora punta correttamente a HomePage */}
      <Route path="/" element={<HomePage />} />

      {/* Rotte specifiche per le altre sezioni */}
      <Route path="/admin" element={<AdminPage />} />
      <Route path="/azienda" element={<AziendaPage />} />

      {/* Rotta dinamica per la gestione di una singola iscrizione (questa era già giusta) */}
      <Route path="/gestisci/:batchId" element={<GestisciPage />} />
      <Route path="/qrcode" element={<QRCodePage />} />
      <Route path="/ricaricacrediti" element={<RicaricaCreditiPage />} />
      <Route path="/privacy" element={<PrivacyPolicy />} />
      <Route path="/terms" element={<TermsOfService />} />
      <Route path="/cookies" element={<CookiePolicy />} />
      </Routes>
  );
}

export default App;