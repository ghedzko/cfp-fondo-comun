'use client';

import { useState, useEffect, useCallback, type FormEvent } from 'react';
import { useAuth } from '@/providers/auth-provider';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AccessibleInput, AccessibleSelect } from '@/components/accessible-form';
import { TableSkeleton } from '@/components/loading-spinner';
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
  GraduationCap,
  X,
  AlertCircle,
  CheckCircle
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
  
  // Create User Modal State
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createLoading, setCreateLoading] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);
  const [createSuccess, setCreateSuccess] = useState<string | null>(null);
  const [newUser, setNewUser] = useState<{
    name: string;
    email: string;
    password: string;
    role: UserRole;
  }>({
    name: '',
    email: '',
    password: '',
    role: UserRole.PRECEPTOR
  });

  // Edit User Modal State
  const [showEditModal, setShowEditModal] = useState(false);
  const [editLoading, setEditLoading] = useState(false);
  const [editError, setEditError] = useState<string | null>(null);
  const [editSuccess, setEditSuccess] = useState<string | null>(null);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [editUser, setEditUser] = useState<{
    name: string;
    email: string;
    role: UserRole;
    isActive: boolean;
  }>({
    name: '',
    email: '',
    role: UserRole.PRECEPTOR,
    isActive: true
  });

  // Delete User Modal State
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [userToDelete, setUserToDelete] = useState<User | null>(null);

  // View User Modal State
  const [showViewModal, setShowViewModal] = useState(false);
  const [viewingUser, setViewingUser] = useState<User | null>(null);
  const fetchUsers = useCallback(async () => {
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
  }, [currentPage, roleFilter, searchTerm]);

  useEffect(() => {
    if (!isAdmin) {
      setLoading(false);
      return;
    }

    fetchUsers();
  }, [fetchUsers, isAdmin]);

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

  const handleSearch = (e: FormEvent) => {
    e.preventDefault();
    setCurrentPage((prev) => {
      if (prev === 1) {
        fetchUsers();
        return prev;
      }

      return 1;
    });
  };

  const handleCreateUser = async (e: FormEvent) => {
    e.preventDefault();
    setCreateLoading(true);
    setCreateError(null);
    setCreateSuccess(null);

    try {
      const response = await fetch('/api/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(newUser),
      });

      const data = await response.json();

      if (response.ok) {
        setCreateSuccess('Usuario creado exitosamente');
        setNewUser({
          name: '',
          email: '',
          password: '',
          role: UserRole.PRECEPTOR
        });
        
        // Refresh users list
        await fetchUsers();
        
        // Close modal after a delay
        setTimeout(() => {
          setShowCreateModal(false);
          setCreateSuccess(null);
        }, 2000);
      } else {
        setCreateError(data.error || 'Error al crear usuario');
      }
    } catch (err) {
      setCreateError('Error de conexión');
    } finally {
      setCreateLoading(false);
    }
  };

  const openCreateModal = () => {
    setShowCreateModal(true);
    setCreateError(null);
    setCreateSuccess(null);
    setNewUser({
      name: '',
      email: '',
      password: '',
      role: UserRole.PRECEPTOR
    });
  };

  const closeCreateModal = () => {
    setShowCreateModal(false);
    setCreateError(null);
    setCreateSuccess(null);
  };

  // Edit User Functions
  const openEditModal = (user: User) => {
    setEditingUser(user);
    setEditUser({
      name: user.name,
      email: user.email,
      role: user.role,
      isActive: user.isActive
    });
    setShowEditModal(true);
    setEditError(null);
    setEditSuccess(null);
  };

  const closeEditModal = () => {
    setShowEditModal(false);
    setEditingUser(null);
    setEditError(null);
    setEditSuccess(null);
  };

  const handleEditUser = async (e: FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;

    setEditLoading(true);
    setEditError(null);
    setEditSuccess(null);

    try {
      const response = await fetch(`/api/users/${editingUser.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(editUser),
      });

      const data = await response.json();

      if (response.ok) {
        setEditSuccess('Usuario actualizado exitosamente');
        
        // Refresh users list
        await fetchUsers();
        
        // Close modal after a delay
        setTimeout(() => {
          setShowEditModal(false);
          setEditSuccess(null);
          setEditingUser(null);
        }, 2000);
      } else {
        setEditError(data.error || 'Error al actualizar usuario');
      }
    } catch (err) {
      setEditError('Error de conexión');
    } finally {
      setEditLoading(false);
    }
  };

  // Delete User Functions
  const openDeleteModal = (user: User) => {
    setUserToDelete(user);
    setShowDeleteModal(true);
    setDeleteError(null);
  };

  const closeDeleteModal = () => {
    setShowDeleteModal(false);
    setUserToDelete(null);
    setDeleteError(null);
  };

  const handleDeleteUser = async () => {
    if (!userToDelete) return;

    setDeleteLoading(true);
    setDeleteError(null);

    try {
      const response = await fetch(`/api/users/${userToDelete.id}`, {
        method: 'DELETE',
        credentials: 'include',
      });

      const data = await response.json();

      if (response.ok) {
        // Refresh users list
        await fetchUsers();
        
        // Close modal
        setShowDeleteModal(false);
        setUserToDelete(null);
      } else {
        setDeleteError(data.error || 'Error al eliminar usuario');
      }
    } catch (err) {
      setDeleteError('Error de conexión');
    } finally {
      setDeleteLoading(false);
    }
  };

  // View User Functions
  const openViewModal = (user: User) => {
    setViewingUser(user);
    setShowViewModal(true);
  };

  const closeViewModal = () => {
    setShowViewModal(false);
    setViewingUser(null);
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
              onClick={openCreateModal}
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
                                onClick={() => openViewModal(userData)}
                                title="Ver detalles del usuario"
                              >
                                <Eye className="w-3 h-3" />
                              </Button>
                              
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => openEditModal(userData)}
                                disabled={userData.id === user?.id}
                                title="Editar usuario"
                              >
                                <Edit className="w-3 h-3" />
                              </Button>
                              
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => openDeleteModal(userData)}
                                disabled={userData.id === user?.id}
                                className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
                                title="Eliminar usuario"
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

        {/* Create User Modal */}
        {showCreateModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Crear Nuevo Usuario
                </h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={closeCreateModal}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>

              <form onSubmit={handleCreateUser} className="p-6">
                <div className="space-y-4">
                  {/* Success Message */}
                  {createSuccess && (
                    <div className="flex items-center gap-2 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                      <span className="text-green-700 dark:text-green-300 text-sm">
                        {createSuccess}
                      </span>
                    </div>
                  )}

                  {/* Error Message */}
                  {createError && (
                    <div className="flex items-center gap-2 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                      <AlertCircle className="w-4 h-4 text-red-600" />
                      <span className="text-red-700 dark:text-red-300 text-sm">
                        {createError}
                      </span>
                    </div>
                  )}

                  {/* Name Field */}
                  <div>
                    <AccessibleInput
                      label="Nombre completo"
                      type="text"
                      value={newUser.name}
                      onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                      placeholder="Juan Pérez"
                      required
                      disabled={createLoading}
                    />
                  </div>

                  {/* Email Field */}
                  <div>
                    <AccessibleInput
                      label="Email"
                      type="email"
                      value={newUser.email}
                      onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                      placeholder="juan@ejemplo.com"
                      required
                      disabled={createLoading}
                    />
                  </div>

                  {/* Password Field */}
                  <div>
                    <AccessibleInput
                      label="Contraseña"
                      type="password"
                      value={newUser.password}
                      onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                      placeholder="Mínimo 6 caracteres"
                      required
                      disabled={createLoading}
                      minLength={6}
                    />
                  </div>

                  {/* Role Field */}
                  <div>
                    <AccessibleSelect
                      label="Rol del usuario"
                      value={newUser.role}
                      onChange={(e) => setNewUser({ ...newUser, role: e.target.value as UserRole })}
                      options={[
                        { value: UserRole.PRECEPTOR, label: 'Preceptor' },
                        { value: UserRole.ADMIN, label: 'Administrador' }
                      ]}
                      disabled={createLoading}
                    />
                  </div>
                </div>

                {/* Form Actions */}
                <div className="flex gap-3 mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
                  <Button
                    type="submit"
                    disabled={createLoading || !newUser.name || !newUser.email || !newUser.password}
                    className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                  >
                    {createLoading ? 'Creando...' : 'Crear Usuario'}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={closeCreateModal}
                    disabled={createLoading}
                    className="flex-1"
                  >
                    Cancelar
                  </Button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Edit User Modal */}
        {showEditModal && editingUser && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white dark:bg-gray-900 rounded-lg shadow-xl max-w-md w-full mx-4">
              <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                  Editar Usuario
                </h2>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={closeEditModal}
                  disabled={editLoading}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>

              <form onSubmit={handleEditUser} className="p-6">
                <div className="space-y-4">
                  {/* Success Message */}
                  {editSuccess && (
                    <div className="flex items-center space-x-2 text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20 p-3 rounded-lg">
                      <CheckCircle className="w-4 h-4" />
                      <span className="text-sm">{editSuccess}</span>
                    </div>
                  )}

                  {/* Error Message */}
                  {editError && (
                    <div className="flex items-center space-x-2 text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 p-3 rounded-lg">
                      <AlertCircle className="w-4 h-4" />
                      <span className="text-sm">{editError}</span>
                    </div>
                  )}

                  <AccessibleInput
                    id="edit-name"
                    label="Nombre completo"
                    type="text"
                    value={editUser.name}
                    onChange={(e) => setEditUser(prev => ({ ...prev, name: e.target.value }))}
                    required
                    disabled={editLoading}
                    placeholder="Ej: Juan Pérez"
                  />

                  <AccessibleInput
                    id="edit-email"
                    label="Email"
                    type="email"
                    value={editUser.email}
                    onChange={(e) => setEditUser(prev => ({ ...prev, email: e.target.value }))}
                    required
                    disabled={editLoading}
                    placeholder="usuario@ejemplo.com"
                  />

                  <AccessibleSelect
                    id="edit-role"
                    label="Rol"
                    value={editUser.role}
                    onChange={(e) => setEditUser(prev => ({ ...prev, role: e.target.value as UserRole }))}
                    required
                    disabled={editLoading}
                    options={[
                      { value: UserRole.PRECEPTOR, label: 'Preceptor' },
                      { value: UserRole.ADMIN, label: 'Administrador' }
                    ]}
                  />

                  <div className="flex items-center space-x-2">
                    <input
                      id="edit-isActive"
                      type="checkbox"
                      checked={editUser.isActive}
                      onChange={(e) => setEditUser(prev => ({ ...prev, isActive: e.target.checked }))}
                      disabled={editLoading}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <label htmlFor="edit-isActive" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Usuario activo
                    </label>
                  </div>
                </div>

                <div className="flex space-x-3 mt-6">
                  <Button
                    type="submit"
                    disabled={editLoading || !editUser.name || !editUser.email}
                    className="flex-1"
                  >
                    {editLoading ? 'Actualizando...' : 'Actualizar Usuario'}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={closeEditModal}
                    disabled={editLoading}
                    className="flex-1"
                  >
                    Cancelar
                  </Button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* View User Modal */}
        {showViewModal && viewingUser && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white dark:bg-gray-900 rounded-lg shadow-xl max-w-lg w-full mx-4">
              <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                  Detalles del Usuario
                </h2>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={closeViewModal}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>

              <div className="p-6">
                {/* User Avatar and Basic Info */}
                <div className="flex items-center space-x-4 mb-6">
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center">
                    <Users className="w-8 h-8 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                      {viewingUser.name}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-300">
                      {viewingUser.email}
                    </p>
                    <div className="flex items-center space-x-2 mt-1">
                      {getRoleIcon(viewingUser.role)}
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        {getRoleLabel(viewingUser.role)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* User Details */}
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-gray-500 dark:text-gray-400">
                        Estado
                      </label>
                      <div className="flex items-center space-x-2 mt-1">
                        {viewingUser.isActive ? (
                          <>
                            <UserCheck className="w-4 h-4 text-green-500" />
                            <span className="text-sm text-green-600 dark:text-green-400 font-medium">
                              Activo
                            </span>
                          </>
                        ) : (
                          <>
                            <UserX className="w-4 h-4 text-red-500" />
                            <span className="text-sm text-red-600 dark:text-red-400 font-medium">
                              Inactivo
                            </span>
                          </>
                        )}
                      </div>
                    </div>

                    <div>
                      <label className="text-sm font-medium text-gray-500 dark:text-gray-400">
                        Sesiones Activas
                      </label>
                      <p className="text-sm text-gray-900 dark:text-white mt-1">
                        {viewingUser._count.refreshTokens} activa{viewingUser._count.refreshTokens !== 1 ? 's' : ''}
                      </p>
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-500 dark:text-gray-400">
                      Fecha de Registro
                    </label>
                    <p className="text-sm text-gray-900 dark:text-white mt-1">
                      {formatDate(viewingUser.createdAt)}
                    </p>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-500 dark:text-gray-400">
                      Última Actualización
                    </label>
                    <p className="text-sm text-gray-900 dark:text-white mt-1">
                      {formatDate(viewingUser.updatedAt)}
                    </p>
                  </div>

                  {/* Role Description */}
                  <div>
                    <label className="text-sm font-medium text-gray-500 dark:text-gray-400">
                      Permisos del Rol
                    </label>
                    <div className="mt-2 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      {viewingUser.role === UserRole.ADMIN ? (
                        <div className="space-y-1">
                          <p className="text-sm text-gray-900 dark:text-white font-medium">Administrador</p>
                          <ul className="text-xs text-gray-600 dark:text-gray-300 space-y-1">
                            <li>• Gestión completa de usuarios</li>
                            <li>• Acceso a reportes y auditoría</li>
                            <li>• Configuración del sistema</li>
                            <li>• Gestión de cursos y estudiantes</li>
                            <li>• Generación de facturas</li>
                          </ul>
                        </div>
                      ) : (
                        <div className="space-y-1">
                          <p className="text-sm text-gray-900 dark:text-white font-medium">Preceptor</p>
                          <ul className="text-xs text-gray-600 dark:text-gray-300 space-y-1">
                            <li>• Gestión de estudiantes</li>
                            <li>• Registro de aportes</li>
                            <li>• Matriculación de estudiantes</li>
                            <li>• Consulta de reportes básicos</li>
                          </ul>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex justify-end space-x-3 mt-6">
                  {viewingUser.id !== user?.id && (
                    <Button
                      onClick={() => {
                        closeViewModal();
                        openEditModal(viewingUser);
                      }}
                      className="bg-blue-600 hover:bg-blue-700 text-white"
                    >
                      <Edit className="w-4 h-4 mr-2" />
                      Editar Usuario
                    </Button>
                  )}
                  <Button
                    variant="outline"
                    onClick={closeViewModal}
                  >
                    Cerrar
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Delete Confirmation Modal */}
        {showDeleteModal && userToDelete && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white dark:bg-gray-900 rounded-lg shadow-xl max-w-md w-full mx-4">
              <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                  Confirmar Eliminación
                </h2>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={closeDeleteModal}
                  disabled={deleteLoading}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>

              <div className="p-6">
                {/* Error Message */}
                {deleteError && (
                  <div className="flex items-center space-x-2 text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 p-3 rounded-lg mb-4">
                    <AlertCircle className="w-4 h-4" />
                    <span className="text-sm">{deleteError}</span>
                  </div>
                )}

                <div className="flex items-center space-x-3 mb-4">
                  <div className="w-12 h-12 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center">
                    <Trash2 className="w-6 h-6 text-red-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                      ¿Eliminar usuario?
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-300">
                      Esta acción no se puede deshacer.
                    </p>
                  </div>
                </div>

                <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 mb-6">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center">
                      <Users className="w-4 h-4 text-white" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">
                        {userToDelete.name}
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-300">
                        {userToDelete.email}
                      </p>
                      <div className="flex items-center space-x-2 mt-1">
                        {getRoleIcon(userToDelete.role)}
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          {getRoleLabel(userToDelete.role)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex space-x-3">
                  <Button
                    onClick={handleDeleteUser}
                    disabled={deleteLoading}
                    className="flex-1 bg-red-600 hover:bg-red-700 text-white"
                  >
                    {deleteLoading ? 'Eliminando...' : 'Eliminar Usuario'}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={closeDeleteModal}
                    disabled={deleteLoading}
                    className="flex-1"
                  >
                    Cancelar
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
