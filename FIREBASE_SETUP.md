# 🔥 Configurazione Firebase per SimplyChain

## Problema Attuale
L'errore `FIREBASE FATAL ERROR: Can't determine Firebase Database URL` indica che la variabile d'ambiente `VITE_FIREBASE_DATABASE_URL` non è configurata su Vercel.

## Soluzione

### 1. Configurazione su Vercel

Aggiungi queste variabili d'ambiente nel dashboard di Vercel:

```bash
# Configurazione Firebase (già presenti)
VITE_FIREBASE_API_KEY=your-api-key
VITE_FIREBASE_AUTH_DOMAIN=your-project-id.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project-id.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
VITE_FIREBASE_APP_ID=your-app-id
VITE_FIREBASE_MEASUREMENT_ID=your-measurement-id

# ⚠️ MANCANTE - Aggiungi questa variabile:
VITE_FIREBASE_DATABASE_URL=https://your-project-id-default-rtdb.firebaseio.com/
```

### 2. Come trovare l'URL del Realtime Database

1. Vai su [Firebase Console](https://console.firebase.google.com/)
2. Seleziona il tuo progetto
3. Vai su "Realtime Database" nel menu laterale
4. Copia l'URL che appare (formato: `https://your-project-id-default-rtdb.firebaseio.com/`)

### 3. Configurazione su Vercel

1. Vai su [Vercel Dashboard](https://vercel.com/dashboard)
2. Seleziona il progetto SimplyChain
3. Vai su "Settings" → "Environment Variables"
4. Aggiungi la variabile:
   - **Name**: `VITE_FIREBASE_DATABASE_URL`
   - **Value**: `https://your-project-id-default-rtdb.firebaseio.com/`
   - **Environment**: Production, Preview, Development (tutte)

### 4. Redeploy

Dopo aver aggiunto la variabile:
1. Vai su "Deployments"
2. Clicca sui tre puntini dell'ultimo deployment
3. Seleziona "Redeploy"

## Verifica

Dopo il redeploy, dovresti vedere nei log:
- ✅ `Configurazione Firebase caricata correttamente`
- ✅ `Firebase Realtime Database inizializzato`
- ✅ Nessun errore `FIREBASE FATAL ERROR`

## Test

Puoi testare la configurazione aprendo:
- `https://your-app.vercel.app/test-realtime-only.html`

## Struttura Database

Il Realtime Database avrà questa struttura:
```
certificates/
  ├── {batchId}_{timestamp}/
  │   ├── batchId: number
  │   ├── name: string
  │   ├── companyName: string
  │   ├── walletAddress: string
  │   ├── date: string
  │   ├── location: string
  │   ├── description: string
  │   ├── transactionHash: string
  │   ├── imageIpfsHash: string
  │   ├── steps: array
  │   ├── createdAt: string
  │   ├── isActive: boolean
  │   └── viewCount: number
```

## Note Importanti

- ⚠️ L'URL deve terminare con `/`
- ⚠️ Assicurati che il Realtime Database sia abilitato nel progetto Firebase
- ⚠️ Le regole di sicurezza devono permettere lettura/scrittura per i certificati