'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/providers/auth-provider';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Search, Plus, User, GraduationCap, Calendar } from 'lucide-react';
import Link from 'next/link';

interface Estudiante {
  id: string;
  dni: string;
  nombre: string;
  apellido: string;
  email?: string;
  telefono?: string;
  fechaNacimiento?: string;
  createdAt: string;
  matriculas: Array<{
    id: string;
    estado: string;
    cursoPeriodo: {
      nombre: string;
      curso: {
        nombre: string;
      };
    };
  }>;
  _count: {
    aportes: number;
  };
}

interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  pages: number;
}

export default function EstudiantesPage() {
  const { user, isLoading } = useAuth();
  const [estudiantes, setEstudiantes] = useState<Estudiante[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [pagination, setPagination] = useState<PaginationInfo>({
    page: 1,
    limit: 10,
    total: 0,
    pages: 0,
  });

  const fetchEstudiantes = async (search = '', page = 1) => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        search,
        page: page.toString(),
        limit: '10',
      });

      const response = await fetch(`/api/estudiantes?${params}`);
      if (response.ok) {
        const data = await response.json();
        setEstudiantes(data.estudiantes);
        setPagination(data.pagination);
      }
    } catch (error) {
      console.error('Error fetching students:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!isLoading && user) {
      fetchEstudiantes();
    }
  }, [isLoading, user]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchEstudiantes(searchTerm, 1);
  };

  const handlePageChange = (newPage: number) => {
    fetchEstudiantes(searchTerm, newPage);
  };

  if (isLoading || loading) {
    return (
      <main role="main" className="estudiantes-page">
        <div className="container">
          <div className="loading">Cargando estudiantes...</div>
        </div>
      </main>
    );
  }

  return (
    <main role="main" className="estudiantes-page">
      <div className="container">
        <header className="page-header">
          <div className="header-content">
            <h1>Gestión de Estudiantes</h1>
            <p className="subtitle">
              Administra la información de estudiantes y sus matrículas
            </p>
          </div>
          <Link href="/dashboard/estudiantes/nuevo">
            <Button className="btn-primary" aria-label="Agregar nuevo estudiante">
              <Plus size={20} />
              Nuevo Estudiante
            </Button>
          </Link>
        </header>

        <section className="search-section" aria-label="Búsqueda de estudiantes">
          <Card>
            <CardContent className="search-content">
              <form onSubmit={handleSearch} className="search-form">
                <div className="search-input-group">
                  <Search size={20} className="search-icon" />
                  <Input
                    type="text"
                    placeholder="Buscar por DNI, nombre, apellido o email..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="search-input"
                    aria-label="Campo de búsqueda de estudiantes"
                  />
                </div>
                <Button type="submit" className="btn-secondary">
                  Buscar
                </Button>
              </form>
            </CardContent>
          </Card>
        </section>

        <section className="results-section" aria-label="Resultados de estudiantes">
          {estudiantes.length === 0 ? (
            <Card>
              <CardContent className="empty-state">
                <User size={48} className="empty-icon" />
                <h3>No se encontraron estudiantes</h3>
                <p>
                  {searchTerm 
                    ? 'No hay estudiantes que coincidan con tu búsqueda.'
                    : 'Aún no hay estudiantes registrados en el sistema.'
                  }
                </p>
                <Link href="/dashboard/estudiantes/nuevo">
                  <Button className="btn-primary">
                    <Plus size={20} />
                    Agregar Primer Estudiante
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ) : (
            <>
              <div className="students-grid">
                {estudiantes.map((estudiante) => (
                  <Card key={estudiante.id} className="student-card">
                    <CardHeader>
                      <div className="student-header">
                        <CardTitle className="student-name">
                          {estudiante.apellido}, {estudiante.nombre}
                        </CardTitle>
                        <Badge variant="outline" className="dni-badge">
                          DNI: {estudiante.dni}
                        </Badge>
                      </div>
                      {estudiante.email && (
                        <CardDescription>{estudiante.email}</CardDescription>
                      )}
                    </CardHeader>
                    <CardContent>
                      <div className="student-info">
                        {estudiante.telefono && (
                          <div className="info-item">
                            <span className="label">Teléfono:</span>
                            <span>{estudiante.telefono}</span>
                          </div>
                        )}
                        
                        <div className="info-item">
                          <span className="label">Matrículas:</span>
                          <span className="matriculas-count">
                            <GraduationCap size={16} />
                            {estudiante.matriculas.length}
                          </span>
                        </div>

                        <div className="info-item">
                          <span className="label">Aportes:</span>
                          <span className="aportes-count">
                            <Calendar size={16} />
                            {estudiante._count.aportes}
                          </span>
                        </div>

                        {estudiante.matriculas.length > 0 && (
                          <div className="current-courses">
                            <h4 className="sr-only">Cursos actuales</h4>
                            {estudiante.matriculas.slice(0, 2).map((matricula) => (
                              <Badge 
                                key={matricula.id} 
                                variant={matricula.estado === 'ACTIVA' ? 'default' : 'secondary'}
                                className="course-badge"
                              >
                                {matricula.cursoPeriodo.curso.nombre}
                              </Badge>
                            ))}
                            {estudiante.matriculas.length > 2 && (
                              <Badge variant="outline" className="more-courses">
                                +{estudiante.matriculas.length - 2} más
                              </Badge>
                            )}
                          </div>
                        )}
                      </div>

                      <div className="student-actions">
                        <Link href={`/dashboard/estudiantes/${estudiante.id}`}>
                          <Button variant="outline" size="sm" aria-label={`Ver detalles de ${estudiante.nombre} ${estudiante.apellido}`}>
                            Ver Detalles
                          </Button>
                        </Link>
                        <Link href={`/dashboard/estudiantes/${estudiante.id}/editar`}>
                          <Button variant="outline" size="sm" aria-label={`Editar ${estudiante.nombre} ${estudiante.apellido}`}>
                            Editar
                          </Button>
                        </Link>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {pagination.pages > 1 && (
                <nav className="pagination" aria-label="Navegación de páginas">
                  <div className="pagination-info">
                    Mostrando {((pagination.page - 1) * pagination.limit) + 1} - {Math.min(pagination.page * pagination.limit, pagination.total)} de {pagination.total} estudiantes
                  </div>
                  <div className="pagination-controls">
                    <Button
                      variant="outline"
                      onClick={() => handlePageChange(pagination.page - 1)}
                      disabled={pagination.page === 1}
                      aria-label="Página anterior"
                    >
                      Anterior
                    </Button>
                    <span className="page-indicator">
                      Página {pagination.page} de {pagination.pages}
                    </span>
                    <Button
                      variant="outline"
                      onClick={() => handlePageChange(pagination.page + 1)}
                      disabled={pagination.page === pagination.pages}
                      aria-label="Página siguiente"
                    >
                      Siguiente
                    </Button>
                  </div>
                </nav>
              )}
            </>
          )}
        </section>
      </div>
    </main>
  );
}
