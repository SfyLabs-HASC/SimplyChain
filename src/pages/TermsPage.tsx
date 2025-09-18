import React from 'react';
import Footer from '../components/Footer';

const TermsPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex flex-col">
      <header className="sticky top-0 z-40 backdrop-blur-xl bg-slate-900/80 border-b border-slate-700/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 lg:h-20">
            <div className="flex items-center space-x-4">
              <div className="w-10 h-10 bg-gradient-to-r from-purple-600 to-blue-600 rounded-xl flex items-center justify-center">
                <span className="text-white font-bold text-lg">S</span>
              </div>
              <div>
                <h1 className="text-xl lg:text-2xl font-bold text-white">SimplyChain</h1>
                <p className="text-sm text-slate-400 hidden sm:block">Policy</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="text-center mb-6">
            <h1 className="text-3xl font-bold text-white">Termini e Condizioni</h1>
          </div>
          <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-6 border border-slate-700/50 space-y-6">
            <section>
              <h2 className="text-white text-xl font-semibold mb-2">Titolare del servizio</h2>
              <p className="text-slate-300">SFY s.r.l. ("Fornitore").</p>
            </section>

            <section>
              <h2 className="text-white text-xl font-semibold mb-2">Oggetto</h2>
              <p className="text-slate-300">I presenti Termini regolano l’uso della piattaforma SimplyChain, inclusi processi di iscrizione on-chain, gestione crediti e servizi correlati.</p>
            </section>

            <section>
              <h2 className="text-white text-xl font-semibold mb-2">Account e responsabilità</h2>
              <ul className="list-disc pl-6 text-slate-300 space-y-2">
                <li>L’utente è responsabile delle credenziali e delle attività svolte dal proprio account/wallet.</li>
                <li>È vietato l’uso improprio o contrario alla legge.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-white text-xl font-semibold mb-2">Crediti e pagamenti</h2>
              <ul className="list-disc pl-6 text-slate-300 space-y-2">
                <li>I crediti acquistati consentono l’uso delle funzionalità previste; i prezzi sono indicati in fase d’acquisto.</li>
                <li>I pagamenti sono processati tramite provider esterni (es. Stripe). Eventuali rimborsi sono valutati caso per caso.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-white text-xl font-semibold mb-2">Disponibilità del servizio</h2>
              <p className="text-slate-300">Il Fornitore si impegna per la continuità del servizio, senza garanzia di assenza totale di interruzioni o errori.</p>
            </section>

            <section>
              <h2 className="text-white text-xl font-semibold mb-2">Limitazione di responsabilità</h2>
              <p className="text-slate-300">Nei limiti di legge, SFY s.r.l. non risponde per danni indiretti o conseguenti derivanti dall’uso della piattaforma.</p>
            </section>

            <section>
              <h2 className="text-white text-xl font-semibold mb-2">Proprietà intellettuale</h2>
              <p className="text-slate-300">Contenuti, marchi e software collegati al servizio restano di proprietà dei rispettivi titolari.</p>
            </section>

            <section>
              <h2 className="text-white text-xl font-semibold mb-2">Legge applicabile e foro</h2>
              <p className="text-slate-300">I Termini sono regolati dalla legge italiana. Foro competente: quello del Titolare, salvo norme inderogabili.</p>
            </section>

            <section>
              <h2 className="text-white text-xl font-semibold mb-2">Modifiche</h2>
              <p className="text-slate-300">I Termini possono essere aggiornati. Le modifiche saranno pubblicate su questa pagina.</p>
            </section>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default TermsPage;

