'use client';

import { useState } from 'react';
import { useAuth } from '@/providers/auth-provider';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ChangePasswordForm } from '@/components/change-password-form';
import { 
  User, 
  Mail, 
  Shield, 
  Calendar, 
  Lock, 
  Edit,
  Crown,
  GraduationCap,
  CheckCircle
} from 'lucide-react';
import { UserRole } from '@prisma/client';

export default function ProfilePage() {
  const { user, logout } = useAuth();
  const [showChangePassword, setShowChangePassword] = useState(false);

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Cargando...</h1>
          <p className="text-gray-600 dark:text-gray-300">Verificando autenticación...</p>
        </div>
      </div>
    );
  }

  const getRoleIcon = (role: UserRole) => {
    switch (role) {
      case UserRole.ADMIN:
        return <Crown className="w-5 h-5 text-yellow-500" />;
      case UserRole.PRECEPTOR:
        return <GraduationCap className="w-5 h-5 text-blue-500" />;
      default:
        return <User className="w-5 h-5 text-gray-500" />;
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

  const handlePasswordChangeSuccess = async () => {
    // After password change, logout user to force re-login
    await logout();
  };

  if (showChangePassword) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 p-6">
        <div className="max-w-2xl mx-auto">
          <div className="mb-6">
            <Button
              variant="outline"
              onClick={() => setShowChangePassword(false)}
              className="mb-4"
            >
              ← Volver al Perfil
            </Button>
          </div>
          
          <ChangePasswordForm
            onSuccess={handlePasswordChangeSuccess}
            onCancel={() => setShowChangePassword(false)}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <div className="max-w-4xl mx-auto p-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center space-x-3">
            <User className="w-8 h-8 text-blue-600" />
            <span>Mi Perfil</span>
          </h1>
          <p className="text-gray-600 dark:text-gray-300 mt-2">
            Gestiona tu información personal y configuración de cuenta
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Profile Information */}
          <div className="lg:col-span-2">
            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <User className="w-5 h-5" />
                  <span>Información Personal</span>
                </CardTitle>
                <CardDescription>
                  Tu información básica en el sistema
                </CardDescription>
              </CardHeader>
              
              <CardContent className="space-y-6">
                {/* Name */}
                <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                      <User className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Nombre completo</p>
                      <p className="font-medium text-gray-900 dark:text-white">{user.name}</p>
                    </div>
                  </div>
                  <Button size="sm" variant="outline" disabled>
                    <Edit className="w-3 h-3 mr-1" />
                    Editar
                  </Button>
                </div>

                {/* Email */}
                <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center">
                      <Mail className="w-5 h-5 text-green-600 dark:text-green-400" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Email</p>
                      <p className="font-medium text-gray-900 dark:text-white">{user.email}</p>
                    </div>
                  </div>
                  <Button size="sm" variant="outline" disabled>
                    <Edit className="w-3 h-3 mr-1" />
                    Editar
                  </Button>
                </div>

                {/* Role */}
                <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900 rounded-full flex items-center justify-center">
                      {getRoleIcon(user.role)}
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Rol en el sistema</p>
                      <p className="font-medium text-gray-900 dark:text-white">{getRoleLabel(user.role)}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span className="text-sm text-green-600 dark:text-green-400">Activo</span>
                  </div>
                </div>

                {/* Account Created */}
                <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center">
                      <Calendar className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Miembro desde</p>
                      <p className="font-medium text-gray-900 dark:text-white">
                        {new Date(user.createdAt).toLocaleDateString('es-AR', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Security Section */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Shield className="w-5 h-5" />
                  <span>Seguridad</span>
                </CardTitle>
                <CardDescription>
                  Configuración de seguridad de tu cuenta
                </CardDescription>
              </CardHeader>
              
              <CardContent>
                <div className="space-y-4">
                  {/* Change Password */}
                  <div className="flex items-center justify-between p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                        <Lock className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">Contraseña</p>
                        <p className="text-sm text-gray-600 dark:text-gray-300">
                          Actualiza tu contraseña regularmente para mantener tu cuenta segura
                        </p>
                      </div>
                    </div>
                    <Button
                      onClick={() => setShowChangePassword(true)}
                      className="bg-blue-600 hover:bg-blue-700 text-white"
                    >
                      <Lock className="w-4 h-4 mr-2" />
                      Cambiar
                    </Button>
                  </div>

                  {/* Security Tips */}
                  <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
                    <h4 className="font-medium text-yellow-800 dark:text-yellow-200 mb-2">
                      Consejos de Seguridad
                    </h4>
                    <ul className="text-sm text-yellow-700 dark:text-yellow-300 space-y-1">
                      <li>• Usa contraseñas únicas y complejas</li>
                      <li>• Cambia tu contraseña cada 3-6 meses</li>
                      <li>• No compartas tus credenciales con nadie</li>
                      <li>• Cierra sesión al usar computadoras compartidas</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Stats */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Resumen de Actividad</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                    {user.role === UserRole.ADMIN ? '👑' : '👤'}
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                    {getRoleLabel(user.role)}
                  </p>
                </div>
                
                <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-300">Estado</span>
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span className="text-green-600 dark:text-green-400 font-medium">Activo</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Permissions */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Permisos</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {user.role === UserRole.ADMIN ? (
                    <>
                      <div className="flex items-center space-x-2 text-sm">
                        <CheckCircle className="w-4 h-4 text-green-500" />
                        <span>Gestión completa del sistema</span>
                      </div>
                      <div className="flex items-center space-x-2 text-sm">
                        <CheckCircle className="w-4 h-4 text-green-500" />
                        <span>Administrar usuarios</span>
                      </div>
                      <div className="flex items-center space-x-2 text-sm">
                        <CheckCircle className="w-4 h-4 text-green-500" />
                        <span>Acceso a auditoría</span>
                      </div>
                      <div className="flex items-center space-x-2 text-sm">
                        <CheckCircle className="w-4 h-4 text-green-500" />
                        <span>Generar facturas</span>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="flex items-center space-x-2 text-sm">
                        <CheckCircle className="w-4 h-4 text-green-500" />
                        <span>Gestión de estudiantes</span>
                      </div>
                      <div className="flex items-center space-x-2 text-sm">
                        <CheckCircle className="w-4 h-4 text-green-500" />
                        <span>Gestión de aportes</span>
                      </div>
                      <div className="flex items-center space-x-2 text-sm">
                        <CheckCircle className="w-4 h-4 text-green-500" />
                        <span>Ver reportes</span>
                      </div>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
