import { Link, useNavigate } from "react-router-dom";
import { Shield, Zap, Globe, Users, ArrowRight, CheckCircle, Sparkles, Cpu, Network, Lock, FileText, X, Play } from 'lucide-react';
import { useState, useEffect } from 'react';
import { ConnectButton, useActiveAccount } from "thirdweb/react";
import { createThirdwebClient } from "thirdweb";
import { polygon } from "thirdweb/chains";
import { inAppWallet } from "thirdweb/wallets";

const client = createThirdwebClient({ clientId: "023dd6504a82409b2bc7cb971fd35b16" });

// Configurazione wallet con opzioni social multiple
const wallets = [
  inAppWallet({
    auth: {
      options: [
        "google",
        "discord",
        "telegram",
        "email",
        "x",
        "twitch",
        "facebook",
        "apple",
        "tiktok",
      ],
    },
  }),
];

export default function HomePage() {
  const [isVideoOpen, setIsVideoOpen] = useState(false);
  const [textPhase, setTextPhase] = useState(1);
  const [connectButtonRef, setConnectButtonRef] = useState<HTMLButtonElement | null>(null);
  const account = useActiveAccount();
  const navigate = useNavigate();

  useEffect(() => {
    // Set up an interval to change the text phase every 4 seconds (4000ms)
    const interval = setInterval(() => {
      setTextPhase((prevPhase) => {
        // Cycle from 1 to 2, 2 to 3, and 3 back to 1
        if (prevPhase === 3) {
          return 1; // Loop back to the first phase
        } else {
          return prevPhase + 1; // Increment to the next phase
        }
      });
    }, 4000); // Change text every 4 seconds

    // Clean up the interval when the component unmounts
    return () => {
      clearInterval(interval);
    };
  }, []); // Empty dependency array means this effect runs once on mount and cleans up on unmount

  // Effect to handle user authentication and routing
  useEffect(() => {
    if (account && account.address) {
      // Sempre auto-redirect quando l'utente si connette
      checkUserVerification();
    }
  }, [account]);

  const checkUserVerification = async () => {
    if (!account?.address) return;

    try {
      const response = await fetch(`/api/get-company-status?walletAddress=${account.address}`);
      if (!response.ok) {
        throw new Error('Errore di rete nella verifica dello stato.');
      }
      const data = await response.json();
      
      if (data.isActive) {
        // Utente verificato, vai ad AziendaPage
        navigate('/azienda');
      } else {
        // Utente non verificato, vai a FormPage
        navigate('/form');
      }
    } catch (error) {
      console.error('Errore durante la verifica:', error);
      // In caso di errore, vai comunque a FormPage
      navigate('/form');
    }
  };

  const handleAuthButtonClick = () => {
    // Trova il ConnectButton nascosto e simula un click
    setTimeout(() => {
      const connectButtons = document.querySelectorAll('button');
      for (let button of connectButtons) {
        if (button.textContent?.includes('Connect Wallet') || 
            button.textContent?.includes('Connetti') ||
            button.getAttribute('data-testid')?.includes('connect') ||
            button.closest('[style*="left: -9999px"]')) {
          button.click();
          break;
        }
      }
    }, 100);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* ConnectButton nascosto per triggare il popup */}
      <div style={{ position: 'absolute', left: '-9999px', opacity: 0, pointerEvents: 'none' }}>
        <ConnectButton 
          client={client} 
          wallets={wallets}
          chain={polygon}
          accountAbstraction={{ chain: polygon, sponsorGas: true }}
        />
      </div>
      
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Animated Background */}
        <div className="absolute inset-0 tech-pattern"></div>
        <div className="absolute inset-0 hero-gradient opacity-20"></div>
        
        {/* Floating Elements */}
        <div className="absolute top-20 left-10 w-20 h-20 primary-gradient rounded-full opacity-20 floating-animation"></div>
        <div className="absolute top-40 right-20 w-16 h-16 accent-gradient rounded-full opacity-30 floating-animation" style={{animationDelay: '2s'}}></div>
        <div className="absolute bottom-40 left-20 w-12 h-12 primary-gradient rounded-full opacity-25 floating-animation" style={{animationDelay: '4s'}}></div>
        
        {/* Content */}
        <div className="relative z-10 container mx-auto px-6 text-center">
          <div className="max-w-5xl mx-auto">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 glass-card rounded-full px-6 py-3 mb-8 pulse-glow">
              <Sparkles className="w-5 h-5 text-accent" />
              <span className="text-sm font-medium">Innovazione Blockchain Made in Italy</span>
            </div>
            
            <h1 className="text-6xl md:text-8xl font-bold mb-8 bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent leading-none pb-4">
              EasyChain
            </h1>
            
            <p className="text-2xl md:text-3xl font-light text-muted-foreground mb-6 max-w-4xl mx-auto leading-relaxed">
              La <span className="text-accent font-medium">rivoluzione blockchain</span> per la certificazione
            </p>
            <p className="text-xl md:text-2xl text-muted-foreground mb-12 max-w-3xl mx-auto leading-relaxed">
              Semplice, sicura e potente. Per aziende italiane che vogliono innovare senza complessità.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-6 justify-center items-center mb-16">
              <button 
                onClick={handleAuthButtonClick}
                className="group primary-gradient text-xl px-10 py-5 rounded-2xl tech-shadow smooth-transition hover:scale-105 text-primary-foreground font-semibold flex items-center gap-3"
              >
                Accedi
                <ArrowRight className="w-6 h-6 group-hover:translate-x-1 smooth-transition" />
              </button>
              <button
                onClick={() => setIsVideoOpen(true)}
                className="text-muted-foreground hover:text-accent smooth-transition text-lg underline decoration-accent/50 hover:decoration-accent flex items-center gap-2"
              >
                <Play className="w-5 h-5" />
                Guarda Video
              </button>
            </div>
            
            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
              <div className="glass-card rounded-3xl p-8 tech-shadow">
                <div className="flex items-center justify-center gap-3 mb-4">
                  <div className="w-4 h-4 bg-accent rounded-full animate-pulse"></div>
                  <span className="text-lg font-semibold text-accent">Inizia Gratis</span>
                </div>
                <p className="text-muted-foreground font-medium">Crediti Inclusi</p>
              </div>
              
              <div className="glass-card rounded-3xl p-8 tech-shadow">
                <div className="flex items-center justify-center gap-3 mb-4">
                  <a href="https://polygon.technology/" target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 hover:scale-105 smooth-transition">
                    <Network className="w-6 h-6 text-primary" />
                    <span className="text-lg font-semibold text-primary">Polygon</span>
                  </a>
                </div>
                <p className="text-muted-foreground font-medium">Rete Decentralizzata</p>
              </div>
              
              <div className="glass-card rounded-3xl p-8 tech-shadow">
                <div className="flex items-center justify-center gap-3 mb-4">
                  <Shield className="w-6 h-6 text-accent" />
                  <span className="text-lg font-semibold text-accent">100%</span>
                </div>
                <p className="text-muted-foreground font-medium">Immutabilità Garantita</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Process Section */}
      <section className="py-32 bg-card/30 relative overflow-hidden">
        <div className="absolute inset-0 tech-pattern opacity-30"></div>
        <div className="container mx-auto px-6 relative z-10">
          <div className="text-center mb-20">
            <div className="inline-flex items-center gap-2 glass-card rounded-full px-6 py-3 mb-8">
              <Cpu className="w-5 h-5 text-primary" />
              <span className="text-sm font-medium">Processo Semplificato</span>
            </div>
            <h2 className="text-5xl md:text-6xl font-bold mb-8 bg-gradient-to-r from-foreground to-muted-foreground bg-clip-text text-transparent">
              Come Funziona EasyChain
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              Tre semplici passaggi per rivoluzionare la tua filiera produttiva
            </p>
          </div>
          
          <div className="grid lg:grid-cols-3 gap-12">
            {/* Step 1 */}
            <div className="relative">
              <div className="glass-card rounded-4xl p-10 tech-shadow">
                <div className="relative mb-8">
                  <div className="w-20 h-20 accent-gradient rounded-3xl flex items-center justify-center mx-auto mb-6 pulse-glow">
                    <span className="text-3xl font-bold text-accent-foreground">1</span>
                  </div>
                  <div className="absolute -top-2 -right-2 w-8 h-8 primary-gradient rounded-full opacity-60 animate-bounce"></div>
                </div>
                <h3 className="text-2xl font-bold mb-6 text-center">Registra i Tuoi Prodotti</h3>
                <p className="text-muted-foreground leading-relaxed text-center mb-6">
                  Carica le informazioni dei tuoi prodotti nella piattaforma EasyChain con un processo intuitivo
                </p>
                <div className="flex justify-center">
                  <div className="w-16 h-1 accent-gradient rounded-full"></div>
                </div>
              </div>
            </div>
            
            {/* Step 2 */}
            <div className="relative">
              <div className="glass-card rounded-4xl p-10 tech-shadow">
                <div className="relative mb-8">
                  <div className="w-20 h-20 primary-gradient rounded-3xl flex items-center justify-center mx-auto mb-6 pulse-glow">
                    <span className="text-3xl font-bold text-primary-foreground">2</span>
                  </div>
                  <div className="absolute -top-2 -right-2 w-8 h-8 accent-gradient rounded-full opacity-60 animate-bounce" style={{animationDelay: '0.5s'}}></div>
                </div>
                <h3 className="text-2xl font-bold mb-6 text-center">Traccia il Percorso</h3>
                <p className="text-muted-foreground leading-relaxed text-center mb-6">
                  Monitora ogni movimento e trasformazione lungo la supply chain in tempo reale
                </p>
                <div className="flex justify-center">
                  <div className="w-16 h-1 primary-gradient rounded-full"></div>
                </div>
              </div>
            </div>
            
            {/* Step 3 */}
            <div className="relative">
              <div className="glass-card rounded-4xl p-10 tech-shadow">
                <div className="relative mb-8">
                  <div className="w-20 h-20 accent-gradient rounded-3xl flex items-center justify-center mx-auto mb-6 pulse-glow">
                    <span className="text-3xl font-bold text-accent-foreground">3</span>
                  </div>
                  <div className="absolute -top-2 -right-2 w-8 h-8 primary-gradient rounded-full opacity-60 animate-bounce" style={{animationDelay: '1s'}}></div>
                </div>
                <h3 className="text-2xl font-bold mb-6 text-center">Verifica l'Autenticità</h3>
                <p className="text-muted-foreground leading-relaxed text-center mb-6">
                  Consumatori e partner possono verificare istantaneamente l'autenticità di ogni prodotto
                </p>
                <div className="flex justify-center">
                  <div className="w-16 h-1 accent-gradient rounded-full"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Security Section */}
      <section className="py-32 bg-background relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-transparent to-accent/5"></div>
        <div className="container mx-auto px-6 relative z-10">
          <div className="grid lg:grid-cols-2 gap-20 items-center">
            <div>
              <div className="inline-flex items-center gap-2 glass-card rounded-full px-6 py-3 mb-8">
                <Shield className="w-5 h-5 text-primary" />
                <span className="text-sm font-medium">Sicurezza Avanzata</span>
              </div>
              
              <h2 className="text-5xl md:text-6xl font-bold mb-8 bg-gradient-to-r from-foreground to-muted-foreground bg-clip-text text-transparent">
                Sicurezza e Affidabilità
              </h2>
              <p className="text-xl text-muted-foreground mb-12 leading-relaxed">
                La nostra piattaforma utilizza la tecnologia blockchain più avanzata per garantire 
                l'immutabilità e la sicurezza assoluta dei tuoi dati.
              </p>
              
              <div className="space-y-8">
                <div className="glass-card rounded-2xl p-8">
                  <div className="flex items-start gap-6">
                    <div className="w-16 h-16 primary-gradient rounded-2xl flex items-center justify-center flex-shrink-0">
                      <Lock className="w-8 h-8 text-primary-foreground" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold mb-3">Crittografia End-to-End</h3>
                      <p className="text-muted-foreground leading-relaxed">
                        Tutti i dati sono protetti con crittografia di livello militare e protocolli di sicurezza avanzati
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="glass-card rounded-2xl p-8">
                  <div className="flex items-start gap-6">
                    <div className="w-16 h-16 accent-gradient rounded-2xl flex items-center justify-center flex-shrink-0">
                      <Network className="w-8 h-8 text-accent-foreground" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold mb-3">Blockchain Immutabile</h3>
                      <p className="text-muted-foreground leading-relaxed">
                        Una volta registrati, i dati diventano immutabili e verificabili per sempre sulla blockchain
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="glass-card rounded-2xl p-8">
                  <div className="flex items-start gap-6">
                    <div className="w-16 h-16 primary-gradient rounded-2xl flex items-center justify-center flex-shrink-0">
                      <Shield className="w-8 h-8 text-primary-foreground" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold mb-3">Monitoraggio 24/7</h3>
                      <p className="text-muted-foreground leading-relaxed">
                        Controllo continuo e audit di sicurezza automatici per garantire massima protezione
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="relative">
              <div className="glass-card rounded-4xl p-12 tech-shadow floating-animation">
                <div className="w-full h-96 bg-gradient-to-br from-primary/20 via-accent/10 to-primary/20 rounded-3xl flex items-center justify-center relative overflow-hidden">
                  <div className="absolute inset-0 tech-pattern opacity-30"></div>
                   <div className="text-center relative z-10 max-w-md">
                     <div className="w-24 h-24 primary-gradient rounded-3xl flex items-center justify-center mx-auto mb-6 pulse-glow">
                       <FileText className="w-12 h-12 text-primary-foreground" />
                     </div>
                     <div className="text-muted-foreground text-lg leading-relaxed min-h-[180px] flex items-center">
                        {textPhase === 1 && (
                          <p className="animate-fade-in">
                            Registrare su blockchain ogni prodotto, passaggio di filiera o contratto significa garantire trasparenza, fiducia e tutela.
                          </p>
                        )}
                        {textPhase === 2 && (
                          <p className="animate-fade-in">
                            Ogni dato diventa immutabile e verificabile: 
                            il cliente sa da dove viene ciò che acquista.
                          </p>
                        )}
                        {textPhase === 3 && (
                          <p className="animate-fade-in">
                            Il produttore difende il proprio lavoro e il Made in Italy si rafforza contro contraffazioni e pratiche scorrette.
                          </p>
                        )}
                     </div>
                   </div>
                </div>
              </div>
              
              {/* Floating decorative elements */}
              <div className="absolute -top-8 -right-8 w-32 h-32 accent-gradient rounded-full opacity-20 floating-animation"></div>
              <div className="absolute -bottom-8 -left-8 w-40 h-40 primary-gradient rounded-full opacity-15 floating-animation" style={{animationDelay: '3s'}}></div>
              <div className="absolute top-1/2 -right-4 w-16 h-16 accent-gradient rounded-full opacity-25 floating-animation" style={{animationDelay: '1.5s'}}></div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-32 bg-card/20 relative overflow-hidden">
        <div className="absolute inset-0 tech-pattern opacity-20"></div>
        <div className="absolute inset-0 bg-gradient-to-r from-primary/10 via-transparent to-accent/10"></div>
        
        <div className="container mx-auto px-6 relative z-10">
          <div className="text-center max-w-5xl mx-auto">
            <div className="inline-flex items-center gap-2 glass-card rounded-full px-6 py-3 mb-8">
              <Zap className="w-5 h-5 text-accent" />
              <span className="text-sm font-medium">Inizia Subito</span>
            </div>
            
            <h2 className="text-5xl md:text-7xl font-bold mb-8 bg-gradient-to-r from-foreground via-primary to-accent bg-clip-text text-transparent leading-none pb-4">
              La Tua Rivoluzione Digitale
            </h2>
            <p className="text-xl text-muted-foreground mb-16 leading-relaxed max-w-3xl mx-auto">
              Unisciti alle aziende che hanno già scelto EasyChain per trasformare la loro 
              filiera produttiva. <span className="text-accent font-semibold">Inizia oggi stesso!</span>
            </p>
            
            {/* Enhanced CTA Card */}
            <div className="glass-card rounded-4xl p-16 tech-shadow relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5"></div>
              
              <div className="relative z-10">
                <button 
                  onClick={handleAuthButtonClick}
                  className="group primary-gradient text-2xl px-16 py-8 rounded-3xl tech-shadow smooth-transition hover:scale-105 text-primary-foreground font-bold flex items-center gap-4 mx-auto"
                >
                  Registra la tua Azienda
                  <ArrowRight className="w-8 h-8 group-hover:translate-x-2 smooth-transition" />
                </button>
                
                <p className="text-muted-foreground mt-6 text-lg">
                  Registrazione gratuita • Nessun costo nascosto • Attivazione su verifica
                </p>
              </div>
              
              {/* Decorative elements */}
              <div className="absolute top-8 left-8 w-16 h-16 primary-gradient rounded-full opacity-20 floating-animation"></div>
              <div className="absolute bottom-8 right-8 w-20 h-20 accent-gradient rounded-full opacity-15 floating-animation" style={{animationDelay: '2s'}}></div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-card/50 border-t border-border/20 py-20 relative overflow-hidden">
        <div className="absolute inset-0 tech-pattern opacity-10"></div>
        <div className="container mx-auto px-6 relative z-10">
          <div className="grid md:grid-cols-4 gap-12">
            {/* Brand */}
            <div className="col-span-2">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 primary-gradient rounded-2xl flex items-center justify-center">
                  <Network className="w-6 h-6 text-primary-foreground" />
                </div>
                <h3 className="text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                  EasyChain
                </h3>
              </div>
              <p className="text-muted-foreground mb-8 max-w-md text-lg leading-relaxed">
                La rivoluzione blockchain per la certificazione delle filiere produttive italiane. 
                Semplice, sicura, innovativa.
              </p>
              <div className="glass-card rounded-2xl p-6 tech-shadow">
                <h4 className="font-bold mb-3 text-lg">Proprietario del servizio:</h4>
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-8 h-8 accent-gradient rounded-xl flex items-center justify-center">
                    <Globe className="w-4 h-4 text-accent-foreground" />
                  </div>
                  <p className="text-accent font-bold text-lg">SFY srl</p>
                </div>
                <p className="text-muted-foreground">
                  📧 sfy.startup@gmail.com
                </p>
              </div>
            </div>
            
            {/* Links */}
            <div>
              <h4 className="font-bold mb-6 text-lg">Contatti</h4>
              <ul className="space-y-4">
                <li>
                  <Link to="/contatti" className="text-muted-foreground hover:text-primary smooth-transition flex items-center gap-2 group">
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 smooth-transition" />
                    Contatti
                  </Link>
                </li>
              </ul>
            </div>
            
            {/* Legal */}
            <div>
              <h4 className="font-bold mb-6 text-lg">Informazioni Legali</h4>
              <ul className="space-y-4">
                <li>
                  <Link to="/privacy" className="text-muted-foreground hover:text-primary smooth-transition flex items-center gap-2 group">
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 smooth-transition" />
                    Privacy Policy
                  </Link>
                </li>
                <li>
                  <Link to="/terms" className="text-muted-foreground hover:text-primary smooth-transition flex items-center gap-2 group">
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 smooth-transition" />
                    Termini di Servizio
                  </Link>
                </li>
                <li>
                  <Link to="/cookies" className="text-muted-foreground hover:text-primary smooth-transition flex items-center gap-2 group">
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 smooth-transition" />
                    Cookie Policy
                  </Link>
                </li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-border/20 mt-16 pt-8">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
              <p className="text-muted-foreground text-center md:text-left">
                &copy; 2024 SFY srl. Tutti i diritti riservati.
              </p>
              <div className="flex items-center gap-2">
                <span className="text-muted-foreground">Powered by</span>
                <a href="https://polygon.technology/" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 glass-card rounded-full px-4 py-2 hover:scale-105 smooth-transition">
                  <Network className="w-4 h-4 text-primary" />
                  <span className="text-primary font-semibold">Polygon</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      </footer>

      {/* Video Popup Modal */}
      {isVideoOpen && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm"
          onClick={() => setIsVideoOpen(false)}
        >
          <div 
            className="relative w-full max-w-5xl mx-4 bg-background rounded-2xl overflow-hidden tech-shadow"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setIsVideoOpen(false)}
              className="absolute top-4 right-4 z-10 w-10 h-10 bg-black/50 hover:bg-black/70 rounded-full flex items-center justify-center smooth-transition"
            >
              <X className="w-6 h-6 text-white" />
            </button>
            <div className="aspect-video">
              <iframe
                src="https://www.youtube.com/embed/LMA4RyMwn7s?autoplay=1&rel=0"
                title="EasyChain Video"
                className="w-full h-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
