// File: /api/create-payment-intent.js

import Stripe from 'stripe';

// Inizializza Stripe con la tua CHIAVE SEGRETA presa dalle variabili d'ambiente
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export default async function handler(request, response) {
  // Accetta solo richieste POST
  if (request.method !== 'POST') {
    response.setHeader('Allow', 'POST');
    return response.status(405).end('Method Not Allowed');
  }

  try {
    const { amount, walletAddress } = request.body;

    // --- LOGICA IMPORTANTE ---
    // Qui dovresti recuperare dal tuo database (es. Firebase)
    // lo stripeCustomerId associato al walletAddress dell'utente.
    // Per ora, l'esempio procede senza un customer specifico, ma
    // in produzione è FONDAMENTALE per associare i pagamenti.
    // Esempio: const stripeCustomerId = await getCustomerFromDB(walletAddress);

    const paymentIntent = await stripe.paymentIntents.create({
      amount: amount,          // L'importo in centesimi
      currency: 'eur',
      // customer: stripeCustomerId, // Da usare in produzione
      automatic_payment_methods: {
        enabled: true,
      },
      // Aggiungi metadata per ritrovare l'utente dopo il pagamento
      metadata: {
        walletAddress: walletAddress,
      },
    });

    // Invia il client_secret al frontend
    return response.status(200).json({
      clientSecret: paymentIntent.client_secret,
    });

  } catch (error) {
    console.error("Errore API Stripe:", error);
    return response.status(500).json({ error: 'Errore durante la creazione del pagamento.' });
  }
}