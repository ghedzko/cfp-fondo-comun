'use client';

import { useAuth } from '@/providers/auth-provider';
import { Card, CardContent, CardDescription, CardHeader } from '@/components/ui/card';
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
      <div className="loading-container">
        <div className="loading-content">
          <h1>Cargando...</h1>
          <p>Verificando autenticación...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-page">
      <header className="dashboard-header">
        <nav className="header-container" role="navigation" aria-label="Navegación del dashboard">
          <div className="header-info">
            <h1 className="header-title">CFP Fondo Común</h1>
            <p className="header-subtitle">Sistema de Gestión - Lago Puelo</p>
          </div>
          <div className="header-actions">
            <ThemeToggle />
            <Button variant="outline" onClick={handleLogout} aria-label="Cerrar sesión del usuario">
              Cerrar Sesión
            </Button>
          </div>
        </nav>
      </header>

      <main className="dashboard-main" role="main">
        <section className="welcome-section" aria-labelledby="welcome-heading">
          <h2 id="welcome-heading" className="welcome-title">
            Bienvenido, {user.name}
          </h2>
          <p className="welcome-subtitle">
            Rol: {user.role === UserRole.ADMIN ? 'Administrador' : 'Preceptor'}
          </p>
        </section>

        <section className="dashboard-grid" aria-labelledby="main-features-heading">
          <h2 id="main-features-heading" className="sr-only">Funciones principales</h2>
          
          <Card className="user-info-card">
            <CardHeader>
              <h3>Información del Usuario</h3>
              <CardDescription>Detalles de tu cuenta</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="user-details">
                <div className="detail-item">
                  <strong>Email:</strong>
                  <span>{user.email}</span>
                </div>
                <div className="detail-item">
                  <strong>Rol:</strong>
                  <span>{user.role === UserRole.ADMIN ? 'Administrador' : 'Preceptor'} (Secretaría)</span>
                </div>
                <div className="detail-item">
                  <strong>Estado:</strong>
                  <span>{user.isActive ? 'Activo' : 'Inactivo'}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {isAdmin && (
            <>
              <Card className="feature-card">
                <CardHeader>
                  <h3>Gestión de Usuarios</h3>
                  <CardDescription>Administrar usuarios del sistema</CardDescription>
                </CardHeader>
                <CardContent>
                  <p>Crear y gestionar cuentas de preceptores</p>
                  <Button className="feature-button" disabled aria-label="Gestión de usuarios - Próximamente disponible">
                    Próximamente
                  </Button>
                </CardContent>
              </Card>

              <Card className="feature-card">
                <CardHeader>
                  <h3>Facturación</h3>
                  <CardDescription>Generar facturas mensuales</CardDescription>
                </CardHeader>
                <CardContent>
                  <p>Crear facturas PDF y exportar CSV</p>
                  <Button className="feature-button" disabled aria-label="Facturación - Próximamente disponible">
                    Próximamente
                  </Button>
                </CardContent>
              </Card>
            </>
          )}

          {(isPreceptor || isAdmin) && (
            <>
              <Card className="feature-card">
                <CardHeader>
                  <h3>Estudiantes</h3>
                  <CardDescription>Gestionar estudiantes</CardDescription>
                </CardHeader>
                <CardContent>
                  <p>Registrar y gestionar estudiantes por DNI</p>
                  <Button className="feature-button" disabled aria-label="Gestión de estudiantes - Próximamente disponible">
                    Próximamente
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <h3>Matrículas</h3>
                  <CardDescription>Inscribir estudiantes a cursos</CardDescription>
                </CardHeader>
                <CardContent>
                  <p>
                    Gestionar inscripciones de estudiantes
                  </p>
                  <Button disabled aria-label="Gestión de matrículas - Próximamente disponible">
                    Próximamente
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <h3>Aportes Voluntarios</h3>
                  <CardDescription>Registrar aportes mensuales</CardDescription>
                </CardHeader>
                <CardContent>
                  <p>
                    Cargar aportes voluntarios de estudiantes
                  </p>
                  <Button disabled aria-label="Gestión de aportes voluntarios - Próximamente disponible">
                    Próximamente
                  </Button>
                </CardContent>
              </Card>
            </>
          )}

          {/* System Status Card */}
          <Card>
            <CardHeader>
              <h3>Estado del Sistema</h3>
              <CardDescription>Información del sistema</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="system-info">
                <div>
                  <span><strong>Fase Actual:</strong></span>
                  <p>FASE 1 - Autenticación</p>
                </div>
                <div>
                  <span><strong>Próxima Fase:</strong></span>
                  <p>FASE 2 - Modelado de Dominio</p>
                </div>
                <div className="status-indicator">
                  <div className="status-dot"></div>
                  <span>Sistema Operativo</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

        {isAdmin && (
          <section className="dashboard-grid" aria-labelledby="preceptor-functions-heading">
            <h2 id="preceptor-functions-heading" className="section-title">Funciones de Secretaría</h2>
            <p className="section-description">Como administrador, también tienes acceso a todas las funciones de secretaría</p>
          </section>
        )}

        <section className="development-notice" aria-labelledby="dev-notice-heading">
          <div className="development-notice-content">
            <h3 id="dev-notice-heading">🚧 En Desarrollo</h3>
            <p>
              Este sistema está en desarrollo activo. Las funcionalidades se irán habilitando 
              progresivamente según el plan de fases establecido. Actualmente se encuentra 
              completada la FASE 1 (Autenticación y Usuarios).
            </p>
          </div>
        </section>
      </main>
    </div>
  );
}
