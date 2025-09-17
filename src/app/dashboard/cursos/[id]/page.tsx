'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/providers/auth-provider';
import { useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ThemeToggle } from '@/components/theme-toggle';
import { ArrowLeft, Plus, Calendar, Users, DollarSign, BookOpen } from 'lucide-react';
import Link from 'next/link';

interface CursoPeriodo {
  id: string;
  nombre: string;
  fechaInicio: string;
  fechaFin: string;
  precioMensual: number;
  isActive: boolean;
  _count: {
    matriculas: number;
  };
}

interface Curso {
  id: string;
  nombre: string;
  descripcion: string | null;
  duracion: number;
  precio: number;
  isActive: boolean;
  periodos: CursoPeriodo[];
  _count: {
    periodos: number;
  };
}

export default function CursoDetailPage() {
  const { user, logout, isAdmin } = useAuth();
  const params = useParams();
  const cursoId = params.id as string;
  
  const [curso, setCurso] = useState<Curso | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (cursoId) {
      fetchCurso();
    }
  }, [cursoId]);

  const fetchCurso = async () => {
    try {
      const response = await fetch(`/api/cursos/${cursoId}`, {
        credentials: 'include',
      });
      
      if (response.ok) {
        const data = await response.json();
        setCurso(data);
      } else {
        setError('Curso no encontrado');
      }
    } catch (err) {
      setError('Error al cargar el curso');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await logout();
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-AR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS'
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="dashboard-page">
        <div className="loading-container">
          <div className="loading-content">
            <h1>Cargando...</h1>
            <p>Obteniendo información del curso...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !curso) {
    return (
      <div className="dashboard-page">
        <div className="error-container">
          <div className="error-content">
            <h1>Error</h1>
            <p>{error || 'Curso no encontrado'}</p>
            <Link href="/dashboard/cursos">
              <Button variant="outline">
                Volver a Cursos
              </Button>
            </Link>
          </div>
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
            <Link href="/dashboard/cursos">
              <Button variant="outline" size="sm">
                <ArrowLeft size={16} />
                Volver a Cursos
              </Button>
            </Link>
            <Link href="/dashboard">
              <Button variant="outline" size="sm">
                Dashboard
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
        <section className="welcome-section" aria-labelledby="curso-heading">
          <div className="course-header">
            <div>
              <h2 id="curso-heading" className="welcome-title">
                {curso.nombre}
              </h2>
              <p className="welcome-subtitle">
                {curso.descripcion || 'Sin descripción disponible'}
              </p>
            </div>
            {isAdmin && (
              <Link href={`/dashboard/cursos/${curso.id}/nuevo-periodo`}>
                <Button className="btn-primary">
                  <Plus size={20} />
                  Nuevo Período
                </Button>
              </Link>
            )}
          </div>
        </section>

        {/* Course Information */}
        <section className="dashboard-grid" aria-labelledby="course-info-heading">
          <h3 id="course-info-heading" className="sr-only">Información del curso</h3>
          
          <Card className="course-info-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen size={20} />
                Información General
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="course-details">
                <div className="detail-item">
                  <strong>Duración:</strong>
                  <span>{curso.duracion} meses</span>
                </div>
                <div className="detail-item">
                  <strong>Precio Base:</strong>
                  <span>{formatCurrency(curso.precio)}</span>
                </div>
                <div className="detail-item">
                  <strong>Estado:</strong>
                  <Badge variant={curso.isActive ? 'default' : 'secondary'}>
                    {curso.isActive ? 'Activo' : 'Inactivo'}
                  </Badge>
                </div>
                <div className="detail-item">
                  <strong>Total Períodos:</strong>
                  <span>{curso._count.periodos}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Course Periods */}
        <section className="periods-section" aria-labelledby="periods-heading">
          <div className="section-header">
            <h3 id="periods-heading">Períodos del Curso</h3>
            <p className="section-description">
              Gestiona los diferentes períodos y cohortes de este curso
            </p>
          </div>

          {curso.periodos.length === 0 ? (
            <Card>
              <CardContent className="text-center py-8">
                <Calendar size={48} className="mx-auto mb-4 text-muted-foreground" />
                <h4>No hay períodos creados</h4>
                <p className="text-muted-foreground mb-4">
                  Crea el primer período para comenzar a gestionar estudiantes y aportes.
                </p>
                {isAdmin && (
                  <Link href={`/dashboard/cursos/${curso.id}/nuevo-periodo`}>
                    <Button className="btn-primary">
                      <Plus size={20} />
                      Crear Primer Período
                    </Button>
                  </Link>
                )}
              </CardContent>
            </Card>
          ) : (
            <div className="periods-grid">
              {curso.periodos.map((periodo) => (
                <Card key={periodo.id} className="period-card">
                  <CardHeader>
                    <div className="period-header">
                      <CardTitle className="period-name">
                        {periodo.nombre}
                      </CardTitle>
                      <Badge variant={periodo.isActive ? 'default' : 'secondary'}>
                        {periodo.isActive ? 'Activo' : 'Inactivo'}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="period-info">
                      <div className="info-item">
                        <Calendar size={16} />
                        <span className="label">Inicio:</span>
                        <span>{formatDate(periodo.fechaInicio)}</span>
                      </div>
                      
                      <div className="info-item">
                        <Calendar size={16} />
                        <span className="label">Fin:</span>
                        <span>{formatDate(periodo.fechaFin)}</span>
                      </div>

                      <div className="info-item">
                        <DollarSign size={16} />
                        <span className="label">Precio Mensual:</span>
                        <span>{formatCurrency(periodo.precioMensual)}</span>
                      </div>

                      <div className="info-item">
                        <Users size={16} />
                        <span className="label">Estudiantes:</span>
                        <span>{periodo._count.matriculas}</span>
                      </div>
                    </div>

                    <div className="period-actions">
                      <Link href={`/dashboard/cursos/${curso.id}/periodos/${periodo.id}`}>
                        <Button variant="outline" size="sm">
                          Ver Detalles
                        </Button>
                      </Link>
                      {isAdmin && (
                        <Link href={`/dashboard/cursos/${curso.id}/periodos/${periodo.id}/matricular`}>
                          <Button variant="outline" size="sm">
                            Matricular
                          </Button>
                        </Link>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </section>

        <section className="development-notice" aria-labelledby="dev-notice-heading">
          <div className="development-notice-content">
            <h3 id="dev-notice-heading">🚧 FASE 4 - En Desarrollo</h3>
            <p>
              La gestión completa de períodos de curso está en desarrollo. Actualmente puedes 
              crear períodos con selección de meses habilitados. Las funcionalidades de 
              matriculación masiva y gestión de aportes se habilitarán en las próximas fases.
            </p>
          </div>
        </section>
      </main>
    </div>
  );
}
