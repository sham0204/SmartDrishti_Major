'use client';

import { useState, useEffect } from 'react';

export default function HealthPage() {
  const [healthData, setHealthData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchHealth = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/health');
        const data = await response.json();
        setHealthData(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchHealth();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mb-4"></div>
          <p>Checking health status...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-900 text-white p-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold mb-6">Health Check</h1>
          <div className="bg-red-900/50 p-6 rounded-lg">
            <h2 className="text-xl font-semibold mb-2 text-red-300">Error</h2>
            <p className="text-red-200">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Health Check</h1>
        
        <div className={`p-6 rounded-lg ${healthData.status === 'healthy' ? 'bg-green-900/50' : 'bg-red-900/50'}`}>
          <h2 className="text-xl font-semibold mb-2">
            Status: <span className={healthData.status === 'healthy' ? 'text-green-300' : 'text-red-300'}>
              {healthData.status.toUpperCase()}
            </span>
          </h2>
          
          <div className="mt-4 space-y-2">
            <p>
              <span className="font-medium">Database:</span>{' '}
              <span className={healthData.database === 'connected' ? 'text-green-300' : 'text-red-300'}>
                {healthData.database}
              </span>
            </p>
            
            {healthData.projectCount !== undefined && (
              <p>
                <span className="font-medium">Projects in database:</span>{' '}
                <span className="text-blue-300">{healthData.projectCount}</span>
              </p>
            )}
            
            <p>
              <span className="font-medium">Last checked:</span>{' '}
              <span className="text-gray-300">{new Date(healthData.timestamp).toLocaleString()}</span>
            </p>
          </div>
          
          {healthData.error && (
            <div className="mt-4 p-4 bg-black/30 rounded">
              <h3 className="font-medium text-red-300">Error Details:</h3>
              <p className="text-red-200 text-sm mt-1">{healthData.error}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}