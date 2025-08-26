import React from 'react';

export default function TermsOfService() {
  return (
    <div className="container mx-auto px-6 py-12">
      <h1 className="text-3xl md:text-4xl font-bold mb-6">Termini di Servizio</h1>
      <div className="prose prose-invert max-w-none">
        <p>
          I presenti Termini di Servizio disciplinano l’uso della piattaforma EasyChain fornita da SFY srl ("Fornitore"). Utilizzando EasyChain, l’utente accetta integralmente i presenti Termini.
        </p>

        <h2>1. Oggetto del servizio</h2>
        <p>
          EasyChain consente la tracciabilità e certificazione su blockchain (Polygon) di dati relativi a prodotti, passaggi di filiera e contratti. Le aziende registrano volontariamente i dati; EasyChain fornisce l’infrastruttura tecnica e gli strumenti di consultazione.
        </p>

        <h2>2. Account e responsabilità dell’utente</h2>
        <ul>
          <li>L’utente è responsabile dell’accuratezza dei dati inseriti e della custodia delle proprie credenziali;</li>
          <li>È vietato caricare contenuti illeciti, offensivi, o che violino diritti di terzi;</li>
          <li>L’utente assicura di avere i diritti necessari per pubblicare dati e documenti caricati.</li>
        </ul>

        <h2>3. Registrazioni on-chain</h2>
        <p>
          Le informazioni scritte su blockchain sono permanenti e non modificabili. L’utente è tenuto a verificare i dati prima della registrazione. EasyChain non potrà rimuovere/modificare dati già on-chain.
        </p>

        <h2>4. Corrispettivi e crediti</h2>
        <p>
          Alcune funzionalità possono richiedere l’utilizzo di crediti o il pagamento di corrispettivi. Dettagli e prezzi sono indicati all’interno della piattaforma. Eventuali promozioni (es. crediti gratuiti) possono avere durata e condizioni limitate.
        </p>

        <h2>5. Limitazioni di responsabilità</h2>
        <p>
          Nei limiti consentiti dalla legge, SFY srl non è responsabile per: (i) inesattezze o illiceità dei dati forniti dagli utenti; (ii) malfunzionamenti derivanti da terze parti (es. rete blockchain, provider esterni); (iii) interruzioni del servizio per manutenzione o eventi di forza maggiore; (iv) perdita di dati off-chain per cause non imputabili a colpa grave.
        </p>

        <h2>6. Proprietà intellettuale</h2>
        <p>
          Il software, il marchio EasyChain e i contenuti proprietari sono tutelati dalle leggi applicabili. È vietata la loro riproduzione, modifica o distribuzione non autorizzata. I contenuti caricati dagli utenti restano di proprietà dei rispettivi titolari.
        </p>

        <h2>7. Uso lecito e divieti</h2>
        <ul>
          <li>Divieto di reverse engineering non consentito dalle norme;</li>
          <li>Divieto di caricare dati personali eccedenti o sensibili senza base giuridica;</li>
          <li>Divieto di aggirare misure di sicurezza o sovraccaricare i sistemi.</li>
        </ul>

        <h2>8. Sospensione e cessazione</h2>
        <p>
          SFY srl può sospendere o chiudere gli account che violino i Termini o compromettano la sicurezza. L’utente può interrompere l’uso in qualsiasi momento; le registrazioni on-chain resteranno comunque consultabili.
        </p>

        <h2>9. Legge applicabile e foro</h2>
        <p>
          I presenti Termini sono regolati dalla legge italiana. Foro competente esclusivo, ove applicabile, è quello del luogo di residenza/sede del Fornitore, salvo diversa inderogabile disposizione di legge.
        </p>

        <h2>10. Modifiche</h2>
        <p>
          SFY srl può aggiornare questi Termini per motivi tecnici, legali o di servizio. Le modifiche saranno comunicate in piattaforma. L’uso continuato dopo la pubblicazione comporta accettazione delle modifiche.
        </p>

        <h2>11. Contatti</h2>
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