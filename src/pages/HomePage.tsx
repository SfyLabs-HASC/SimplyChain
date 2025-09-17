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
  // Updated for QR system testing
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

  // Flag per tracciare se l'utente ha cliccato intenzionalmente un pulsante
  const [userClickedButton, setUserClickedButton] = useState(false);

  // Effect to handle user authentication and routing
  useEffect(() => {
    if (account && account.address && userClickedButton) {
      // Solo auto-redirect se l'utente ha cliccato un pulsante
      checkUserVerification();
      setUserClickedButton(false); // Reset flag dopo il redirect
    }
  }, [account, userClickedButton]);

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
    console.log('HomePage: Cliccato Accedi, navigando a /azienda');
    setUserClickedButton(true);
    navigate('/azienda');
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Nessun ConnectButton nascosto: il flow avviene su /azienda */}
      
      <div className="flex-1">
        {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Modern Animated Background */}
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-br from-background via-background/95 to-card/20"></div>
          <div className="absolute inset-0 tech-pattern opacity-40"></div>
          <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-transparent to-accent/5"></div>
        </div>
        
        {/* Enhanced Floating Elements */}
        <div className="absolute top-20 left-10 w-32 h-32 primary-gradient rounded-full opacity-10 floating-animation blur-xl"></div>
        <div className="absolute top-40 right-20 w-24 h-24 accent-gradient rounded-full opacity-15 floating-animation blur-lg" style={{animationDelay: '2s'}}></div>
        <div className="absolute bottom-40 left-20 w-20 h-20 primary-gradient rounded-full opacity-20 floating-animation blur-md" style={{animationDelay: '4s'}}></div>
        <div className="absolute top-1/2 right-1/4 w-16 h-16 accent-gradient rounded-full opacity-25 floating-animation blur-sm" style={{animationDelay: '6s'}}></div>
        
        {/* Content */}
        <div className="relative z-10 container mx-auto px-6 text-center">
          <div className="max-w-6xl mx-auto">
            {/* Modern Badge */}
            <div className="inline-flex items-center gap-3 glass-card rounded-full px-8 py-4 mb-12 pulse-glow border border-primary/20">
              <div className="w-2 h-2 bg-accent rounded-full animate-pulse"></div>
              <Sparkles className="w-5 h-5 text-accent" />
              <span className="text-sm font-semibold tracking-wide uppercase">Innovazione Blockchain Made in Italy</span>
            </div>
            
            {/* Enhanced Typography */}
            <h1 className="text-7xl md:text-9xl font-black mb-8 bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent leading-[0.9] tracking-tight">
              SimplyChain
            </h1>
            
            <div className="space-y-6 mb-16">
              <p className="text-3xl md:text-4xl font-light text-foreground/90 max-w-5xl mx-auto leading-tight">
                La <span className="text-accent font-semibold bg-gradient-to-r from-accent to-accent/80 bg-clip-text text-transparent">rivoluzione blockchain</span> per la certificazione
              </p>
              <p className="text-xl md:text-2xl text-muted-foreground max-w-4xl mx-auto leading-relaxed font-light">
                Semplice, sicura e potente. Per aziende italiane che vogliono innovare senza complessità.
              </p>
            </div>
            
            {/* Enhanced CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-8 justify-center items-center mb-20">
              <button 
                onClick={handleAuthButtonClick}
                className="group relative primary-gradient text-xl px-12 py-6 rounded-3xl tech-shadow smooth-transition hover:scale-105 text-primary-foreground font-bold flex items-center gap-4 overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -skew-x-12 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></div>
                <span className="relative z-10">Accedi alla Piattaforma</span>
                <ArrowRight className="w-6 h-6 group-hover:translate-x-1 smooth-transition relative z-10" />
              </button>
              <button
                onClick={() => setIsVideoOpen(true)}
                className="group text-muted-foreground hover:text-accent smooth-transition text-lg flex items-center gap-3 px-6 py-4 rounded-2xl hover:bg-accent/5 border border-transparent hover:border-accent/20"
              >
                <div className="w-12 h-12 rounded-full bg-accent/10 flex items-center justify-center group-hover:bg-accent/20 smooth-transition">
                  <Play className="w-5 h-5 ml-1" />
                </div>
                <span className="font-medium">Guarda la Demo</span>
              </button>
            </div>
            
            {/* Enhanced Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
              <div className="group glass-card rounded-3xl p-10 tech-shadow hover:scale-105 smooth-transition border border-accent/10 hover:border-accent/30">
                <div className="flex items-center justify-center gap-4 mb-6">
                  <div className="w-3 h-3 bg-accent rounded-full animate-pulse"></div>
                  <span className="text-xl font-bold text-accent">Inizia Gratis</span>
                </div>
                <p className="text-muted-foreground font-medium text-lg">Crediti Inclusi</p>
                <div className="mt-4 w-full h-1 bg-gradient-to-r from-accent/20 to-accent/60 rounded-full"></div>
              </div>
              
              <div className="group glass-card rounded-3xl p-10 tech-shadow hover:scale-105 smooth-transition border border-primary/10 hover:border-primary/30">
                <div className="flex items-center justify-center gap-4 mb-6">
                  <a href="https://polygon.technology/" target="_blank" rel="noopener noreferrer" className="flex items-center gap-4 hover:scale-110 smooth-transition">
                    <Network className="w-7 h-7 text-primary" />
                    <span className="text-xl font-bold text-primary">Polygon</span>
                  </a>
                </div>
                <p className="text-muted-foreground font-medium text-lg">Rete Decentralizzata</p>
                <div className="mt-4 w-full h-1 bg-gradient-to-r from-primary/20 to-primary/60 rounded-full"></div>
              </div>
              
              <div className="group glass-card rounded-3xl p-10 tech-shadow hover:scale-105 smooth-transition border border-accent/10 hover:border-accent/30">
                <div className="flex items-center justify-center gap-4 mb-6">
                  <Shield className="w-7 h-7 text-accent" />
                  <span className="text-xl font-bold text-accent">100%</span>
                </div>
                <p className="text-muted-foreground font-medium text-lg">Immutabilità Garantita</p>
                <div className="mt-4 w-full h-1 bg-gradient-to-r from-accent/20 to-accent/60 rounded-full"></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Process Section */}
      <section className="py-40 bg-gradient-to-b from-card/20 via-card/30 to-card/10 relative overflow-hidden">
        <div className="absolute inset-0 tech-pattern opacity-20"></div>
        <div className="absolute inset-0 bg-gradient-to-r from-primary/3 via-transparent to-accent/3"></div>
        <div className="container mx-auto px-6 relative z-10">
          <div className="text-center mb-24">
            <div className="inline-flex items-center gap-3 glass-card rounded-full px-8 py-4 mb-10 border border-primary/20">
              <Cpu className="w-6 h-6 text-primary" />
              <span className="text-sm font-semibold tracking-wide uppercase">Processo Semplificato</span>
            </div>
            <h2 className="text-6xl md:text-7xl font-black mb-10 bg-gradient-to-r from-foreground via-primary to-accent bg-clip-text text-transparent leading-tight">
              Come Funziona SimplyChain
            </h2>
            <p className="text-2xl text-muted-foreground max-w-4xl mx-auto leading-relaxed font-light">
              Tre semplici passaggi per rivoluzionare la tua filiera produttiva
            </p>
          </div>
          
          <div className="grid lg:grid-cols-3 gap-16">
            {/* Step 1 */}
            <div className="group relative">
              <div className="glass-card rounded-4xl p-12 tech-shadow hover:scale-105 smooth-transition border border-accent/10 hover:border-accent/30">
                <div className="relative mb-10">
                  <div className="w-24 h-24 accent-gradient rounded-4xl flex items-center justify-center mx-auto mb-8 pulse-glow group-hover:scale-110 smooth-transition">
                    <span className="text-4xl font-black text-accent-foreground">1</span>
                  </div>
                  <div className="absolute -top-3 -right-3 w-10 h-10 primary-gradient rounded-full opacity-70 animate-bounce"></div>
                  <div className="absolute -bottom-2 -left-2 w-6 h-6 accent-gradient rounded-full opacity-50 animate-pulse"></div>
                </div>
                <h3 className="text-3xl font-bold mb-8 text-center group-hover:text-accent smooth-transition">Registra i Tuoi Prodotti</h3>
                <p className="text-muted-foreground leading-relaxed text-center mb-8 text-lg">
                  Carica le informazioni dei tuoi prodotti nella piattaforma SimplyChain con un processo intuitivo e guidato
                </p>
                <div className="flex justify-center">
                  <div className="w-20 h-2 accent-gradient rounded-full group-hover:w-32 smooth-transition"></div>
                </div>
              </div>
            </div>
            
            {/* Step 2 */}
            <div className="group relative">
              <div className="glass-card rounded-4xl p-12 tech-shadow hover:scale-105 smooth-transition border border-primary/10 hover:border-primary/30">
                <div className="relative mb-10">
                  <div className="w-24 h-24 primary-gradient rounded-4xl flex items-center justify-center mx-auto mb-8 pulse-glow group-hover:scale-110 smooth-transition">
                    <span className="text-4xl font-black text-primary-foreground">2</span>
                  </div>
                  <div className="absolute -top-3 -right-3 w-10 h-10 accent-gradient rounded-full opacity-70 animate-bounce" style={{animationDelay: '0.5s'}}></div>
                  <div className="absolute -bottom-2 -left-2 w-6 h-6 primary-gradient rounded-full opacity-50 animate-pulse"></div>
                </div>
                <h3 className="text-3xl font-bold mb-8 text-center group-hover:text-primary smooth-transition">Traccia il Percorso</h3>
                <p className="text-muted-foreground leading-relaxed text-center mb-8 text-lg">
                  Monitora ogni movimento e trasformazione lungo la supply chain in tempo reale con trasparenza totale
                </p>
                <div className="flex justify-center">
                  <div className="w-20 h-2 primary-gradient rounded-full group-hover:w-32 smooth-transition"></div>
                </div>
              </div>
            </div>
            
            {/* Step 3 */}
            <div className="group relative">
              <div className="glass-card rounded-4xl p-12 tech-shadow hover:scale-105 smooth-transition border border-accent/10 hover:border-accent/30">
                <div className="relative mb-10">
                  <div className="w-24 h-24 accent-gradient rounded-4xl flex items-center justify-center mx-auto mb-8 pulse-glow group-hover:scale-110 smooth-transition">
                    <span className="text-4xl font-black text-accent-foreground">3</span>
                  </div>
                  <div className="absolute -top-3 -right-3 w-10 h-10 primary-gradient rounded-full opacity-70 animate-bounce" style={{animationDelay: '1s'}}></div>
                  <div className="absolute -bottom-2 -left-2 w-6 h-6 accent-gradient rounded-full opacity-50 animate-pulse"></div>
                </div>
                <h3 className="text-3xl font-bold mb-8 text-center group-hover:text-accent smooth-transition">Verifica l'Autenticità</h3>
                <p className="text-muted-foreground leading-relaxed text-center mb-8 text-lg">
                  Consumatori e partner possono verificare istantaneamente l'autenticità di ogni prodotto con un semplice QR code
                </p>
                <div className="flex justify-center">
                  <div className="w-20 h-2 accent-gradient rounded-full group-hover:w-32 smooth-transition"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Security Section */}
      <section className="py-40 bg-gradient-to-b from-background via-card/10 to-background relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-transparent to-accent/5"></div>
        <div className="absolute inset-0 tech-pattern opacity-10"></div>
        <div className="container mx-auto px-6 relative z-10">
          <div className="grid lg:grid-cols-2 gap-24 items-center">
            <div>
              <div className="inline-flex items-center gap-3 glass-card rounded-full px-8 py-4 mb-10 border border-primary/20">
                <Shield className="w-6 h-6 text-primary" />
                <span className="text-sm font-semibold tracking-wide uppercase">Sicurezza Avanzata</span>
              </div>
              
              <h2 className="text-6xl md:text-7xl font-black mb-10 bg-gradient-to-r from-foreground via-primary to-accent bg-clip-text text-transparent leading-tight">
                Sicurezza e Affidabilità
              </h2>
              <p className="text-2xl text-muted-foreground mb-16 leading-relaxed font-light">
                La nostra piattaforma utilizza la tecnologia blockchain più avanzata per garantire 
                l'immutabilità e la sicurezza assoluta dei tuoi dati.
              </p>
              
              <div className="space-y-10">
                <div className="group glass-card rounded-3xl p-10 hover:scale-105 smooth-transition border border-primary/10 hover:border-primary/30">
                  <div className="flex items-start gap-8">
                    <div className="w-20 h-20 primary-gradient rounded-3xl flex items-center justify-center flex-shrink-0 group-hover:scale-110 smooth-transition pulse-glow">
                      <Lock className="w-10 h-10 text-primary-foreground" />
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold mb-4 group-hover:text-primary smooth-transition">Crittografia End-to-End</h3>
                      <p className="text-muted-foreground leading-relaxed text-lg">
                        Tutti i dati sono protetti con crittografia di livello militare e protocolli di sicurezza avanzati
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="group glass-card rounded-3xl p-10 hover:scale-105 smooth-transition border border-accent/10 hover:border-accent/30">
                  <div className="flex items-start gap-8">
                    <div className="w-20 h-20 accent-gradient rounded-3xl flex items-center justify-center flex-shrink-0 group-hover:scale-110 smooth-transition pulse-glow">
                      <Network className="w-10 h-10 text-accent-foreground" />
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold mb-4 group-hover:text-accent smooth-transition">Blockchain Immutabile</h3>
                      <p className="text-muted-foreground leading-relaxed text-lg">
                        Una volta registrati, i dati diventano immutabili e verificabili per sempre sulla blockchain
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="group glass-card rounded-3xl p-10 hover:scale-105 smooth-transition border border-primary/10 hover:border-primary/30">
                  <div className="flex items-start gap-8">
                    <div className="w-20 h-20 primary-gradient rounded-3xl flex items-center justify-center flex-shrink-0 group-hover:scale-110 smooth-transition pulse-glow">
                      <Shield className="w-10 h-10 text-primary-foreground" />
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold mb-4 group-hover:text-primary smooth-transition">Monitoraggio 24/7</h3>
                      <p className="text-muted-foreground leading-relaxed text-lg">
                        Controllo continuo e audit di sicurezza automatici per garantire massima protezione
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="relative">
              <div className="glass-card rounded-5xl p-16 tech-shadow floating-animation border border-primary/10">
                <div className="w-full h-[500px] bg-gradient-to-br from-primary/15 via-accent/10 to-primary/15 rounded-4xl flex items-center justify-center relative overflow-hidden">
                  <div className="absolute inset-0 tech-pattern opacity-20"></div>
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5"></div>
                   <div className="text-center relative z-10 max-w-lg">
                     <div className="w-32 h-32 primary-gradient rounded-4xl flex items-center justify-center mx-auto mb-8 pulse-glow">
                       <FileText className="w-16 h-16 text-primary-foreground" />
                     </div>
                     <div className="text-muted-foreground text-xl leading-relaxed min-h-[200px] flex items-center font-light">
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
              
              {/* Enhanced Floating decorative elements */}
              <div className="absolute -top-12 -right-12 w-40 h-40 accent-gradient rounded-full opacity-15 floating-animation blur-xl"></div>
              <div className="absolute -bottom-12 -left-12 w-48 h-48 primary-gradient rounded-full opacity-10 floating-animation blur-2xl" style={{animationDelay: '3s'}}></div>
              <div className="absolute top-1/2 -right-6 w-20 h-20 accent-gradient rounded-full opacity-20 floating-animation blur-lg" style={{animationDelay: '1.5s'}}></div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-40 bg-gradient-to-b from-card/10 via-card/20 to-card/30 relative overflow-hidden">
        <div className="absolute inset-0 tech-pattern opacity-15"></div>
        <div className="absolute inset-0 bg-gradient-to-r from-primary/8 via-transparent to-accent/8"></div>
        
        <div className="container mx-auto px-6 relative z-10">
          <div className="text-center max-w-6xl mx-auto">
            <div className="inline-flex items-center gap-3 glass-card rounded-full px-8 py-4 mb-12 border border-accent/20">
              <Zap className="w-6 h-6 text-accent" />
              <span className="text-sm font-semibold tracking-wide uppercase">Inizia Subito</span>
            </div>
            
            <h2 className="text-6xl md:text-8xl font-black mb-12 bg-gradient-to-r from-foreground via-primary to-accent bg-clip-text text-transparent leading-tight">
              La Tua Rivoluzione Digitale
            </h2>
            <p className="text-2xl text-muted-foreground mb-20 leading-relaxed max-w-4xl mx-auto font-light">
              Unisciti alle aziende che hanno già scelto SimplyChain per trasformare la loro 
              filiera produttiva. <span className="text-accent font-semibold bg-gradient-to-r from-accent to-accent/80 bg-clip-text text-transparent">Inizia oggi stesso!</span>
            </p>
            
            {/* Enhanced CTA Card */}
            <div className="glass-card rounded-5xl p-20 tech-shadow relative overflow-hidden border border-primary/10">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/8 via-transparent to-accent/8"></div>
              <div className="absolute inset-0 tech-pattern opacity-10"></div>
              
              <div className="relative z-10">
                <button 
                  onClick={handleAuthButtonClick}
                  className="group relative primary-gradient text-3xl px-20 py-10 rounded-4xl tech-shadow smooth-transition hover:scale-105 text-primary-foreground font-black flex items-center gap-6 mx-auto overflow-hidden"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/15 to-transparent -skew-x-12 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div>
                  <span className="relative z-10">Registra la tua Azienda</span>
                  <ArrowRight className="w-8 h-8 group-hover:translate-x-2 smooth-transition relative z-10" />
                </button>
                
                <p className="text-muted-foreground mt-8 text-xl font-medium">
                  Registrazione gratuita • Nessun costo nascosto • Attivazione su verifica
                </p>
                
                {/* Additional benefits */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-16 max-w-4xl mx-auto">
                  <div className="flex items-center gap-4 text-muted-foreground">
                    <CheckCircle className="w-6 h-6 text-accent" />
                    <span className="text-lg">Setup in 5 minuti</span>
                  </div>
                  <div className="flex items-center gap-4 text-muted-foreground">
                    <CheckCircle className="w-6 h-6 text-accent" />
                    <span className="text-lg">Supporto dedicato</span>
                  </div>
                  <div className="flex items-center gap-4 text-muted-foreground">
                    <CheckCircle className="w-6 h-6 text-accent" />
                    <span className="text-lg">Integrazione facile</span>
                  </div>
                </div>
              </div>
              
              {/* Enhanced Decorative elements */}
              <div className="absolute top-12 left-12 w-24 h-24 primary-gradient rounded-full opacity-20 floating-animation blur-lg"></div>
              <div className="absolute bottom-12 right-12 w-32 h-32 accent-gradient rounded-full opacity-15 floating-animation blur-xl" style={{animationDelay: '2s'}}></div>
              <div className="absolute top-1/2 left-8 w-16 h-16 primary-gradient rounded-full opacity-25 floating-animation blur-md" style={{animationDelay: '4s'}}></div>
              <div className="absolute top-1/4 right-16 w-20 h-20 accent-gradient rounded-full opacity-20 floating-animation blur-lg" style={{animationDelay: '6s'}}></div>
            </div>
          </div>
        </div>
      </section>
      </div>

      {/* Footer */}
      <footer className="bg-gradient-to-b from-card/30 via-card/50 to-card/70 border-t border-border/30 py-24 relative overflow-hidden">
        <div className="absolute inset-0 tech-pattern opacity-5"></div>
        <div className="absolute inset-0 bg-gradient-to-r from-primary/3 via-transparent to-accent/3"></div>
        <div className="container mx-auto px-6 relative z-10">
          <div className="grid md:grid-cols-4 gap-16">
            {/* Brand */}
            <div className="col-span-2">
              <div className="flex items-center gap-4 mb-8">
                <div className="w-16 h-16 primary-gradient rounded-3xl flex items-center justify-center pulse-glow">
                  <Network className="w-8 h-8 text-primary-foreground" />
                </div>
                <h3 className="text-4xl font-black bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
                  SimplyChain
                </h3>
              </div>
              <p className="text-muted-foreground mb-10 max-w-lg text-xl leading-relaxed font-light">
                La rivoluzione blockchain per la certificazione delle filiere produttive italiane. 
                Semplice, sicura, innovativa.
              </p>
              <div className="glass-card rounded-3xl p-8 tech-shadow border border-primary/10">
                <h4 className="font-bold mb-4 text-xl">Proprietario del servizio:</h4>
                <div className="flex items-center gap-4 mb-3">
                  <div className="w-10 h-10 accent-gradient rounded-2xl flex items-center justify-center">
                    <Globe className="w-5 h-5 text-accent-foreground" />
                  </div>
                  <p className="text-accent font-bold text-xl">SFY srl</p>
                </div>
                <p className="text-muted-foreground text-lg">
                  📧 sfy.startup@gmail.com
                </p>
              </div>
            </div>
            
            {/* Links */}
            <div>
              <h4 className="font-bold mb-8 text-xl">Contatti</h4>
              <ul className="space-y-6">
                <li>
                  <Link to="/contatti" className="text-muted-foreground hover:text-primary smooth-transition flex items-center gap-3 group text-lg">
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 smooth-transition" />
                    Contatti
                  </Link>
                </li>
              </ul>
            </div>
            
            {/* Legal */}
            <div>
              <h4 className="font-bold mb-8 text-xl">Informazioni Legali</h4>
              <ul className="space-y-6">
                <li>
                  <Link to="/privacy" className="text-muted-foreground hover:text-primary smooth-transition flex items-center gap-3 group text-lg">
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 smooth-transition" />
                    Privacy Policy
                  </Link>
                </li>
                <li>
                  <Link to="/terms" className="text-muted-foreground hover:text-primary smooth-transition flex items-center gap-3 group text-lg">
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 smooth-transition" />
                    Termini di Servizio
                  </Link>
                </li>
                <li>
                  <Link to="/cookies" className="text-muted-foreground hover:text-primary smooth-transition flex items-center gap-3 group text-lg">
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 smooth-transition" />
                    Cookie Policy
                  </Link>
                </li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-border/30 mt-20 pt-12">
            <div className="flex flex-col md:flex-row justify-between items-center gap-6">
              <p className="text-muted-foreground text-center md:text-left text-lg">
                &copy; 2024 SFY srl. Tutti i diritti riservati.
              </p>
              <div className="flex items-center gap-3">
                <span className="text-muted-foreground text-lg">Powered by</span>
                <a href="https://polygon.technology/" target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 glass-card rounded-full px-6 py-3 hover:scale-105 smooth-transition border border-primary/20">
                  <Network className="w-5 h-5 text-primary" />
                  <span className="text-primary font-bold text-lg">Polygon</span>
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
                title="SimplyChain Video"
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
