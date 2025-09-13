# 🔐 Configurazione Regole Firebase Realtime Database

## Problema Attuale
L'errore `PERMISSION_DENIED: Permission denied` indica che le regole di sicurezza del Firebase Realtime Database non permettono la scrittura dei certificati.

## Soluzione

### 1. Vai su Firebase Console

1. Apri [Firebase Console](https://console.firebase.google.com/)
2. Seleziona il progetto `easychain-db`
3. Vai su "Realtime Database" nel menu laterale
4. Clicca su "Rules" (nella parte superiore)

### 2. Sostituisci le Regole Attuali

Sostituisci le regole attuali con queste:

```json
{
  "rules": {
    "certificates": {
      ".read": true,
      ".write": true,
      ".validate": "newData.hasChildren(['batchId', 'name', 'companyName', 'createdAt'])"
    }
  }
}
```

### 3. Spiegazione delle Regole

- **`.read": true`**: Permette la lettura pubblica dei certificati (necessario per visualizzarli)
- **`.write": true`**: Permette la scrittura pubblica dei certificati (necessario per salvarli)
- **`.validate"**: Verifica che i dati abbiano i campi obbligatori

### 4. Pubblica le Regole

1. Clicca su "Publish" per applicare le nuove regole
2. Conferma la modifica

### 5. Test

Dopo aver pubblicato le regole, prova di nuovo a finalizzare un batch. Dovresti vedere:
- ✅ Nessun errore `PERMISSION_DENIED`
- ✅ QR code generato automaticamente
- ✅ Certificato salvato nel database

## Regole Alternative (Più Sicure)

Se vuoi regole più sicure, puoi usare queste:

```json
{
  "rules": {
    "certificates": {
      ".read": true,
      ".write": "auth != null",
      ".validate": "newData.hasChildren(['batchId', 'name', 'companyName', 'createdAt'])"
    }
  }
}
```

**Nota**: Queste regole richiedono autenticazione, quindi dovresti implementare l'autenticazione Firebase nell'app.

## Regole per Sviluppo (Temporanee)

Per test rapidi, puoi usare regole completamente aperte:

```json
{
  "rules": {
    ".read": true,
    ".write": true
  }
}
```

**⚠️ ATTENZIONE**: Queste regole sono pericolose in produzione! Usale solo per test.

## Verifica

Dopo aver configurato le regole, puoi testare:

1. Apri `https://your-app.vercel.app/test-firebase-config.html`
2. Clicca su "Test Scrittura Database"
3. Dovresti vedere un messaggio di successo

## Struttura Database Attesa

Con le regole configurate, il database avrà questa struttura:

```
certificates/
  ├── 65_1757756019555/
  │   ├── batchId: 65
  │   ├── name: "Nome Prodotto"
  │   ├── companyName: "Nome Azienda"
  │   ├── walletAddress: "0x..."
  │   ├── date: "2024-01-15"
  │   ├── location: "Milano"
  │   ├── description: "Descrizione"
  │   ├── transactionHash: "0x..."
  │   ├── imageIpfsHash: "Qm..."
  │   ├── steps: [...]
  │   ├── createdAt: "2024-01-15T10:00:00.000Z"
  │   ├── isActive: true
  │   └── viewCount: 0
```

## Troubleshooting

### Errore: "Rules are not valid JSON"
- Controlla che il JSON sia valido
- Usa un validator JSON online

### Errore: "Permission denied" ancora presente
- Assicurati di aver pubblicato le regole
- Controlla che il percorso sia corretto (`/certificates/`)
- Prova a ricaricare la pagina

### Errore: "Validation failed"
- Verifica che i dati abbiano i campi obbligatori
- Controlla il formato dei dati inviati