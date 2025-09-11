import React, { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useActiveAccount } from "thirdweb/react";

interface BatchData {
  name: string;
  description: string;
  date: string;
  location: string;
  imageHash?: string;
}

interface StepData {
  order: number;
  title: string;
  description: string;
  location: string;
  date: string;
  imageHash?: string;
  metadata?: string;
}

interface CSVData {
  batch: BatchData;
  steps: StepData[];
}

const CSVImportPage: React.FC = () => {
  const navigate = useNavigate();
  const account = useActiveAccount();
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [parsedData, setParsedData] = useState<CSVData[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPreview, setShowPreview] = useState(false);

  // Template CSV per download
  const downloadTemplate = () => {
    const template = `# BATCH HEADER - Una riga per batch
batch_name,batch_description,batch_date,batch_location,batch_image_hash
Lotto Pomodori Bio 2024,Produzione biologica certificata estate 2024,2024-08-15,Sicilia - Campo A,

# STEPS DATA - Una riga per ogni step del batch
step_order,step_title,step_description,step_location,step_date,step_image_hash,step_metadata
1,Semina,Semina dei semi biologici certificati,Campo A - Sicilia,2024-03-15,,"{""temperature"":""18°C"",""humidity"":""65%""}"
2,Crescita,Monitoraggio crescita piante,Campo A - Sicilia,2024-05-20,,"{""fertilizer"":""bio"",""irrigation"":""goccia""}"
3,Raccolta,Raccolta manuale dei frutti maturi,Campo A - Sicilia,2024-08-15,,"{""quality"":""A+"",""weight"":""500kg""}"

# ISTRUZIONI:
# 1. Mantenere l'ordine delle colonne
# 2. Date formato: YYYY-MM-DD
# 3. step_order: numeri progressivi (1,2,3...)
# 4. step_metadata: JSON valido (opzionale)
# 5. Rimuovere righe commento (che iniziano con #)
`;
    
    const blob = new Blob([template], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', 'supply_chain_template.csv');
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Parse CSV file
  const parseCSV = useCallback((text: string): CSVData[] => {
    const lines = text.split('\n').filter(line => 
      line.trim() && !line.startsWith('#')
    );
    
    if (lines.length < 2) {
      throw new Error('CSV deve contenere almeno header e una riga dati');
    }

    // Trova header batch
    const batchHeaderIndex = lines.findIndex(line => 
      line.includes('batch_name')
    );
    
    // Trova header steps  
    const stepsHeaderIndex = lines.findIndex(line => 
      line.includes('step_order')
    );

    if (batchHeaderIndex === -1 || stepsHeaderIndex === -1) {
      throw new Error('CSV deve contenere sia sezione BATCH che STEPS');
    }

    const results: CSVData[] = [];

    // Parse batch data
    const batchHeaders = lines[batchHeaderIndex].split(',');
    const batchDataLine = lines[batchHeaderIndex + 1];
    
    if (batchDataLine) {
      const batchValues = batchDataLine.split(',');
      const batch: BatchData = {
        name: batchValues[0] || '',
        description: batchValues[1] || '',
        date: batchValues[2] || '',
        location: batchValues[3] || '',
        imageHash: batchValues[4] || undefined
      };

      // Parse steps data
      const stepsHeaders = lines[stepsHeaderIndex].split(',');
      const steps: StepData[] = [];
      
      for (let i = stepsHeaderIndex + 1; i < lines.length; i++) {
        const stepValues = lines[i].split(',');
        if (stepValues.length >= 5) {
          steps.push({
            order: parseInt(stepValues[0]) || 0,
            title: stepValues[1] || '',
            description: stepValues[2] || '',
            location: stepValues[3] || '',
            date: stepValues[4] || '',
            imageHash: stepValues[5] || undefined,
            metadata: stepValues[6] || undefined
          });
        }
      }

      results.push({ batch, steps });
    }

    return results;
  }, []);

  // Handle file upload
  const handleFileUpload = useCallback((file: File) => {
    setCsvFile(file);
    setError(null);
    setIsLoading(true);

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const text = e.target?.result as string;
        const parsed = parseCSV(text);
        setParsedData(parsed);
        setShowPreview(true);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Errore parsing CSV');
      } finally {
        setIsLoading(false);
      }
    };
    
    reader.readAsText(file);
  }, [parseCSV]);

  // Handle drag & drop
  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const files = Array.from(e.dataTransfer.files);
    const csvFile = files.find(file => 
      file.type === 'text/csv' || file.name.endsWith('.csv')
    );
    
    if (csvFile) {
      handleFileUpload(csvFile);
    } else {
      setError('Per favore carica un file CSV valido');
    }
  }, [handleFileUpload]);

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  }, []);

  // Import data to blockchain
  const handleImport = async () => {
    if (!account || parsedData.length === 0) return;
    
    setIsLoading(true);
    try {
      // TODO: Implementare chiamata smart contract
      console.log('Importing data:', parsedData);
      
      // Simulazione per ora
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Redirect to main page
      navigate('/azienda');
    } catch (err) {
      setError('Errore durante l\'importazione');
    } finally {
      setIsLoading(false);
    }
  };

  if (!account) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white mb-4">
            Connetti il Wallet
          </h1>
          <p className="text-gray-400">
            Devi connettere il wallet per importare dati CSV
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 p-6">
      <div className="max-w-6xl mx-auto">
        
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">
              🚀 Importazione CSV Supply Chain
            </h1>
            <p className="text-gray-400">
              Carica dati in blocco per batch e step della filiera
            </p>
          </div>
          
          <div className="flex gap-4">
            <button
              onClick={downloadTemplate}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition"
            >
              📥 Scarica Template
            </button>
            
            <button
              onClick={() => navigate('/azienda')}
              className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg transition"
            >
              ← Torna Indietro
            </button>
          </div>
        </div>

        {/* Upload Area */}
        {!showPreview && (
          <div className="bg-gray-800 rounded-2xl p-8 mb-8 border-2 border-dashed border-gray-600">
            <div
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              className="text-center py-12"
            >
              <div className="text-6xl mb-4">📄</div>
              <h3 className="text-xl font-semibold text-white mb-2">
                Trascina il file CSV qui
              </h3>
              <p className="text-gray-400 mb-4">
                oppure clicca per selezionare
              </p>
              
              <input
                type="file"
                accept=".csv"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleFileUpload(file);
                }}
                className="hidden"
                id="csv-upload"
              />
              
              <label
                htmlFor="csv-upload"
                className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg cursor-pointer transition inline-block"
              >
                Seleziona File CSV
              </label>
            </div>
          </div>
        )}

        {/* Error Display */}
        {error && (
          <div className="bg-red-900/50 border border-red-500 rounded-lg p-4 mb-6">
            <div className="flex items-center">
              <span className="text-red-400 text-xl mr-3">⚠️</span>
              <div>
                <h4 className="text-red-300 font-semibold">Errore</h4>
                <p className="text-red-200">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Loading */}
        {isLoading && (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <p className="text-gray-400">Elaborazione in corso...</p>
          </div>
        )}

        {/* Preview */}
        {showPreview && parsedData.length > 0 && (
          <div className="space-y-6">
            {parsedData.map((data, index) => (
              <div key={index} className="bg-gray-800 rounded-2xl p-6">
                
                {/* Batch Info */}
                <div className="mb-6">
                  <h3 className="text-xl font-semibold text-white mb-4 flex items-center">
                    📦 Batch: {data.batch.name}
                  </h3>
                  
                  <div className="grid md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-400">Descrizione:</span>
                      <p className="text-white">{data.batch.description}</p>
                    </div>
                    <div>
                      <span className="text-gray-400">Data:</span>
                      <p className="text-white">{data.batch.date}</p>
                    </div>
                    <div>
                      <span className="text-gray-400">Luogo:</span>
                      <p className="text-white">{data.batch.location}</p>
                    </div>
                    <div>
                      <span className="text-gray-400">Steps:</span>
                      <p className="text-white">{data.steps.length} steps</p>
                    </div>
                  </div>
                </div>

                {/* Steps Table */}
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-gray-700">
                        <th className="text-left py-3 px-2 text-gray-400">#</th>
                        <th className="text-left py-3 px-2 text-gray-400">Titolo</th>
                        <th className="text-left py-3 px-2 text-gray-400">Descrizione</th>
                        <th className="text-left py-3 px-2 text-gray-400">Luogo</th>
                        <th className="text-left py-3 px-2 text-gray-400">Data</th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.steps.map((step, stepIndex) => (
                        <tr key={stepIndex} className="border-b border-gray-700/50">
                          <td className="py-3 px-2 text-white">{step.order}</td>
                          <td className="py-3 px-2 text-white">{step.title}</td>
                          <td className="py-3 px-2 text-gray-300 max-w-xs truncate">
                            {step.description}
                          </td>
                          <td className="py-3 px-2 text-gray-300">{step.location}</td>
                          <td className="py-3 px-2 text-gray-300">{step.date}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ))}

            {/* Action Buttons */}
            <div className="flex justify-center gap-4 pt-6">
              <button
                onClick={() => {
                  setShowPreview(false);
                  setParsedData([]);
                  setCsvFile(null);
                }}
                className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-3 rounded-lg transition"
              >
                🔄 Carica Altro File
              </button>
              
              <button
                onClick={handleImport}
                disabled={isLoading}
                className="bg-green-600 hover:bg-green-700 disabled:bg-gray-600 text-white px-8 py-3 rounded-lg transition font-semibold"
              >
                {isLoading ? 'Importazione...' : '✅ Conferma Importazione'}
              </button>
            </div>
          </div>
        )}

        {/* Instructions */}
        <div className="mt-12 bg-gray-800 rounded-2xl p-6">
          <h3 className="text-lg font-semibold text-white mb-4">
            📋 Come funziona:
          </h3>
          
          <div className="grid md:grid-cols-2 gap-6 text-sm">
            <div>
              <h4 className="text-blue-400 font-semibold mb-2">1. Scarica Template</h4>
              <p className="text-gray-300">
                Usa il template CSV per strutturare i tuoi dati correttamente
              </p>
            </div>
            
            <div>
              <h4 className="text-blue-400 font-semibold mb-2">2. Compila Dati</h4>
              <p className="text-gray-300">
                Inserisci informazioni batch e steps seguendo il formato
              </p>
            </div>
            
            <div>
              <h4 className="text-blue-400 font-semibold mb-2">3. Carica File</h4>
              <p className="text-gray-300">
                Trascina o seleziona il CSV compilato per l'anteprima
              </p>
            </div>
            
            <div>
              <h4 className="text-blue-400 font-semibold mb-2">4. Conferma Import</h4>
              <p className="text-gray-300">
                Verifica i dati e conferma per creare batch e steps
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CSVImportPage;