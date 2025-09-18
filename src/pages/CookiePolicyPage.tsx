import React from 'react';
import Footer from '../components/Footer';

const CookiePolicyPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex flex-col">
      <header className="sticky top-0 z-40 backdrop-blur-xl bg-slate-900/80 border-b border-slate-700/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 lg:h-20">
            <div className="flex items-center space-x-4">
              <div className="w-10 h-10 rounded-xl overflow-hidden flex items-center justify-center bg-transparent">
                <img src="/logo-simplychain.svg" alt="SimplyChain" className="w-10 h-10 object-cover" />
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
            <h1 className="text-3xl font-bold text-white">Cookie Policy</h1>
          </div>
          <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-6 border border-slate-700/50 space-y-6">
            <section>
              <h2 className="text-white text-xl font-semibold mb-2">Titolare del trattamento</h2>
              <p className="text-slate-300">SFY s.r.l. ("Titolare").</p>
            </section>

            <section>
              <h2 className="text-white text-xl font-semibold mb-2">Cosa sono i cookie</h2>
              <p className="text-slate-300">I cookie sono piccoli file di testo che i siti inviano al dispositivo dell’utente, dove vengono memorizzati per essere poi ritrasmessi agli stessi siti alla visita successiva.</p>
            </section>

            <section>
              <h2 className="text-white text-xl font-semibold mb-2">Tipologie di cookie utilizzati</h2>
              <ul className="list-disc pl-6 text-slate-300 space-y-2">
                <li><strong className="text-white">Tecnici</strong>: necessari al funzionamento del sito (autenticazione, sicurezza, preferenze).</li>
                <li><strong className="text-white">Analitici</strong>: in forma aggregata per analisi d’uso e performance.</li>
                <li><strong className="text-white">Di terze parti</strong>: servizi integrati (es. Stripe, provider autenticazione) che possono impostare propri cookie.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-white text-xl font-semibold mb-2">Gestione delle preferenze</h2>
              <p className="text-slate-300">Puoi gestire o eliminare i cookie tramite le impostazioni del browser. Disabilitare i cookie tecnici può compromettere alcune funzionalità del sito.</p>
            </section>

            <section>
              <h2 className="text-white text-xl font-semibold mb-2">Cookie di terze parti</h2>
              <p className="text-slate-300">Servizi come Stripe (pagamenti) e provider di login social possono impostare cookie per il proprio funzionamento. Consulta le rispettive informative per maggiori dettagli.</p>
            </section>

            <section>
              <h2 className="text-white text-xl font-semibold mb-2">Aggiornamenti</h2>
              <p className="text-slate-300">La presente policy può essere aggiornata. Le modifiche saranno pubblicate su questa pagina.</p>
            </section>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default CookiePolicyPage;

