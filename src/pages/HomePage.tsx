import { Link } from "react-router-dom";
import { FilePlus2, GitBranchPlus, ShieldCheck, KeyRound, Link as LinkIcon, ShieldAlert, Shield, Lock } from 'lucide-react';
import { HeroBackground } from "../components/HeroBackground";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        <HeroBackground />
        
        {/* Content */}
        <div className="relative z-10 container mx-auto px-6 text-center">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent leading-tight">
              Benvenuto su Easy Chain
            </h1>
            <p className="text-xl md:text-2xl text-muted-foreground mb-8 max-w-3xl mx-auto leading-relaxed">
              La soluzione semplice e sicura per certificare la tua filiera produttiva su blockchain. 
              Per aziende italiane che vogliono innovare senza complessità.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
              <Link to="/azienda">
                <button className="primary-gradient text-lg px-8 py-4 rounded-xl blockchain-glow smooth-transition hover:scale-105 text-primary-foreground font-semibold">
                  ISCRIVITI / ACCEDI
                </button>
              </Link>
            </div>
            
            <div className="glass-card rounded-2xl p-6 max-w-2xl mx-auto">
              <div className="flex flex-col sm:flex-row items-center justify-center gap-6 text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-accent rounded-full animate-pulse"></div>
                  <span>50 Crediti Gratuiti</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-primary rounded-full animate-pulse"></div>
                  <span>Blockchain Polygon</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-accent rounded-full animate-pulse"></div>
                  <span>Sicurezza Garantita</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Process Section */}
      <section className="py-24 bg-background">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              Come Funziona EasyChain
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              Tre semplici passaggi per certificare la tua filiera produttiva su blockchain
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="glass-card rounded-3xl p-8 mb-6 smooth-transition hover:blockchain-glow">
                <FilePlus2 className="w-16 h-16 text-accent mx-auto mb-6" strokeWidth={1.5} />
                <h3 className="text-2xl font-semibold mb-4">Registra i Tuoi Prodotti</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Carica le informazioni dei tuoi prodotti nella piattaforma EasyChain
                </p>
              </div>
            </div>
            
            <div className="text-center">
              <div className="glass-card rounded-3xl p-8 mb-6 smooth-transition hover:blockchain-glow">
                <GitBranchPlus className="w-16 h-16 text-primary mx-auto mb-6" strokeWidth={1.5} />
                <h3 className="text-2xl font-semibold mb-4">Traccia il Percorso</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Monitora ogni movimento e trasformazione lungo la supply chain
                </p>
              </div>
            </div>
            
            <div className="text-center">
              <div className="glass-card rounded-3xl p-8 mb-6 smooth-transition hover:blockchain-glow">
                <ShieldCheck className="w-16 h-16 text-accent mx-auto mb-6" strokeWidth={1.5} />
                <h3 className="text-2xl font-semibold mb-4">Verifica l'Autenticità</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Consumatori e partner possono verificare istantaneamente ogni prodotto
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Security Section */}
      <section className="py-24 bg-card/30">
        <div className="container mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-4xl md:text-5xl font-bold mb-6">
                Sicurezza e Affidabilità
              </h2>
              <p className="text-xl text-muted-foreground mb-12 leading-relaxed">
                La nostra piattaforma utilizza la tecnologia blockchain più avanzata per garantire 
                l'immutabilità e la sicurezza dei tuoi dati.
              </p>
              
              <div className="space-y-6">
                <div className="glass-card rounded-xl p-6 smooth-transition hover:blockchain-glow">
                  <div className="flex items-start gap-4">
                    <div className="p-2 bg-primary/10 rounded-lg">
                      <KeyRound className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold mb-2">Crittografia End-to-End</h3>
                      <p className="text-muted-foreground">
                        Tutti i dati sono protetti con crittografia di livello militare
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="glass-card rounded-xl p-6 smooth-transition hover:blockchain-glow">
                  <div className="flex items-start gap-4">
                    <div className="p-2 bg-primary/10 rounded-lg">
                      <LinkIcon className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold mb-2">Blockchain Immutabile</h3>
                      <p className="text-muted-foreground">
                        Una volta registrati, i dati non possono essere modificati o cancellati
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="glass-card rounded-xl p-6 smooth-transition hover:blockchain-glow">
                  <div className="flex items-start gap-4">
                    <div className="p-2 bg-primary/10 rounded-lg">
                      <ShieldAlert className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold mb-2">Audit Continuo</h3>
                      <p className="text-muted-foreground">
                        Monitoraggio 24/7 e audit di sicurezza regolari
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="relative">
              <div className="glass-card rounded-3xl p-8 blockchain-glow">
                <div className="w-full h-80 bg-gradient-to-br from-primary/10 via-accent/5 to-primary/10 rounded-2xl flex items-center justify-center p-4">
                  <div className="relative w-64 h-64 text-primary">
                    <Shield className="absolute top-0 left-0 w-full h-full opacity-10 animate-pulse" strokeWidth={1} />
                    <GitBranchPlus className="absolute w-48 h-48 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-accent opacity-50" strokeWidth={1} />
                    <Lock className="absolute w-24 h-24 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-primary" strokeWidth={1.5} />
                  </div>
                </div>
              </div>
              <div className="absolute -top-6 -right-6 w-24 h-24 accent-gradient rounded-full opacity-20 animate-pulse"></div>
              <div className="absolute -bottom-6 -left-6 w-32 h-32 primary-gradient rounded-full opacity-20 animate-pulse"></div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-background">
        <div className="container mx-auto px-6">
          <div className="text-center max-w-4xl mx-auto">
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              Inizia la Tua Trasformazione Digitale
            </h2>
            <p className="text-xl text-muted-foreground mb-12 leading-relaxed">
              Unisciti alle aziende che hanno già scelto EasyChain per certificare la loro 
              filiera produttiva. Inizia oggi stesso con 50 crediti gratuiti!
            </p>
            
            <div className="glass-card rounded-3xl p-12 blockchain-glow">
              <div className="grid md:grid-cols-3 gap-8 mb-12">
                <div className="text-center">
                  <div className="text-3xl font-bold text-primary mb-2">50+</div>
                  <div className="text-muted-foreground">Crediti Gratuiti</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-accent mb-2">100%</div>
                  <div className="text-muted-foreground">Sicuro</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-primary mb-2">24/7</div>
                  <div className="text-muted-foreground">Supporto</div>
                </div>
              </div>
              
              <Link to="/azienda">
                <button className="primary-gradient text-xl px-12 py-6 rounded-2xl blockchain-glow smooth-transition hover:scale-105 text-primary-foreground font-semibold">
                  Registra la tua Azienda
                </button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-card/50 border-t border-border/50 py-16">
        <div className="container mx-auto px-6">
          <div className="grid md:grid-cols-4 gap-8">
            {/* Brand */}
            <div className="col-span-2">
              <h3 className="text-2xl font-bold mb-4 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                EasyChain
              </h3>
              <p className="text-muted-foreground mb-6 max-w-md">
                La soluzione blockchain semplice e sicura per la certificazione 
                della filiera produttiva delle aziende italiane.
              </p>
              <div className="glass-card rounded-xl p-4">
                <h4 className="font-semibold mb-2">Proprietario del servizio:</h4>
                <p className="text-accent font-semibold">SFY srl</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Email: sfy.startup@gmail.com
                </p>
              </div>
            </div>
            
            {/* Links */}
            <div>
              <h4 className="font-semibold mb-4">Piattaforma</h4>
              <ul className="space-y-2 text-muted-foreground">
                <li><Link to="/azienda" className="hover:text-primary smooth-transition">Accesso Aziende</Link></li>
                <li><Link to="/contatti" className="hover:text-primary smooth-transition">Contatti</Link></li>
              </ul>
            </div>
            
            {/* Legal */}
            <div>
              <h4 className="font-semibold mb-4">Legale</h4>
              <ul className="space-y-2 text-muted-foreground">
                <li><Link to="/privacy" className="hover:text-primary smooth-transition">Privacy Policy</Link></li>
                <li><Link to="/terms" className="hover:text-primary smooth-transition">Termini di Servizio</Link></li>
                <li><Link to="/cookies" className="hover:text-primary smooth-transition">Cookie Policy</Link></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-border/50 mt-12 pt-8 text-center text-muted-foreground">
            <p>&copy; 2024 SFY srl. Tutti i diritti riservati. Powered by blockchain Polygon.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}