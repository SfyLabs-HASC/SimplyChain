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
            <Link 
              to="/cookie-policy" 
              className="text-slate-400 hover:text-white transition-colors text-sm"
            >
              Cookie Policy
            </Link>
          </div>
          
          {/* Powered by */}
          <a
            href="https://polygon.technology/"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center space-x-2 text-sm text-purple-300 hover:text-purple-200 transition-colors"
          >
            <span className="inline-flex items-center justify-center w-6 h-6 rounded-md bg-gradient-to-r from-purple-600 to-fuchsia-500">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
                <path d="M14.9 7.4l-2.9-1.7c-.3-.2-.8-.2-1.1 0L8 7.4c-.3.2-.6.6-.6 1v3.3c0 .4.2.8.6 1l2.9 1.7c.3.2.8.2 1.1 0l2.9-1.7c.3-.2.6-.6.6-1V8.4c0-.4-.2-.8-.6-1zM11.4 6l2.6 1.5-2.6 1.5L8.8 7.5 11.4 6zm-2.6 6.5V9.9l2.6 1.5v2.6l-2.6-1.5zm3.7 1.1V11l2.6-1.5v2.6l-2.6 1.5z" />
              </svg>
            </span>
            <span>Powered by Polygon</span>
          </a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;