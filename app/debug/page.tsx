'use client';

import { useEffect, useState } from 'react';
import { getClientConfig } from '@/lib/client-config';

interface ClientDiagnostics {
  environment: string;
  hasSupabaseUrl: boolean;
  hasSupabaseKey: boolean;
  supabaseUrlPreview: string;
  userAgent: string;
  timestamp: string;
  errors: string[];
  runtimeConfigAvailable: boolean;
  windowEnvAvailable: boolean;
  envVarsFromProcess: {
    url: string;
    key: string;
  };
  windowEnv: {
    url: string;
    key: string;
  };
}

export default function DebugPage() {
  const [diagnostics, setDiagnostics] = useState<ClientDiagnostics | null>(null);
  const [serverHealth, setServerHealth] = useState<any>(null);

  useEffect(() => {
    // Client-side diagnostics
    const errors: string[] = [];
    
    const runDiagnostics = async () => {
      try {
        // Check runtime config availability
        let runtimeConfigAvailable = false;
        try {
          const response = await fetch('/runtime-config.json');
          runtimeConfigAvailable = response.ok;
        } catch {
          runtimeConfigAvailable = false;
        }

        // Check window.__ENV__ availability
        const windowEnvAvailable = typeof window !== 'undefined' && !!(window as any).__ENV__;
        const windowEnv = windowEnvAvailable ? (window as any).__ENV__ : {};

        // Get client config
        const clientConfig = await getClientConfig();

        const clientDiag: ClientDiagnostics = {
          environment: process.env.NODE_ENV || 'unknown',
          hasSupabaseUrl: !!clientConfig.supabaseUrl,
          hasSupabaseKey: !!clientConfig.supabaseAnonKey,
          supabaseUrlPreview: clientConfig.supabaseUrl?.substring(0, 30) + '...' || 'NOT_SET',
          userAgent: navigator.userAgent,
          timestamp: new Date().toISOString(),
          errors,
          runtimeConfigAvailable,
          windowEnvAvailable,
          envVarsFromProcess: {
            url: process.env.NEXT_PUBLIC_SUPABASE_URL?.substring(0, 30) + '...' || 'NOT_SET',
            key: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 'present' : 'missing'
          },
          windowEnv: {
            url: windowEnv.NEXT_PUBLIC_SUPABASE_URL?.substring(0, 30) + '...' || 'NOT_SET',
            key: windowEnv.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 'present' : 'missing'
          }
        };
        
        setDiagnostics(clientDiag);
      } catch (error) {
        errors.push(`Client diagnostics error: ${error}`);
        setDiagnostics({
          environment: 'unknown',
          hasSupabaseUrl: false,
          hasSupabaseKey: false,
          supabaseUrlPreview: 'ERROR',
          userAgent: navigator.userAgent,
          timestamp: new Date().toISOString(),
          errors,
          runtimeConfigAvailable: false,
          windowEnvAvailable: false,
          envVarsFromProcess: { url: 'ERROR', key: 'ERROR' },
          windowEnv: { url: 'ERROR', key: 'ERROR' }
        });
      }
    };

    runDiagnostics();

    // Fetch server health
    fetch('/api/health')
      .then(res => res.json())
      .then(data => setServerHealth(data))
      .catch(error => {
        errors.push(`Server health check failed: ${error.message}`);
      });
  }, []);

  if (!diagnostics) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin text-4xl mb-4">🔍</div>
          <p>Running diagnostics...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-6 text-center">Application Diagnostics</h1>
        
        <div className="grid gap-6 md:grid-cols-2">
          {/* Client-side Diagnostics */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4 text-blue-600">Client-side Status</h2>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span>Environment:</span>
                <span className="font-mono">{diagnostics.environment}</span>
              </div>
              <div className="flex justify-between">
                <span>Supabase URL:</span>
                <span className={diagnostics.hasSupabaseUrl ? 'text-green-600' : 'text-red-600'}>
                  {diagnostics.hasSupabaseUrl ? '✅ Available' : '❌ Missing'}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Supabase Key:</span>
                <span className={diagnostics.hasSupabaseKey ? 'text-green-600' : 'text-red-600'}>
                  {diagnostics.hasSupabaseKey ? '✅ Available' : '❌ Missing'}
                </span>
              </div>
              <div className="flex justify-between">
                <span>URL Preview:</span>
                <span className="font-mono text-sm">{diagnostics.supabaseUrlPreview}</span>
              </div>
              <div className="flex justify-between">
                <span>Timestamp:</span>
                <span className="font-mono text-sm">{diagnostics.timestamp}</span>
              </div>
              <div className="flex justify-between">
                <span>Runtime Config:</span>
                <span className={diagnostics.runtimeConfigAvailable ? 'text-green-600' : 'text-yellow-600'}>
                  {diagnostics.runtimeConfigAvailable ? '✅ Available' : '⚠️ Not Available'}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Window.__ENV__:</span>
                <span className={diagnostics.windowEnvAvailable ? 'text-green-600' : 'text-red-600'}>
                  {diagnostics.windowEnvAvailable ? '✅ Available' : '❌ Missing'}
                </span>
              </div>
            </div>
            
            <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded">
              <h3 className="font-medium text-blue-800 mb-2">Environment Variables (process.env):</h3>
              <div className="text-sm space-y-1">
                <div>URL: <span className="font-mono">{diagnostics.envVarsFromProcess.url}</span></div>
                <div>Key: <span className="font-mono">{diagnostics.envVarsFromProcess.key}</span></div>
              </div>
            </div>

            <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded">
              <h3 className="font-medium text-green-800 mb-2">Window Environment (window.__ENV__):</h3>
              <div className="text-sm space-y-1">
                <div>URL: <span className="font-mono">{diagnostics.windowEnv.url}</span></div>
                <div>Key: <span className="font-mono">{diagnostics.windowEnv.key}</span></div>
              </div>
            </div>
            
            {diagnostics.errors.length > 0 && (
              <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded">
                <h3 className="font-medium text-red-800 mb-2">Client Errors:</h3>
                <ul className="text-sm text-red-700 space-y-1">
                  {diagnostics.errors.map((error, index) => (
                    <li key={index}>• {error}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Server-side Diagnostics */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4 text-green-600">Server-side Status</h2>
            {serverHealth ? (
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span>Status:</span>
                  <span className={serverHealth.status === 'healthy' ? 'text-green-600' : 'text-red-600'}>
                    {serverHealth.status === 'healthy' ? '✅ Healthy' : '❌ Unhealthy'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Environment:</span>
                  <span className="font-mono">{serverHealth.environment}</span>
                </div>
                <div className="flex justify-between">
                  <span>Platform:</span>
                  <span className="font-mono">{serverHealth.platform}</span>
                </div>
                <div className="flex justify-between">
                  <span>Node Version:</span>
                  <span className="font-mono">{serverHealth.nodeVersion}</span>
                </div>
                <div className="flex justify-between">
                  <span>Config Valid:</span>
                  <span className={serverHealth.configValid ? 'text-green-600' : 'text-red-600'}>
                    {serverHealth.configValid ? '✅ Valid' : '❌ Invalid'}
                  </span>
                </div>
                
                <details className="mt-4">
                  <summary className="cursor-pointer font-medium">Server Variables</summary>
                  <div className="mt-2 text-sm space-y-1">
                    {Object.entries(serverHealth.variables || {}).map(([key, value]) => (
                      <div key={key} className="flex justify-between">
                        <span>{key}:</span>
                        <span className={value ? 'text-green-600' : 'text-red-600'}>
                          {value ? '✅' : '❌'}
                        </span>
                      </div>
                    ))}
                  </div>
                </details>
              </div>
            ) : (
              <div className="text-center text-gray-500">
                <div className="animate-spin text-2xl mb-2">⏳</div>
                <p>Loading server status...</p>
              </div>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="mt-6 text-center space-x-4">
          <button 
            onClick={() => window.location.reload()} 
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Refresh Diagnostics
          </button>
          <button 
            onClick={async () => {
              if (confirm('¿Ejecutar migración de base de datos? Esto creará las tablas necesarias.')) {
                try {
                  const response = await fetch('/api/migrate', { method: 'POST' });
                  const result = await response.json();
                  alert(result.success ? 'Migración exitosa!' : `Error: ${result.error}`);
                  window.location.reload();
                } catch (error) {
                  alert(`Error ejecutando migración: ${error}`);
                }
              }
            }}
            className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
          >
            Run Database Migration
          </button>
          <button 
            onClick={async () => {
              try {
                console.log('🔄 Syncing user...');
                const response = await fetch('/api/sync-user', { method: 'POST' });
                const result = await response.json();
                console.log('📤 Sync result:', result);
                alert(result.success ? 'Usuario sincronizado!' : `Error: ${result.error}`);
              } catch (error) {
                console.error('❌ Sync error:', error);
                alert(`Error sincronizando usuario: ${error}`);
              }
            }}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Sync User
          </button>
          <button 
            onClick={async () => {
              try {
                const testData = {
                  company: 'Test Company',
                  position: 'Test Position',
                  type: 'Office',
                  appliedDate: '2025-10-07',
                  status: 'Applied',
                  platform: 'Test Platform',
                  location: 'Test Location',
                  salary: '50000',
                  notes: 'Test notes'
                };
                
                console.log('🧪 Testing createJob with:', testData);
                const response = await fetch('/api/test-create-job', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify(testData)
                });
                
                const result = await response.json();
                console.log('📤 Test result:', result);
                alert(`Test result: ${JSON.stringify(result, null, 2)}`);
              } catch (error) {
                console.error('❌ Test error:', error);
                alert(`Test error: ${error}`);
              }
            }}
            className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700"
          >
            Test Create Job
          </button>
          <a 
            href="/" 
            className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 inline-block"
          >
            Back to Home
          </a>
        </div>

        {/* Footer info */}
        <div className="mt-8 text-center text-sm text-gray-500 border-t pt-4">
          <p>
            © 2025 ApplyDash - Developed by{' '}
            <span className="text-blue-600 font-semibold">Pacoaldev</span>
          </p>
        </div>
      </div>
    </div>
  );
}