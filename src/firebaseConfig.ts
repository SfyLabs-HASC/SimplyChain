// FILE: src/firebaseConfig.ts

import { initializeApp, getApp, getApps } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getDatabase } from "firebase/database";

// Leggiamo le credenziali dalle Environment Variables di Vercel.
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
  databaseURL: import.meta.env.VITE_FIREBASE_DATABASE_URL
};

// Controlla che le variabili siano state caricate per un debug più facile
if (!firebaseConfig.projectId) {
  console.error("Configurazione di Firebase non trovata. Assicurati di aver impostato le variabili d'ambiente VITE_ su Vercel e di aver fatto un redeploy.");
  console.error("Variabili mancanti:", {
    apiKey: !!firebaseConfig.apiKey,
    authDomain: !!firebaseConfig.authDomain,
    projectId: !!firebaseConfig.projectId,
    storageBucket: !!firebaseConfig.storageBucket,
    messagingSenderId: !!firebaseConfig.messagingSenderId,
    appId: !!firebaseConfig.appId,
    databaseURL: !!firebaseConfig.databaseURL
  });
}

// Verifica specifica per il Realtime Database URL
if (!firebaseConfig.databaseURL) {
  console.error("❌ VITE_FIREBASE_DATABASE_URL non è configurata!");
  console.error("Aggiungi questa variabile d'ambiente su Vercel:");
  console.error("VITE_FIREBASE_DATABASE_URL=https://your-project-id-default-rtdb.firebaseio.com/");
}

// Inizializza Firebase solo se non è già stato fatto per evitare errori
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

const db = getFirestore(app);
const realtimeDb = getDatabase(app);

// Esporta le istanze per poterle usare nel resto dell'applicazione
export { app, db, realtimeDb };