import React from 'react';
import Footer from '../components/Footer';

const PrivacyPolicyPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex flex-col">
      <header className="sticky top-0 z-40 backdrop-blur-xl bg-slate-900/80 border-b border-slate-700/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 lg:h-20">
            <h1 className="text-xl lg:text-2xl font-bold text-white">Privacy Policy</h1>
          </div>
        </div>
      </header>

      <main className="flex-1">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-6 border border-slate-700/50 space-y-6">
            <section>
              <h2 className="text-white text-xl font-semibold mb-2">Titolare del trattamento</h2>
              <p className="text-slate-300">SFY s.r.l. ("Titolare").</p>
            </section>

            <section>
              <h2 className="text-white text-xl font-semibold mb-2">Dati trattati</h2>
              <ul className="list-disc pl-6 text-slate-300 space-y-2">
                <li>Dati identificativi e di contatto (es. email, denominazione azienda).</li>
                <li>Dati di fatturazione forniti dall’utente (azienda/privato).</li>
                <li>Dati tecnici e di utilizzo del sito (log, IP, device).</li>
                <li>Dati relativi ai pagamenti (gestiti tramite provider esterni come Stripe).</li>
              </ul>
            </section>

            <section>
              <h2 className="text-white text-xl font-semibold mb-2">Finalità e base giuridica</h2>
              <ul className="list-disc pl-6 text-slate-300 space-y-2">
                <li>Erogazione del servizio e gestione account (contratto).</li>
                <li>Adempimenti amministrativi/contabili (obbligo legale).</li>
                <li>Sicurezza e prevenzione abusi (interesse legittimo).</li>
                <li>Comunicazioni operative (interesse legittimo/contratto).</li>
              </ul>
            </section>

            <section>
              <h2 className="text-white text-xl font-semibold mb-2">Conservazione</h2>
              <p className="text-slate-300">I dati sono conservati per il tempo necessario alle finalità indicate e/o secondo obblighi di legge.</p>
            </section>

            <section>
              <h2 className="text-white text-xl font-semibold mb-2">Destinatari</h2>
              <p className="text-slate-300">Fornitori che agiscono quali responsabili del trattamento (es. hosting, Firebase, Stripe, Resend). I dati potrebbero essere trasferiti extra-UE secondo garanzie adeguate.</p>
            </section>

            <section>
              <h2 className="text-white text-xl font-semibold mb-2">Diritti dell’interessato</h2>
              <p className="text-slate-300">Accesso, rettifica, cancellazione, limitazione, portabilità, opposizione. Per esercitare i diritti, contatta il Titolare.</p>
            </section>

            <section>
              <h2 className="text-white text-xl font-semibold mb-2">Sicurezza</h2>
              <p className="text-slate-300">Sono adottate misure tecniche e organizzative per proteggere i dati da accessi non autorizzati o trattamenti illeciti.</p>
            </section>

            <section>
              <h2 className="text-white text-xl font-semibold mb-2">Aggiornamenti</h2>
              <p className="text-slate-300">La presente informativa può essere aggiornata. Le modifiche saranno pubblicate su questa pagina.</p>
            </section>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default PrivacyPolicyPage;

