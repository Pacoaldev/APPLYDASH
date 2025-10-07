'use client';

import { useEffect, useState } from 'react';

interface EnvStatus {
  loaded: boolean;
  error?: string;
  variables?: Record<string, boolean>;
}

export function EnvInitializer({ children }: { children: React.ReactNode }) {
  const [envStatus, setEnvStatus] = useState<EnvStatus>({ loaded: false });

  useEffect(() => {
    // Check if environment variables are available on the client
    const checkEnv = async () => {
      try {
        const response = await fetch('/api/health');
        const data = await response.json();
        
        if (data.configValid) {
          setEnvStatus({ loaded: true, variables: data.variables });
        } else {
          setEnvStatus({ 
            loaded: false, 
            error: 'Environment variables not properly configured',
            variables: data.variables 
          });
        }
      } catch (error) {
        setEnvStatus({ 
          loaded: false, 
          error: error instanceof Error ? error.message : 'Failed to check environment' 
        });
      }
    };

    checkEnv();
  }, []);

  if (!envStatus.loaded && envStatus.error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-red-50">
        <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-lg border border-red-200">
          <div className="text-center">
            <div className="text-red-600 text-6xl mb-4">⚠️</div>
            <h1 className="text-xl font-bold text-red-800 mb-2">
              Configuration Error
            </h1>
            <p className="text-red-600 mb-4">
              The application is not properly configured. Please check the environment variables.
            </p>
            <details className="text-left text-sm text-gray-600 bg-gray-50 p-3 rounded">
              <summary className="cursor-pointer font-medium">Technical Details</summary>
              <div className="mt-2">
                <p><strong>Error:</strong> {envStatus.error}</p>
                {envStatus.variables && (
                  <div className="mt-2">
                    <p><strong>Variable Status:</strong></p>
                    <ul className="list-disc list-inside">
                      {Object.entries(envStatus.variables).map(([key, value]) => (
                        <li key={key} className={value ? 'text-green-600' : 'text-red-600'}>
                          {key}: {value ? '✅' : '❌'}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </details>
            <button 
              onClick={() => window.location.reload()} 
              className="mt-4 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!envStatus.loaded) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin text-4xl mb-4">⚙️</div>
          <p className="text-gray-600">Initializing application...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}