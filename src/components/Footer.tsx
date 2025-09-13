import React from 'react';
import { Link } from 'react-router-dom';

const Footer: React.FC = () => {
  return (
    <footer className="bg-slate-900 border-t border-slate-700 py-8 mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
          {/* Copyright */}
          <div className="text-slate-400 text-sm">
            © 2024 SFY srl. Tutti i diritti riservati.
          </div>
          
          {/* Links */}
          <div className="flex space-x-6">
            <Link 
              to="/privacy-policy" 
              className="text-slate-400 hover:text-white transition-colors text-sm"
            >
              Privacy Policy
            </Link>
            <Link 
              to="/terms-conditions" 
              className="text-slate-400 hover:text-white transition-colors text-sm"
            >
              Termini e Condizioni
            </Link>
          </div>
          
          {/* Powered by */}
          <div className="flex items-center space-x-2 text-slate-400 text-sm">
            <span>Powered by</span>
            <span className="font-semibold text-white">Polygon</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;