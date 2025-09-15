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
          <h1 className="text-2xl font-bold mb-2">Cargando...</h1>
          <p className="text-gray-600">Verificando autenticación...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-page">
      <header className="dashboard-header">
        <div className="header-container">
          <div className="header-info">
            <h1 className="header-title">CFP Fondo Común</h1>
            <p className="header-subtitle">Sistema de Gestión - Lago Puelo</p>
          </div>
          <div className="header-actions">
            <ThemeToggle />
            <Button variant="outline" onClick={handleLogout}>
              Cerrar Sesión
            </Button>
          </div>
        </div>
      </header>

      <main className="dashboard-main">
        <div className="welcome-section">
          <h2 className="welcome-title">
            Bienvenido, {user.name}
          </h2>
          <p className="welcome-subtitle">
            Rol: {user.role === UserRole.ADMIN ? 'Administrador' : 'Preceptor'}
          </p>
        </div>

        <div className="dashboard-grid">
          <Card className="dashboard-card">
            <CardHeader className="card-header">
              <CardTitle className="card-title">Información del Usuario</CardTitle>
              <CardDescription className="card-description">Detalles de tu cuenta</CardDescription>
            </CardHeader>
            <CardContent className="card-content">
              <div className="info-item">
                <span className="info-label">Email:</span>
                <p className="info-value">{user.email}</p>
              </div>
              <div className="info-item">
                <span className="info-label">Rol:</span>
                <p className="info-value">
                  {user.role === UserRole.ADMIN ? 'Administrador (Secretaría)' : 'Preceptor'}
                </p>
              </div>
              <div className="info-item">
                <span className="info-label">Estado:</span>
                <p className="info-value">
                  {user.isActive ? 'Activo' : 'Inactivo'}
                </p>
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
