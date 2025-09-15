// Template PDF base per certificati di tracciabilità
export async function createPDFTemplate() {
  const { PDFDocument, rgb, StandardFonts } = await import('pdf-lib');
  
  // Crea nuovo documento PDF
  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage([595, 842]); // A4 size
  
  // Colori del tema
  const primaryColor = rgb(0.545, 0.361, 0.965); // #8b5cf6
  const lightGray = rgb(0.973, 0.980, 0.988); // #f8fafc
  const darkGray = rgb(0.122, 0.161, 0.216); // #1f2937
  const white = rgb(1, 1, 1);
  
  // Header con sfondo viola
  page.drawRectangle({
    x: 0,
    y: 742,
    width: 595,
    height: 100,
    color: primaryColor,
  });
  
  // Logo (S) - cerchio bianco
  page.drawCircle({
    x: 50,
    y: 792,
    radius: 15,
    color: white,
  });
  
  // Testo S nel cerchio
  const font = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  page.drawText('S', {
    x: 42,
    y: 787,
    size: 20,
    font: font,
    color: primaryColor,
  });
  
  // Titolo principale
  page.drawText('CERTIFICATO DI TRACCIABILITÀ', {
    x: 0,
    y: 762,
    size: 24,
    font: font,
    color: white,
    align: 'center',
  });
  
  // Simply Chain
  page.drawText('SIMPLY CHAIN', {
    x: 0,
    y: 737,
    size: 16,
    font: font,
    color: white,
    align: 'center',
  });
  
  // Azienda (placeholder)
  page.drawText('Prodotto da: [AZIENDA]', {
    x: 0,
    y: 712,
    size: 12,
    font: font,
    color: white,
    align: 'center',
  });
  
  // Sezione Informazioni Batch
  page.drawRectangle({
    x: 50,
    y: 600,
    width: 495,
    height: 100,
    color: lightGray,
  });
  
  page.drawText('📦 INFORMAZIONI ISCRIZIONE', {
    x: 60,
    y: 670,
    size: 16,
    font: font,
    color: primaryColor,
  });
  
  // Griglia informazioni (placeholder)
  const infoLabels = [
    'Nome Prodotto:', 'Data di Origine:',
    'Luogo di Produzione:', 'Stato:',
    'Batch ID:', 'Data Generazione:'
  ];
  
  const infoValues = [
    '[NOME_PRODOTTO]', '[DATA_ORIGINE]',
    '[LUOGO_PRODUZIONE]', '✅ Finalizzato',
    '[BATCH_ID]', '[DATA_GENERAZIONE]'
  ];
  
  infoLabels.forEach((label, index) => {
    const x = 60 + (index % 2) * 240;
    const y = 640 + Math.floor(index / 2) * 15;
    
    page.drawText(label, {
      x: x,
      y: y,
      size: 10,
      font: font,
      color: darkGray,
    });
    
    page.drawText(infoValues[index], {
      x: x + 80,
      y: y,
      size: 10,
      font: font,
      color: darkGray,
    });
  });
  
  // Sezione Descrizione (placeholder)
  page.drawRectangle({
    x: 50,
    y: 480,
    width: 495,
    height: 40,
    color: white,
  });
  
  page.drawText('Descrizione:', {
    x: 60,
    y: 500,
    size: 12,
    font: font,
    color: primaryColor,
  });
  
  page.drawText('[DESCRIZIONE]', {
    x: 60,
    y: 485,
    size: 10,
    font: font,
    color: darkGray,
  });
  
  // QR Code per batch (placeholder)
  page.drawRectangle({
    x: 60,
    y: 400,
    width: 60,
    height: 60,
    borderColor: primaryColor,
    borderWidth: 1,
  });
  
  page.drawText('QR CODE', {
    x: 75,
    y: 430,
    size: 10,
    font: font,
    color: primaryColor,
    align: 'center',
  });
  
  page.drawText('Blockchain', {
    x: 75,
    y: 420,
    size: 8,
    font: font,
    color: primaryColor,
    align: 'center',
  });
  
  page.drawText('Verification', {
    x: 75,
    y: 410,
    size: 8,
    font: font,
    color: primaryColor,
    align: 'center',
  });
  
  // Testo verifica blockchain
  page.drawText('Verifica Blockchain:', {
    x: 140,
    y: 430,
    size: 10,
    font: font,
    color: primaryColor,
  });
  
  page.drawText('Transaction Hash:', {
    x: 140,
    y: 415,
    size: 8,
    font: font,
    color: darkGray,
  });
  
  page.drawText('[TRANSACTION_HASH]', {
    x: 140,
    y: 400,
    size: 8,
    font: font,
    color: darkGray,
  });
  
  // Footer
  page.drawRectangle({
    x: 0,
    y: 0,
    width: 595,
    height: 50,
    color: lightGray,
  });
  
  page.drawText('SIMPLY CHAIN - Tracciabilità Blockchain per le imprese italiane', {
    x: 0,
    y: 30,
    size: 8,
    font: font,
    color: darkGray,
    align: 'center',
  });
  
  page.drawText('Servizio Gratuito prodotto da SFY s.r.l. - sfy.startup@gmail.com', {
    x: 0,
    y: 15,
    size: 8,
    font: font,
    color: darkGray,
    align: 'center',
  });
  
  return pdfDoc;
}