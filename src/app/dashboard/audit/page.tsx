'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/providers/auth-provider';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AccessibleInput, AccessibleSelect } from '@/components/accessible-form';
import { KeyboardNavigation, SkipLink } from '@/components/keyboard-navigation';
import { 
  Shield, 
  User, 
  Calendar, 
  Filter,
  Download,
  Eye,
  Edit,
  Plus,
  Trash2,
  LogIn,
  LogOut,
  FileText,
  Search
} from 'lucide-react';
import Link from 'next/link';

interface AuditLogEntry {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  userRole: string;
  action: string;
  entity: string;
  entityId?: string;
  details?: any;
  ipAddress?: string;
  userAgent?: string;
  timestamp: string;
}

interface AuditLogsResponse {
  logs: AuditLogEntry[];
  pagination: {
    page: number;
    limit: number;
    totalCount: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

export default function AuditPage() {
  const { user, isAdmin } = useAuth();
  const [logs, setLogs] = useState<AuditLogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Filters
  const [filterUser, setFilterUser] = useState('');
  const [filterAction, setFilterAction] = useState('');
  const [filterEntity, setFilterEntity] = useState('');
  const [filterDateFrom, setFilterDateFrom] = useState('');
  const [filterDateTo, setFilterDateTo] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 50,
    totalCount: 0,
    totalPages: 0,
    hasNext: false,
    hasPrev: false
  });

  useEffect(() => {
    fetchLogs();
  }, [filterUser, filterAction, filterEntity, filterDateFrom, filterDateTo, searchTerm, pagination.page]);

  const fetchLogs = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      
      params.append('page', pagination.page.toString());
      params.append('limit', pagination.limit.toString());
      
      if (filterUser) params.append('userId', filterUser);
      if (filterAction) params.append('action', filterAction);
      if (filterEntity) params.append('entity', filterEntity);
      if (filterDateFrom) params.append('dateFrom', filterDateFrom);
      if (filterDateTo) params.append('dateTo', filterDateTo);
      if (searchTerm) params.append('search', searchTerm);

      const response = await fetch(`/api/audit/logs?${params.toString()}`);
      if (!response.ok) {
        throw new Error('Failed to fetch audit logs');
      }
      
      const data: AuditLogsResponse = await response.json();
      setLogs(data.logs);
      setPagination(data.pagination);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error loading audit logs');
    } finally {
      setLoading(false);
    }
  };

  // Only admins can access audit logs
  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
        <Card className="max-w-md">
          <CardContent className="p-6 text-center">
            <Shield className="w-12 h-12 mx-auto mb-4 text-red-500" />
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Acceso Restringido</h2>
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              Solo los administradores pueden acceder a los logs de auditoría.
            </p>
            <Link href="/dashboard">
              <Button>Volver al Dashboard</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  const getActionIcon = (action: string) => {
    switch (action) {
      case 'CREATE': return <Plus className="w-4 h-4 text-green-600" />;
      case 'UPDATE': return <Edit className="w-4 h-4 text-blue-600" />;
      case 'DELETE': return <Trash2 className="w-4 h-4 text-red-600" />;
      case 'VIEW': return <Eye className="w-4 h-4 text-gray-600" />;
      case 'LOGIN': return <LogIn className="w-4 h-4 text-green-600" />;
      case 'LOGOUT': return <LogOut className="w-4 h-4 text-orange-600" />;
      case 'EXPORT': return <Download className="w-4 h-4 text-purple-600" />;
      default: return <FileText className="w-4 h-4 text-gray-600" />;
    }
  };

  const getActionColor = (action: string) => {
    switch (action) {
      case 'CREATE': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'UPDATE': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'DELETE': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      case 'VIEW': return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
      case 'LOGIN': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'LOGOUT': return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200';
      case 'EXPORT': return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleString('es-AR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  const filteredLogs = logs.filter(log => {
    if (filterUser && !log.userName.toLowerCase().includes(filterUser.toLowerCase())) return false;
    if (filterAction && log.action !== filterAction) return false;
    if (filterEntity && log.entity !== filterEntity) return false;
    if (filterDateFrom && new Date(log.timestamp) < new Date(filterDateFrom)) return false;
    if (filterDateTo && new Date(log.timestamp) > new Date(filterDateTo + 'T23:59:59')) return false;
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      if (!log.userName.toLowerCase().includes(searchLower) &&
          !log.action.toLowerCase().includes(searchLower) &&
          !log.entity.toLowerCase().includes(searchLower) &&
          !(log.entityId?.toLowerCase().includes(searchLower))) {
        return false;
      }
    }
    return true;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Cargando logs de auditoría...</h1>
          <p className="text-gray-600 dark:text-gray-300">Obteniendo historial de actividades...</p>
        </div>
      </div>
    );
  }

  return (
    <KeyboardNavigation className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <SkipLink href="#main-content">Saltar al contenido principal</SkipLink>
      
      {/* Header */}
      <header className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-700 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link href="/dashboard">
                <Button variant="outline" size="sm">
                  ← Volver al Dashboard
                </Button>
              </Link>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  Logs de Auditoría
                </h1>
                <p className="text-gray-600 dark:text-gray-300">
                  Historial completo de actividades del sistema
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Button variant="outline" size="sm">
                <Download className="w-4 h-4 mr-2" />
                Exportar Logs
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main id="main-content" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8" role="main">
        {/* Filters */}
        <Card className="border-0 shadow-lg mb-8">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Filter className="w-5 h-5" />
              <span>Filtros de Búsqueda</span>
            </CardTitle>
            <CardDescription>
              Filtra los logs por usuario, acción, entidad o rango de fechas
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
              <AccessibleInput
                label="Buscar"
                placeholder="Usuario, acción, entidad..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />

              <AccessibleInput
                label="Usuario ID"
                placeholder="ID del usuario..."
                value={filterUser}
                onChange={(e) => setFilterUser(e.target.value)}
              />

              <AccessibleSelect
                label="Acción"
                value={filterAction}
                onChange={(e) => setFilterAction(e.target.value)}
                options={[
                  { value: '', label: 'Todas las acciones' },
                  { value: 'CREATE', label: 'Crear' },
                  { value: 'UPDATE', label: 'Actualizar' },
                  { value: 'DELETE', label: 'Eliminar' },
                  { value: 'VIEW', label: 'Ver' },
                  { value: 'LOGIN', label: 'Iniciar Sesión' },
                  { value: 'LOGOUT', label: 'Cerrar Sesión' },
                  { value: 'EXPORT', label: 'Exportar' }
                ]}
              />

              <AccessibleSelect
                label="Entidad"
                value={filterEntity}
                onChange={(e) => setFilterEntity(e.target.value)}
                options={[
                  { value: '', label: 'Todas las entidades' },
                  { value: 'USER', label: 'Usuario' },
                  { value: 'STUDENT', label: 'Estudiante' },
                  { value: 'COURSE', label: 'Curso' },
                  { value: 'CONTRIBUTION', label: 'Aporte' },
                  { value: 'COURSE_INVOICE', label: 'Factura' },
                  { value: 'REPORT', label: 'Reporte' }
                ]}
              />

              <AccessibleInput
                label="Fecha desde"
                type="date"
                value={filterDateFrom}
                onChange={(e) => setFilterDateFrom(e.target.value)}
              />

              <AccessibleInput
                label="Fecha hasta"
                type="date"
                value={filterDateTo}
                onChange={(e) => setFilterDateTo(e.target.value)}
              />
            </div>

            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Mostrando {logs.length} de {pagination.totalCount} registros (Página {pagination.page} de {pagination.totalPages})
              </p>
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
                  disabled={!pagination.hasPrev}
                >
                  Anterior
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
                  disabled={!pagination.hasNext}
                >
                  Siguiente
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setFilterUser('');
                    setFilterAction('');
                    setFilterEntity('');
                    setFilterDateFrom('');
                    setFilterDateTo('');
                    setSearchTerm('');
                    setPagination(prev => ({ ...prev, page: 1 }));
                  }}
                >
                  Limpiar Filtros
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Logs List */}
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Shield className="w-5 h-5" />
              <span>Registro de Actividades</span>
            </CardTitle>
            <CardDescription>
              Historial cronológico de todas las acciones realizadas en el sistema
            </CardDescription>
          </CardHeader>
          <CardContent>
            {logs.length > 0 ? (
              <div className="space-y-3">
                {logs.map((log) => (
                  <div
                    key={log.id}
                    className="flex items-start justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                  >
                    <div className="flex items-start space-x-4 flex-1">
                      <div className="flex-shrink-0">
                        {getActionIcon(log.action)}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2 mb-1">
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getActionColor(log.action)}`}>
                            {log.action}
                          </span>
                          <span className="text-sm font-medium text-gray-900 dark:text-white">
                            {log.entity}
                          </span>
                          {log.entityId && (
                            <span className="text-sm text-gray-500">
                              #{log.entityId}
                            </span>
                          )}
                        </div>
                        
                        <div className="flex items-center space-x-4 text-sm text-gray-600 dark:text-gray-400">
                          <div className="flex items-center space-x-1">
                            <User className="w-3 h-3" />
                            <span>{log.userName}</span>
                            <span className="text-xs">({log.userRole})</span>
                          </div>
                          
                          <div className="flex items-center space-x-1">
                            <Calendar className="w-3 h-3" />
                            <span>{formatTimestamp(log.timestamp)}</span>
                          </div>
                          
                          {log.ipAddress && (
                            <span className="text-xs">IP: {log.ipAddress}</span>
                          )}
                        </div>
                        
                        {log.details && (
                          <div className="mt-2 p-2 bg-gray-100 dark:bg-gray-800 rounded text-xs">
                            <pre className="whitespace-pre-wrap text-gray-700 dark:text-gray-300">
                              {JSON.stringify(log.details, null, 2)}
                            </pre>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <Search className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  No se encontraron registros
                </h3>
                <p className="text-gray-600 dark:text-gray-300">
                  No hay logs que coincidan con los filtros seleccionados.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </KeyboardNavigation>
  );
}
