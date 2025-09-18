'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/providers/auth-provider';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AccessibleInput, AccessibleSelect } from '@/components/accessible-form';
import { LoadingSpinner, TableSkeleton } from '@/components/loading-spinner';
import { 
  Users, 
  Plus, 
  Search, 
  Filter, 
  Edit, 
  Trash2, 
  Shield, 
  Eye,
  UserCheck,
  UserX,
  Crown,
  GraduationCap
} from 'lucide-react';
import { UserRole } from '@prisma/client';

interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  _count: {
    refreshTokens: number;
  };
}

interface UsersResponse {
  users: User[];
  pagination: {
    page: number;
    limit: number;
    totalCount: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

export default function UsersManagementPage() {
  const { user, isAdmin } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<UserRole | 'ALL'>('ALL');
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState<UsersResponse['pagination'] | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);

  // Redirect if not admin
  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
        <Card className="max-w-md">
          <CardContent className="p-6 text-center">
            <Shield className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              Acceso Denegado
            </h2>
            <p className="text-gray-600 dark:text-gray-300">
              Solo los administradores pueden acceder a la gestión de usuarios.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: '20'
      });

      if (searchTerm) {
        params.append('search', searchTerm);
      }

      if (roleFilter !== 'ALL') {
        params.append('role', roleFilter);
      }

      const response = await fetch(`/api/users?${params}`);
      
      if (!response.ok) {
        throw new Error('Error al cargar usuarios');
      }

      const data: UsersResponse = await response.json();
      setUsers(data.users);
      setPagination(data.pagination);

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [currentPage, searchTerm, roleFilter]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchUsers();
  };

  const getRoleIcon = (role: UserRole) => {
    switch (role) {
      case UserRole.ADMIN:
        return <Crown className="w-4 h-4 text-yellow-500" />;
      case UserRole.PRECEPTOR:
        return <GraduationCap className="w-4 h-4 text-blue-500" />;
      default:
        return <Users className="w-4 h-4 text-gray-500" />;
    }
  };

  const getRoleLabel = (role: UserRole) => {
    switch (role) {
      case UserRole.ADMIN:
        return 'Administrador';
      case UserRole.PRECEPTOR:
        return 'Preceptor';
      default:
        return role;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-AR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (loading && users.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <div className="w-64 h-8 bg-gray-200 dark:bg-gray-700 rounded mb-2 animate-pulse" />
            <div className="w-96 h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
          </div>
          <TableSkeleton rows={10} columns={6} />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center space-x-3">
                <Users className="w-8 h-8 text-blue-600" />
                <span>Gestión de Usuarios</span>
              </h1>
              <p className="text-gray-600 dark:text-gray-300 mt-2">
                Administra usuarios del sistema, roles y permisos
              </p>
            </div>
            
            <Button
              onClick={() => setShowCreateModal(true)}
              className="bg-green-600 hover:bg-green-700 text-white"
            >
              <Plus className="w-4 h-4 mr-2" />
              Nuevo Usuario
            </Button>
          </div>
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <AccessibleInput
                  label="Buscar usuarios"
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Buscar por nombre o email..."
                  className="w-full"
                />
              </div>
              
              <div className="w-full md:w-48">
                <AccessibleSelect
                  label="Filtrar por rol"
                  value={roleFilter}
                  onChange={(e) => setRoleFilter(e.target.value as UserRole | 'ALL')}
                  options={[
                    { value: 'ALL', label: 'Todos los roles' },
                    { value: UserRole.ADMIN, label: 'Administrador' },
                    { value: UserRole.PRECEPTOR, label: 'Preceptor' }
                  ]}
                />
              </div>
              
              <div className="flex space-x-2">
                <Button type="submit" disabled={loading}>
                  <Search className="w-4 h-4 mr-2" />
                  Buscar
                </Button>
                
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setSearchTerm('');
                    setRoleFilter('ALL');
                    setCurrentPage(1);
                  }}
                >
                  <Filter className="w-4 h-4 mr-2" />
                  Limpiar
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Error State */}
        {error && (
          <Card className="mb-6 border-red-200 dark:border-red-800">
            <CardContent className="p-4">
              <div className="flex items-center space-x-2 text-red-700 dark:text-red-300">
                <Trash2 className="w-4 h-4" />
                <span>{error}</span>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Users Table */}
        <Card>
          <CardHeader>
            <CardTitle>
              Usuarios del Sistema
              {pagination && (
                <span className="text-sm font-normal text-gray-500 ml-2">
                  ({pagination.totalCount} total)
                </span>
              )}
            </CardTitle>
            <CardDescription>
              Lista completa de usuarios con sus roles y estado
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            {loading ? (
              <TableSkeleton rows={5} columns={6} />
            ) : users.length === 0 ? (
              <div className="text-center py-12">
                <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                  No se encontraron usuarios
                </h3>
                <p className="text-gray-500 dark:text-gray-400">
                  {searchTerm || roleFilter !== 'ALL' 
                    ? 'Intenta ajustar los filtros de búsqueda'
                    : 'Aún no hay usuarios en el sistema'
                  }
                </p>
              </div>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-200 dark:border-gray-700">
                        <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white">
                          Usuario
                        </th>
                        <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white">
                          Rol
                        </th>
                        <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white">
                          Estado
                        </th>
                        <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white">
                          Sesiones
                        </th>
                        <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white">
                          Creado
                        </th>
                        <th className="text-right py-3 px-4 font-medium text-gray-900 dark:text-white">
                          Acciones
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {users.map((userData) => (
                        <tr
                          key={userData.id}
                          className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50"
                        >
                          <td className="py-4 px-4">
                            <div>
                              <div className="font-medium text-gray-900 dark:text-white">
                                {userData.name}
                              </div>
                              <div className="text-sm text-gray-500 dark:text-gray-400">
                                {userData.email}
                              </div>
                            </div>
                          </td>
                          
                          <td className="py-4 px-4">
                            <div className="flex items-center space-x-2">
                              {getRoleIcon(userData.role)}
                              <span className="text-sm font-medium">
                                {getRoleLabel(userData.role)}
                              </span>
                            </div>
                          </td>
                          
                          <td className="py-4 px-4">
                            <div className="flex items-center space-x-2">
                              {userData.isActive ? (
                                <>
                                  <UserCheck className="w-4 h-4 text-green-500" />
                                  <span className="text-sm text-green-600 dark:text-green-400">
                                    Activo
                                  </span>
                                </>
                              ) : (
                                <>
                                  <UserX className="w-4 h-4 text-red-500" />
                                  <span className="text-sm text-red-600 dark:text-red-400">
                                    Inactivo
                                  </span>
                                </>
                              )}
                            </div>
                          </td>
                          
                          <td className="py-4 px-4">
                            <span className="text-sm text-gray-600 dark:text-gray-300">
                              {userData._count.refreshTokens} activa{userData._count.refreshTokens !== 1 ? 's' : ''}
                            </span>
                          </td>
                          
                          <td className="py-4 px-4">
                            <span className="text-sm text-gray-600 dark:text-gray-300">
                              {formatDate(userData.createdAt)}
                            </span>
                          </td>
                          
                          <td className="py-4 px-4 text-right">
                            <div className="flex items-center justify-end space-x-2">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => {/* TODO: View user details */}}
                              >
                                <Eye className="w-3 h-3" />
                              </Button>
                              
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => {/* TODO: Edit user */}}
                                disabled={userData.id === user?.id}
                              >
                                <Edit className="w-3 h-3" />
                              </Button>
                              
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => {/* TODO: Delete user */}}
                                disabled={userData.id === user?.id}
                                className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
                              >
                                <Trash2 className="w-3 h-3" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Pagination */}
                {pagination && pagination.totalPages > 1 && (
                  <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
                    <div className="text-sm text-gray-600 dark:text-gray-300">
                      Página {pagination.page} de {pagination.totalPages} 
                      ({pagination.totalCount} usuarios total)
                    </div>
                    
                    <div className="flex space-x-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setCurrentPage(currentPage - 1)}
                        disabled={!pagination.hasPrev || loading}
                      >
                        Anterior
                      </Button>
                      
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setCurrentPage(currentPage + 1)}
                        disabled={!pagination.hasNext || loading}
                      >
                        Siguiente
                      </Button>
                    </div>
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>

        {/* TODO: Add Create User Modal */}
        {/* TODO: Add Edit User Modal */}
        {/* TODO: Add Delete Confirmation Modal */}
      </div>
    </div>
  );
}
