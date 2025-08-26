import React from 'react';

export default function PrivacyPolicy() {
  return (
    <div className="container mx-auto px-6 py-12">
      <h1 className="text-3xl md:text-4xl font-bold mb-6">Privacy Policy</h1>
      <div className="prose prose-invert max-w-none">
        <p>
          La presente informativa descrive le modalità di trattamento dei dati personali degli utenti che utilizzano la piattaforma EasyChain, di proprietà di SFY srl ("Titolare del trattamento"). EasyChain consente la registrazione su blockchain di dati relativi ai prodotti, ai passaggi di filiera e ai contratti, garantendo trasparenza, tracciabilità e immutabilità.
        </p>

        <h2>1. Titolare del trattamento</h2>
        <p>
          SFY srl — Email di contatto: sfy.startup@gmail.com.
        </p>

        <h2>2. Tipologie di dati trattati</h2>
        <ul>
          <li>Dati anagrafici e societari forniti dalle aziende durante la registrazione;</li>
          <li>Dati di contatto (email, telefono) per finalità di autenticazione e supporto;</li>
          <li>Dati relativi ai prodotti e ai passaggi di filiera immessi volontariamente dalle aziende;</li>
          <li>Dati tecnici/di utilizzo (indirizzo IP, log applicativi) per sicurezza e monitoraggio;</li>
          <li>Dati di fatturazione e transazione in caso di acquisto di crediti o servizi;</li>
          <li>Eventuali contenuti caricati (documenti, immagini) inerenti la filiera;</li>
          <li>Dati blockchain: hash e metadati registrati su rete Polygon; tali dati sono per loro natura immutabili.</li>
        </ul>

        <h2>3. Finalità e basi giuridiche</h2>
        <ul>
          <li>Erogazione del servizio EasyChain (esecuzione del contratto);</li>
          <li>Autenticazione, sicurezza e prevenzione abusi (interesse legittimo e obblighi di sicurezza);
          </li>
          <li>Adempimenti amministrativi, fiscali e contabili (obbligo legale);
          </li>
          <li>Comunicazioni di servizio e supporto (esecuzione del contratto);
          </li>
          <li>Informazioni commerciali su servizi correlati, previo consenso, ove richiesto (consenso).</li>
        </ul>

        <h2>4. Conservazione dei dati</h2>
        <p>
          I dati sono conservati per il tempo strettamente necessario alle finalità indicate e/o secondo i termini di legge applicabili. I dati scritti su blockchain sono immutabili e permanenti per natura: non possono essere modificati o cancellati; ove possibile, utilizziamo tecniche di minimizzazione (es. hash) per limitare i dati personali on-chain.
        </p>

        <h2>5. Destinatari</h2>
        <p>
          I dati possono essere trattati da fornitori e sub-responsabili che erogano servizi infrastrutturali (es. hosting, blockchain node provider, servizi di pagamento, email), vincolati da accordi conformi al GDPR. Non cediamo dati a terzi per finalità di marketing senza consenso.
        </p>

        <h2>6. Trasferimenti extra-UE</h2>
        <p>
          Alcuni fornitori potrebbero risiedere fuori dallo Spazio Economico Europeo. In tali casi, il trasferimento avviene sulla base di decisioni di adeguatezza, clausole contrattuali standard o altre garanzie adeguate previste dal GDPR.
        </p>

        <h2>7. Diritti degli interessati</h2>
        <p>
          Gli utenti possono esercitare i diritti di accesso, rettifica, limitazione, opposizione, portabilità e reclamo all’Autorità Garante. Il diritto alla cancellazione non è applicabile ai dati già registrati su blockchain per la loro natura immutabile; potremo tuttavia intervenire sugli archivi off-chain e interrompere ulteriori registrazioni.
        </p>

        <h2>8. Sicurezza</h2>
        <p>
          Adottiamo misure tecniche e organizzative adeguate (crittografia, controllo accessi, audit) per proteggere i dati da accessi non autorizzati, perdita o alterazione.
        </p>

        <h2>9. Cookie e tecnologie simili</h2>
        <p>
          Per informazioni sull’uso dei cookie, consultare la nostra <a href="/cookies">Cookie Policy</a>.
        </p>

        <h2>10. Contatti</h2>
        <p>
          Per domande o per esercitare i diritti: sfy.startup@gmail.com.
        </p>

        <p className="mt-8 text-sm text-muted-foreground">
          Ultimo aggiornamento: {new Date().toLocaleDateString('it-IT')}
        </p>
      </div>
    </div>
  );
}