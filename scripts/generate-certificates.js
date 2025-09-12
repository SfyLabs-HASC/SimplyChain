#!/usr/bin/env node

/**
 * Script per generare file HTML statici dai certificati salvati in Firestore
 * Questi file vengono poi deployati su Firebase Hosting come file statici
 */

const admin = require('firebase-admin');
const fs = require('fs');
const path = require('path');

// Inizializza Firebase Admin
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    })
  });
}

async function generateCertificateFiles() {
  try {
    console.log('🔥 Generando file HTML dai certificati Firestore...');
    
    const db = admin.firestore();
    const certificatesSnapshot = await db.collection('certificates').get();
    
    const publicCertDir = path.join(process.cwd(), 'public', 'certificate');
    
    // Crea la directory se non esiste
    if (!fs.existsSync(publicCertDir)) {
      fs.mkdirSync(publicCertDir, { recursive: true });
    }
    
    let generatedCount = 0;
    
    for (const doc of certificatesSnapshot.docs) {
      const data = doc.data();
      
      if (data.isPublic && data.html) {
        // Crea cartella per l'azienda se esiste il nome
        const companyFolder = data.cleanCompanyName || 'unknown';
        const companyDir = path.join(publicCertDir, companyFolder);
        
        // Crea la directory dell'azienda se non esiste
        if (!fs.existsSync(companyDir)) {
          fs.mkdirSync(companyDir, { recursive: true });
        }
        
        const fileName = `${doc.id}.html`;
        const filePath = path.join(companyDir, fileName);
        
        // Scrivi il file HTML
        fs.writeFileSync(filePath, data.html, 'utf8');
        
        console.log(`✅ Generato: ${companyFolder}/${fileName}`);
        generatedCount++;
      }
    }
    
    console.log(`🎉 Generati ${generatedCount} file HTML nella cartella public/certificate/`);
    console.log('📁 I file sono pronti per il deploy su Firebase Hosting');
    
  } catch (error) {
    console.error('❌ Errore nella generazione dei file:', error);
    process.exit(1);
  }
}

// Esegui solo se chiamato direttamente
if (require.main === module) {
  generateCertificateFiles();
}

module.exports = { generateCertificateFiles };