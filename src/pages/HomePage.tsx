import { Link } from "react-router-dom";
import { ShieldCheck, Zap, Users, ArrowRight } from 'lucide-react';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Hero Section */}
      <section className="relative bg-background">
        <div className="absolute inset-0 hero-gradient opacity-20"></div>
        <div className="container mx-auto px-6 py-24 md:py-32 text-center relative z-10">
          <h1 className="text-4xl md:text-6xl font-extrabold mb-4 leading-tight">
            <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              EasyChain:
            </span> La Tracciabilità Blockchain, Semplificata.
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto mb-8">
            Certifica la tua filiera produttiva con la potenza e la sicurezza della blockchain Polygon.
            Pensato per le aziende italiane che guardano al futuro.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/azienda">
              <button className="w-full sm:w-auto primary-gradient text-lg px-8 py-3 rounded-lg text-primary-foreground font-semibold shadow-lg hover:shadow-primary/40 transition-all duration-300 transform hover:scale-105">
                Inizia Ora
              </button>
            </Link>
            <Link to="/contatti">
              <button className="w-full sm:w-auto bg-secondary text-secondary-foreground px-8 py-3 rounded-lg font-semibold hover:bg-secondary/80 transition-colors duration-300">
                Richiedi una Demo
              </button>
            </Link>
          </div>
          <div className="mt-12 text-sm text-muted-foreground">
            <span>50 Crediti gratuiti all'iscrizione</span>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-secondary/20">
        <div className="container mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold">Perché Scegliere EasyChain?</h2>
            <p className="text-muted-foreground mt-4 max-w-2xl mx-auto">
              Offriamo una soluzione completa che unisce semplicità d'uso e tecnologia all'avanguardia.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-card p-6 rounded-xl shadow-md hover:shadow-lg transition-shadow">
              <div className="flex items-center justify-center h-12 w-12 rounded-full bg-primary/10 text-primary mb-4">
                <Zap size={24} />
              </div>
              <h3 className="text-xl font-semibold mb-2">Semplice e Veloce</h3>
              <p className="text-muted-foreground">
                Registra i tuoi prodotti e traccia la filiera in pochi click, senza bisogno di competenze tecniche.
              </p>
            </div>
            <div className="bg-card p-6 rounded-xl shadow-md hover:shadow-lg transition-shadow">
              <div className="flex items-center justify-center h-12 w-12 rounded-full bg-primary/10 text-primary mb-4">
                <ShieldCheck size={24} />
              </div>
              <h3 className="text-xl font-semibold mb-2">Sicurezza Immutabile</h3>
              <p className="text-muted-foreground">
                Sfrutta la blockchain Polygon per garantire che i dati siano permanenti, trasparenti e a prova di manomissione.
              </p>
            </div>
            <div className="bg-card p-6 rounded-xl shadow-md hover:shadow-lg transition-shadow">
              <div className="flex items-center justify-center h-12 w-12 rounded-full bg-primary/10 text-primary mb-4">
                <Users size={24} />
              </div>
              <h3 className="text-xl font-semibold mb-2">Per le Aziende Italiane</h3>
              <p className="text-muted-foreground">
                Una piattaforma pensata per le esigenze del mercato italiano, con supporto dedicato e conforme alle normative.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20">
        <div className="container mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold">Come Funziona</h2>
            <p className="text-muted-foreground mt-4 max-w-2xl mx-auto">
              Tre passaggi per portare la tua filiera sulla blockchain.
            </p>
          </div>
          <div className="relative">
            <div className="hidden md:block absolute top-1/2 left-0 w-full h-0.5 bg-border -translate-y-1/2"></div>
            <div className="grid md:grid-cols-3 gap-12 relative">
              <div className="text-center">
                <div className="relative mb-4">
                  <div className="w-16 h-16 bg-primary text-primary-foreground rounded-full flex items-center justify-center mx-auto text-2xl font-bold">1</div>
                </div>
                <h3 className="text-xl font-semibold mb-2">Registra</h3>
                <p className="text-muted-foreground">
                  Crea un profilo per la tua azienda e registra i prodotti che vuoi certificare.
                </p>
              </div>
              <div className="text-center">
                <div className="relative mb-4">
                  <div className="w-16 h-16 bg-primary text-primary-foreground rounded-full flex items-center justify-center mx-auto text-2xl font-bold">2</div>
                </div>
                <h3 className="text-xl font-semibold mb-2">Traccia</h3>
                <p className="text-muted-foreground">
                  Aggiungi passaggi alla filiera produttiva, dal produttore al consumatore finale.
                </p>
              </div>
              <div className="text-center">
                <div className="relative mb-4">
                  <div className="w-16 h-16 bg-primary text-primary-foreground rounded-full flex items-center justify-center mx-auto text-2xl font-bold">3</div>
                </div>
                <h3 className="text-xl font-semibold mb-2">Verifica</h3>
                <p className="text-muted-foreground">
                  I consumatori scansionano un QR code per visualizzare la storia del prodotto su blockchain.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-secondary/20">
        <div className="container mx-auto px-6">
          <div className="bg-card rounded-xl p-8 md:p-12 shadow-lg">
            <div className="grid md:grid-cols-2 gap-8 items-center">
              <div>
                <h2 className="text-3xl md:text-4xl font-bold mb-4">Pronto a Innovare?</h2>
                <p className="text-muted-foreground text-lg mb-6">
                  Unisciti alle aziende che stanno già costruendo fiducia con i loro clienti.
                  Registrati ora e ricevi 50 crediti per iniziare a certificare i tuoi prodotti.
                </p>
                <Link to="/azienda">
                  <button className="primary-gradient text-lg px-8 py-3 rounded-lg text-primary-foreground font-semibold shadow-lg hover:shadow-primary/40 transition-all duration-300 transform hover:scale-105 flex items-center gap-2">
                    <span>Registra la tua Azienda</span>
                    <ArrowRight size={20} />
                  </button>
                </Link>
              </div>
              <div className="hidden md:block">
                <img src="/path-to-your-image.svg" alt="Blockchain illustration" className="w-full h-auto" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-card/50 border-t border-border/50 py-12">
        <div className="container mx-auto px-6">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <h3 className="text-xl font-bold mb-2">EasyChain</h3>
              <p className="text-muted-foreground text-sm">
                Tracciabilità di filiera semplice e sicura.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Piattaforma</h4>
              <ul className="space-y-2 text-sm">
                <li><Link to="/azienda" className="text-muted-foreground hover:text-primary">Accesso Aziende</Link></li>
                <li><Link to="/admin" className="text-muted-foreground hover:text-primary">Accesso Admin</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Risorse</h4>
              <ul className="space-y-2 text-sm">
                <li><Link to="/contatti" className="text-muted-foreground hover:text-primary">Contatti</Link></li>
                <li><Link to="/faq" className="text-muted-foreground hover:text-primary">FAQ</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Legale</h4>
              <ul className="space-y-2 text-sm">
                <li><Link to="/privacy" className="text-muted-foreground hover:text-primary">Privacy Policy</Link></li>
                <li><Link to="/terms" className="text-muted-foreground hover:text-primary">Termini di Servizio</Link></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-border/50 pt-8 text-center text-sm text-muted-foreground">
            <p>&copy; 2024 SFY srl. Tutti i diritti riservati. Powered by Polygon.</p>
            <p className="mt-2">Email: <a href="mailto:sfy.startup@gmail.com" className="hover:text-primary">sfy.startup@gmail.com</a></p>
          </div>
        </div>
      </footer>
    </div>
  );
}