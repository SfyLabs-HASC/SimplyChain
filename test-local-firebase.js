// Test locale per verificare la configurazione Firebase
import { initializeApp, cert } from 'firebase-admin/app';
import { getDatabase } from 'firebase-admin/database';

// Simula le variabili d'ambiente
const envVars = {
  FIREBASE_PROJECT_ID: 'easychain-db',
  FIREBASE_CLIENT_EMAIL: 'firebase-adminsdk-fbsvc@easychain-db.iam.gserviceaccount.com',
  FIREBASE_PRIVATE_KEY: process.env.FIREBASE_PRIVATE_KEY || 'MISSING',
  FIREBASE_DATABASE_URL: 'https://easychain-db-default-rtdb.europe-west1.firebasedatabase.app/'
};

console.log('🧪 Test Firebase Configuration Locale');
console.log('📋 Variabili d\'ambiente:');
Object.entries(envVars).forEach(([key, value]) => {
  console.log(`- ${key}: ${value ? 'SET' : 'MISSING'}`);
});

if (envVars.FIREBASE_PRIVATE_KEY === 'MISSING') {
  console.log('❌ FIREBASE_PRIVATE_KEY non trovata. Impostala come variabile d\'ambiente.');
  process.exit(1);
}

try {
  // Processa la private key come nell'API
  let privateKey = envVars.FIREBASE_PRIVATE_KEY;
  if (privateKey) {
    // Se contiene \n letterali, li converte in newline reali
    if (privateKey.includes('\\n')) {
      privateKey = privateKey.replace(/\\n/g, '\n');
    }
    // Se non contiene BEGIN PRIVATE KEY, potrebbe essere che le newline sono già reali
    // ma sono state convertite in spazi o altri caratteri
    if (!privateKey.includes('BEGIN PRIVATE KEY')) {
      // Prova a ricostruire la private key
      privateKey = privateKey.replace(/\s+/g, '\n');
    }
  }
  
  console.log('🔑 Private Key info:', {
    originalLength: envVars.FIREBASE_PRIVATE_KEY?.length || 0,
    processedLength: privateKey?.length || 0,
    startsWith: privateKey?.substring(0, 20) || 'UNDEFINED',
    endsWith: privateKey?.substring(privateKey.length - 20) || 'UNDEFINED',
    containsBegin: privateKey?.includes('BEGIN PRIVATE KEY') || false
  });
  
  if (!privateKey || !privateKey.includes('BEGIN PRIVATE KEY')) {
    throw new Error('FIREBASE_PRIVATE_KEY non è valida. Deve contenere "BEGIN PRIVATE KEY"');
  }
  
  // Inizializza Firebase
  const app = initializeApp({
    credential: cert({
      projectId: envVars.FIREBASE_PROJECT_ID,
      clientEmail: envVars.FIREBASE_CLIENT_EMAIL,
      privateKey: privateKey,
    }),
    databaseURL: envVars.FIREBASE_DATABASE_URL
  });
  
  console.log('✅ Firebase Admin SDK inizializzato');
  
  // Test connessione database
  const db = getDatabase(app);
  const testRef = db.ref('test/connection');
  await testRef.set({
    timestamp: Date.now(),
    message: 'Test connessione locale'
  });
  
  console.log('✅ Realtime Database connesso');
  
  // Test lettura
  const snapshot = await testRef.once('value');
  const data = snapshot.val();
  console.log('📄 Dati test:', data);
  
  console.log('🎉 Tutto funziona!');
  
} catch (error) {
  console.error('❌ Errore:', error.message);
  process.exit(1);
}