'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';

interface DatabaseStatus {
  status: 'healthy' | 'unhealthy';
  timestamp: string;
  database: {
    status: 'connected' | 'disconnected';
    responseTime: string;
    stats?: {
      users: number;
      students: number;
      courses: number;
    };
    error?: string;
  };
  environment: string;
  version: string;
}

export function DatabaseStatus() {
  const [status, setStatus] = useState<DatabaseStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [lastChecked, setLastChecked] = useState<Date | null>(null);

  const checkHealth = async () => {
    try {
      const response = await fetch('/api/health');
      const data = await response.json();
      setStatus(data);
      setLastChecked(new Date());
    } catch (error) {
      console.error('Failed to check health:', error);
      setStatus({
        status: 'unhealthy',
        timestamp: new Date().toISOString(),
        database: {
          status: 'disconnected',
          responseTime: 'N/A',
          error: 'Failed to reach health endpoint'
        },
        environment: 'unknown',
        version: '1.0.0'
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkHealth();
    
    // Check every 30 seconds
    const interval = setInterval(checkHealth, 30000);
    
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <Card className="w-full max-w-md">
      <CardContent className="p-4">
        <div className="flex items-center space-x-2">
          <div className="h-3 w-3 rounded-full bg-muted-foreground/40 animate-pulse" />
          <span className="text-sm text-muted-foreground">Verificando conexión...</span>
        </div>
      </CardContent>
    </Card>
  );
}

  if (!status) {
    return null;
  }

  const isHealthy = status.status === 'healthy' && status.database.status === 'connected';
  const statusColor = isHealthy
    ? 'bg-green-500 dark:bg-green-400'
    : 'bg-red-500 dark:bg-red-400';
  const statusText = isHealthy ? 'Conectado' : 'Desconectado';

  return (
    <Card className="w-full max-w-md">
      <CardContent className="p-4">
        <div className="space-y-3">
          {/* Status Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className={`w-3 h-3 ${statusColor} rounded-full ${isHealthy ? 'animate-pulse' : ''}`}></div>
              <span className="font-medium text-sm">Base de Datos</span>
            </div>
            <span
              className={`text-xs px-2 py-1 rounded-full ${
                isHealthy
                  ? 'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-200'
                  : 'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-200'
              }`}
            >
              {statusText}
            </span>
          </div>

          {/* Stats */}
          {isHealthy && status.database.stats && (
            <div className="grid grid-cols-3 gap-2 text-xs">
              <div className="text-center">
                <div className="font-semibold text-blue-600 dark:text-blue-300">
                  {status.database.stats.users}
                </div>
                <div className="text-muted-foreground">Usuarios</div>
              </div>
              <div className="text-center">
                <div className="font-semibold text-green-600 dark:text-green-300">
                  {status.database.stats.students}
                </div>
                <div className="text-muted-foreground">Estudiantes</div>
              </div>
              <div className="text-center">
                <div className="font-semibold text-purple-600 dark:text-purple-300">
                  {status.database.stats.courses}
                </div>
                <div className="text-muted-foreground">Cursos</div>
              </div>
            </div>
          )}

          {/* Response Time & Environment */}
          <div className="flex justify-between items-center text-xs text-muted-foreground">
            <span>Respuesta: {status.database.responseTime}</span>
            <span className="capitalize">{status.environment}</span>
          </div>

          {/* Error Message */}
          {!isHealthy && status.database.error && (
            <div className="text-xs text-red-600 bg-red-50 dark:text-red-200 dark:bg-red-900/40 p-2 rounded">
              {status.database.error}
            </div>
          )}

          {/* Last Checked */}
          {lastChecked && (
            <div className="text-xs text-muted-foreground text-center">
              Última verificación: {lastChecked.toLocaleTimeString()}
            </div>
          )}

          {/* Refresh Button */}
          <button
            onClick={checkHealth}
            className="w-full text-xs text-blue-600 hover:text-blue-800 dark:text-blue-300 dark:hover:text-blue-200 py-1"
          >
            Verificar ahora
          </button>
        </div>
      </CardContent>
    </Card>
  );
}
