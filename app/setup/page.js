'use client';

import { useState, useEffect } from 'react';
import Button from '../../components/ui/Button';

export default function SetupPage() {
  const [status, setStatus] = useState('idle');
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const checkDatabase = async () => {
    setStatus('checking');
    try {
      const response = await fetch('/api/setup');
      const data = await response.json();
      setResult(data);
      setError(null);
    } catch (err) {
      setError(err.message);
      setResult(null);
    } finally {
      setStatus('idle');
    }
  };

  const setupDatabase = async () => {
    setStatus('setting-up');
    try {
      const response = await fetch('/api/setup', { method: 'POST' });
      const data = await response.json();
      setResult(data);
      setError(null);
    } catch (err) {
      setError(err.message);
      setResult(null);
    } finally {
      setStatus('idle');
    }
  };

  useEffect(() => {
    checkDatabase();
  }, []);

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Database Setup</h1>
        
        <div className="bg-gray-800 rounded-lg p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Database Status</h2>
          
          {status === 'checking' && (
            <p className="text-blue-400">Checking database connection...</p>
          )}
          
          {status === 'setting-up' && (
            <p className="text-yellow-400">Setting up database...</p>
          )}
          
          {error && (
            <div className="bg-red-900/50 p-4 rounded mb-4">
              <h3 className="font-bold text-red-300">Error</h3>
              <p className="text-red-200">{error}</p>
            </div>
          )}
          
          {result && (
            <div className="space-y-4">
              <div className="bg-gray-700/50 p-4 rounded">
                <h3 className="font-bold">Connection Status</h3>
                <p className={result.success ? 'text-green-400' : 'text-red-400'}>
                  {result.success ? '✓ Connected' : '✗ Connection Failed'}
                </p>
                
                {result.connected !== undefined && (
                  <p>Connected: {result.connected ? 'Yes' : 'No'}</p>
                )}
                
                {result.tables && (
                  <div className="mt-2">
                    <h4 className="font-medium">Tables:</h4>
                    <ul className="list-disc pl-5 mt-1">
                      {result.tables.map((table, index) => (
                        <li key={index} className="text-sm">{table}</li>
                      ))}
                    </ul>
                  </div>
                )}
                
                {result.projectTableExists !== undefined && (
                  <p className="mt-2">
                    Project Table Exists: {result.projectTableExists ? 'Yes' : 'No'}
                  </p>
                )}
              </div>
              
              {result.output && (
                <div className="bg-gray-700/50 p-4 rounded">
                  <h3 className="font-bold">Output</h3>
                  <pre className="text-xs mt-2 whitespace-pre-wrap">{result.output}</pre>
                </div>
              )}
              
              {result.migrateError && (
                <div className="bg-red-900/50 p-4 rounded">
                  <h3 className="font-bold">Migration Error</h3>
                  <p className="text-sm">{result.migrateError}</p>
                </div>
              )}
              
              {result.pushError && (
                <div className="bg-red-900/50 p-4 rounded">
                  <h3 className="font-bold">Push Error</h3>
                  <p className="text-sm">{result.pushError}</p>
                </div>
              )}
            </div>
          )}
        </div>
        
        <div className="flex gap-4">
          <Button 
            onClick={checkDatabase} 
            disabled={status !== 'idle'}
            className="bg-blue-600 hover:bg-blue-700"
          >
            Check Database
          </Button>
          
          <Button 
            onClick={setupDatabase} 
            disabled={status !== 'idle'}
            className="bg-green-600 hover:bg-green-700"
          >
            Setup Database
          </Button>
        </div>
        
        <div className="mt-8 bg-gray-800 rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Manual Setup Instructions</h2>
          <ol className="list-decimal pl-5 space-y-2">
            <li>Open a terminal in your project directory</li>
            <li>Run: <code className="bg-gray-700 px-2 py-1 rounded">npx prisma generate</code></li>
            <li>Run: <code className="bg-gray-700 px-2 py-1 rounded">npx prisma migrate dev --name init</code></li>
            <li>Run: <code className="bg-gray-700 px-2 py-1 rounded">npm run prisma:seed</code></li>
          </ol>
        </div>
      </div>
    </div>
  );
}