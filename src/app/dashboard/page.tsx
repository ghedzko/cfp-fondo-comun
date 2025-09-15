'use client';

import { useAuth } from '@/providers/auth-provider';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/theme-toggle';
import { UserRole } from '@/providers/auth-provider';

export default function DashboardPage() {
  const { user, logout, isAdmin, isPreceptor } = useAuth();

  const handleLogout = async () => {
    await logout();
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Cargando...</h1>
          <p className="text-muted-foreground">Verificando autenticación...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold">CFP Fondo Común</h1>
            <p className="text-sm text-muted-foreground">Sistema de Gestión - Lagopuelo</p>
          </div>
          <div className="flex items-center gap-4">
            <ThemeToggle />
            <Button variant="outline" onClick={handleLogout}>
              Cerrar Sesión
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold mb-2">
            Bienvenido, {user.name}
          </h2>
          <p className="text-muted-foreground">
            Rol: {user.role === UserRole.ADMIN ? 'Administrador' : 'Preceptor'}
          </p>
        </div>

        {/* Dashboard Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* User Info Card */}
          <Card>
            <CardHeader>
              <CardTitle>Información del Usuario</CardTitle>
              <CardDescription>Detalles de tu cuenta</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div>
                  <span className="font-medium">Email:</span>
                  <p className="text-sm text-muted-foreground">{user.email}</p>
                </div>
                <div>
                  <span className="font-medium">Rol:</span>
                  <p className="text-sm text-muted-foreground">
                    {user.role === UserRole.ADMIN ? 'Administrador (Secretaría)' : 'Preceptor'}
                  </p>
                </div>
                <div>
                  <span className="font-medium">Estado:</span>
                  <p className="text-sm text-muted-foreground">
                    {user.isActive ? 'Activo' : 'Inactivo'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Admin Features */}
          {isAdmin && (
            <>
              <Card>
                <CardHeader>
                  <CardTitle>Gestión de Usuarios</CardTitle>
                  <CardDescription>Administrar usuarios del sistema</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-4">
                    Crear y gestionar cuentas de preceptores
                  </p>
                  <Button disabled className="w-full">
                    Próximamente
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Facturación</CardTitle>
                  <CardDescription>Generar facturas mensuales</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-4">
                    Crear facturas PDF y exportar CSV
                  </p>
                  <Button disabled className="w-full">
                    Próximamente
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Cursos</CardTitle>
                  <CardDescription>Gestionar cursos y períodos</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-4">
                    Crear cursos y habilitar meses
                  </p>
                  <Button disabled className="w-full">
                    Próximamente
                  </Button>
                </CardContent>
              </Card>
            </>
          )}

          {/* Preceptor Features */}
          {isPreceptor && (
            <>
              <Card>
                <CardHeader>
                  <CardTitle>Estudiantes</CardTitle>
                  <CardDescription>Gestionar estudiantes</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-4">
                    Registrar y gestionar estudiantes por DNI
                  </p>
                  <Button disabled className="w-full">
                    Próximamente
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Matrículas</CardTitle>
                  <CardDescription>Inscribir estudiantes a cursos</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-4">
                    Gestionar inscripciones de estudiantes
                  </p>
                  <Button disabled className="w-full">
                    Próximamente
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Aportes Voluntarios</CardTitle>
                  <CardDescription>Registrar aportes mensuales</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-4">
                    Cargar aportes voluntarios de estudiantes
                  </p>
                  <Button disabled className="w-full">
                    Próximamente
                  </Button>
                </CardContent>
              </Card>
            </>
          )}

          {/* System Status Card */}
          <Card>
            <CardHeader>
              <CardTitle>Estado del Sistema</CardTitle>
              <CardDescription>Información del sistema</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div>
                  <span className="font-medium">Fase Actual:</span>
                  <p className="text-sm text-muted-foreground">FASE 1 - Autenticación</p>
                </div>
                <div>
                  <span className="font-medium">Próxima Fase:</span>
                  <p className="text-sm text-muted-foreground">FASE 2 - Modelado de Dominio</p>
                </div>
                <div className="flex items-center gap-2 mt-4">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-sm text-muted-foreground">Sistema Operativo</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Development Notice */}
        <div className="mt-8 p-4 bg-muted rounded-lg">
          <h3 className="font-semibold mb-2">🚧 En Desarrollo</h3>
          <p className="text-sm text-muted-foreground">
            Este sistema está en desarrollo activo. Las funcionalidades se irán habilitando 
            progresivamente según el plan de fases establecido. Actualmente se encuentra 
            completada la FASE 1 (Autenticación y Usuarios).
          </p>
        </div>
      </main>
    </div>
  );
}
