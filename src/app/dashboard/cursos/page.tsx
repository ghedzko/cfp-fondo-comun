'use client';

import { useAuth } from '@/providers/auth-provider';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/theme-toggle';

interface Curso {
  id: string;
  nombre: string;
  descripcion: string | null;
  createdAt: string;
  updatedAt: string;
  _count: {
    periodos: number;
  };
}

export default function CursosPage() {
  const { user, logout, isAdmin } = useAuth();
  const [cursos, setCursos] = useState<Curso[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchCursos();
  }, []);

  const fetchCursos = async () => {
    try {
      const response = await fetch('/api/cursos', {
        credentials: 'include',
      });
      
      if (!response.ok) {
        throw new Error('Error al cargar cursos');
      }
      
      const data = await response.json();
      setCursos(data.cursos || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      setLoading(false);
    }
  };

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
            <p className="header-subtitle">Gestión de Cursos - Lago Puelo</p>
          </div>
          <div className="header-actions">
            <Link href="/dashboard">
              <Button variant="outline" size="sm">
                Volver al Dashboard
              </Button>
            </Link>
            <ThemeToggle />
            <Button variant="outline" onClick={handleLogout} aria-label="Cerrar sesión del usuario">
              Cerrar Sesión
            </Button>
          </div>
        </nav>
      </header>

      <main className="dashboard-main" role="main">
        <section className="welcome-section" aria-labelledby="cursos-heading">
          <h2 id="cursos-heading" className="welcome-title">
            Gestión de Cursos
          </h2>
          <p className="welcome-subtitle">
            Administrar cursos y períodos académicos
          </p>
        </section>

        {error && (
          <div className="error-message" role="alert">
            {error}
          </div>
        )}

        {loading ? (
          <div className="loading-container">
            <p>Cargando cursos...</p>
          </div>
        ) : (
          <section className="dashboard-grid" aria-labelledby="cursos-list-heading">
            <h3 id="cursos-list-heading" className="sr-only">Lista de cursos</h3>
            
            {cursos.length === 0 ? (
              <Card>
                <CardContent className="text-center py-8">
                  <h3>No hay cursos registrados</h3>
                  <p>Aún no se han creado cursos en el sistema.</p>
                  {isAdmin && (
                    <Button disabled className="mt-4">
                      Crear Curso (Próximamente)
                    </Button>
                  )}
                </CardContent>
              </Card>
            ) : (
              <div className="courses-grid">
                {cursos.map((curso) => (
                  <Card key={curso.id} className="course-card">
                    <CardHeader>
                      <h3>{curso.nombre}</h3>
                      <CardDescription>
                        {curso.descripcion || 'Sin descripción'}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="course-stats">
                        <div className="stat-item">
                          <strong>Períodos:</strong>
                          <span>{curso._count.periodos}</span>
                        </div>
                        <div className="stat-item">
                          <strong>Estado:</strong>
                          <span>Activo</span>
                        </div>
                      </div>
                      <div className="course-actions">
                        <Button variant="outline" size="sm" disabled>
                          Ver Detalles
                        </Button>
                        {isAdmin && (
                          <Button variant="outline" size="sm" disabled>
                            Editar
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </section>
        )}

        <section className="development-notice" aria-labelledby="dev-notice-heading">
          <div className="development-notice-content">
            <h3 id="dev-notice-heading">🚧 En Desarrollo</h3>
            <p>
              La gestión completa de cursos está en desarrollo. Actualmente puedes ver 
              los cursos existentes. Las funcionalidades de creación, edición y gestión 
              de períodos se habilitarán en las próximas fases.
            </p>
          </div>
        </section>
      </main>
    </div>
  );
}
