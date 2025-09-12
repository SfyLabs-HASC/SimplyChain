// API per deploy immediato di certificati su Firebase Hosting
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { certificateId, companyName, htmlContent } = req.body;
    
    if (!certificateId || !companyName || !htmlContent) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    console.log('🚀 Deploy immediato certificato:', certificateId);
    
    // Usa GitHub API per creare/aggiornare il file direttamente nel repository
    const cleanCompanyName = companyName.replace(/[^a-zA-Z0-9\s]/g, '').replace(/\s+/g, '_');
    const filePath = `public/certificate/${cleanCompanyName}/${certificateId}.html`;
    
    const githubResponse = await fetch(`https://api.github.com/repos/${process.env.GITHUB_REPO}/contents/${filePath}`, {
      method: 'PUT',
      headers: {
        'Authorization': `token ${process.env.GITHUB_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message: `Add certificate: ${certificateId}`,
        content: Buffer.from(htmlContent).toString('base64'),
        branch: 'main'
      })
    });

    if (!githubResponse.ok) {
      throw new Error(`GitHub API error: ${githubResponse.status}`);
    }

    console.log('✅ File aggiunto al repository, deploy automatico in corso');
    
    const certificateUrl = `https://${process.env.FIREBASE_PROJECT_ID}.web.app/certificate/${cleanCompanyName}/${certificateId}.html`;
    
    res.json({
      success: true,
      url: certificateUrl,
      message: 'Deploy in corso, certificato disponibile tra 1-2 minuti'
    });

  } catch (error) {
    console.error('❌ Errore deploy certificato:', error);
    res.status(500).json({ 
      error: 'Deploy failed',
      details: error.message 
    });
  }
}