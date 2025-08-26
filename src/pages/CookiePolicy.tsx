import React from 'react';

export default function CookiePolicy() {
  return (
    <div className="container mx-auto px-6 py-12">
      <h1 className="text-3xl md:text-4xl font-bold mb-6">Cookie Policy</h1>
      <div className="prose prose-invert max-w-none">
        <p>
          La presente Cookie Policy spiega come EasyChain (SFY srl) utilizza cookie e tecnologie simili sul proprio sito e applicazione.
        </p>

        <h2>1. Cosa sono i cookie</h2>
        <p>
          I cookie sono piccoli file di testo che i siti inviano al dispositivo dell’utente, dove vengono memorizzati per essere ritrasmessi agli stessi siti alla visita successiva. Possono essere tecnici, analitici o di profilazione.
        </p>

        <h2>2. Tipologie di cookie utilizzati</h2>
        <ul>
          <li><strong>Cookie tecnici</strong>: necessari al funzionamento della piattaforma (autenticazione, sicurezza, preferenze, bilanciamento del carico, prevenzione abusi).</li>
          <li><strong>Cookie analitici</strong>: utilizzati per misurare l’uso della piattaforma in forma aggregata; ove non anonimizzati possono richiedere consenso.</li>
          <li><strong>Cookie di terze parti</strong>: alcuni servizi integrati (es. YouTube per l’embed del video) possono installare cookie. Si rimanda alle rispettive informative dei fornitori.</li>
        </ul>

        <h2>3. Gestione del consenso</h2>
        <p>
          Al primo accesso può essere richiesto il consenso per cookie non strettamente necessari. L’utente può modificare le preferenze in qualsiasi momento tramite le impostazioni del browser o l’eventuale banner/centro preferenze, se presente.
        </p>

        <h2>4. Come disabilitare i cookie</h2>
        <p>
          È possibile configurare il browser per rifiutare o cancellare i cookie. La disattivazione dei cookie tecnici può compromettere il funzionamento del servizio.
        </p>

        <h2>5. Servizi di terze parti</h2>
        <p>
          L’embed di YouTube usato nella homepage può comportare l’installazione di cookie di Google/YouTube. Per maggiori dettagli, consultare le relative privacy e cookie policy dei fornitori.
        </p>

        <h2>6. Aggiornamenti</h2>
        <p>
          Potremmo aggiornare questa Cookie Policy per ragioni tecniche, legali o di servizio. Le modifiche saranno pubblicate su questa pagina.
        </p>

        <h2>7. Contatti</h2>
        <p>
          Per informazioni: sfy.startup@gmail.com.
        </p>

        <p className="mt-8 text-sm text-muted-foreground">
          Ultimo aggiornamento: {new Date().toLocaleDateString('it-IT')}
        </p>
      </div>
    </div>
  );
}