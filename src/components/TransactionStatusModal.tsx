import React from 'react';

// Definiamo le proprietà che il componente accetterà
interface Props {
  status: 'loading' | 'success' | 'error';
  message: string;
  onClose: () => void; // Funzione per chiudere il popup
}

const TransactionStatusModal = ({ status, message, onClose }: Props) => {
  
  // Funzione per renderizzare l'icona corretta in base allo stato
  const renderIcon = () => {
    switch (status) {
      case 'loading':
        return (
          <div className="flex justify-center items-center">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-transparent border-t-purple-500 border-r-purple-500"></div>
          </div>
        );
      case 'success':
        return (
          <div className="flex justify-center items-center">
            <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
          </div>
        );
      case 'error':
        return (
          <div className="flex justify-center items-center">
            <div className="w-12 h-12 bg-red-500 rounded-full flex items-center justify-center">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-slate-800/95 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-8 max-w-md w-full text-center shadow-2xl">
        {renderIcon()}
        <p className="text-slate-200 text-lg font-medium mt-4 mb-6">{message}</p>
        
        {/* Mostra il pulsante "OK" solo se la transazione non è più in caricamento */}
        {status !== 'loading' && (
          <button 
            onClick={onClose} 
            className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-semibold px-6 py-3 rounded-xl transition-all duration-200 hover:scale-105 shadow-lg"
          >
            OK
          </button>
        )}
      </div>
    </div>
  );
};

export default TransactionStatusModal;
