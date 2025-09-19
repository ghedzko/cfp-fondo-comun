'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/providers/auth-provider';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { TableSkeleton } from '@/components/loading-spinner';
import { ThemeToggle } from '@/components/theme-toggle';
import { Breadcrumb } from '@/components/breadcrumb';
import { 
  GraduationCap, 
  Search, 
  Filter, 
  Users,
  BookOpen,
  Calendar,
  User,
  Eye,
  ArrowLeft,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  UserCheck,
  UserX,
  Clock
} from 'lucide-react';
import Link from 'next/link';
import { formatDate } from '@/lib/format';

interface Enrollment {
  id: string;
  enrollmentDate: string;
  status: string;
  notes: string | null;
  student: {
    id: string;
    firstName: string;
    lastName: string;
    dni: string;
    email: string | null;
    phone: string | null;
    isActive: boolean;
  };
  coursePeriod: {
    id: string;
    name: string;
    startDate: string;
    endDate: string;
    monthlyPrice: number;
    course: {
      id: string;
      name: string;
      description: string | null;
    };
  };
}

interface EnrollmentsResponse {
  enrollments: Enrollment[];
  pagination: {
    page: number;
    limit: number;
    totalCount: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

interface Course {
  id: string;
  name: string;
}

export default function MatriculasPage() {
  const { user, logout } = useAuth();
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ACTIVE');
  const [courseFilter, setCourseFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState<EnrollmentsResponse['pagination'] | null>(null);

  const fetchEnrollments = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: '20',
        status: statusFilter,
      });

      if (searchTerm) {
        params.append('search', searchTerm);
      }

      if (courseFilter) {
        params.append('courseId', courseFilter);
      }

      const response = await fetch(`/api/matriculas?${params}`, {
        credentials: 'include',
      });
      
      if (!response.ok) {
        throw new Error('Error al cargar las matrículas');
      }

      const data: EnrollmentsResponse = await response.json();
      setEnrollments(data.enrollments);
      setPagination(data.pagination);
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      setLoading(false);
    }
  }, [currentPage, searchTerm, statusFilter, courseFilter]);

  const fetchCourses = useCallback(async () => {
    try {
      const response = await fetch('/api/cursos', {
        credentials: 'include',
      });
      
      if (response.ok) {
        const data = await response.json();
        setCourses(data.courses || []);
      }
    } catch (err) {
      console.error('Error fetching courses:', err);
    }
  }, []);

  useEffect(() => {
    fetchEnrollments();
  }, [fetchEnrollments]);

  useEffect(() => {
    fetchCourses();
  }, [fetchCourses]);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">Activa</Badge>;
      case 'COMPLETED':
        return <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">Completada</Badge>;
      case 'CANCELLED':
        return <Badge className="bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200">Cancelada</Badge>;
      case 'SUSPENDED':
        return <Badge className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">Suspendida</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getPeriodStatus = (startDate: string, endDate: string) => {
    const now = new Date();
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    if (now < start) {
      return { status: 'upcoming', label: 'Próximo', color: 'text-blue-600' };
    } else if (now > end) {
      return { status: 'finished', label: 'Finalizado', color: 'text-gray-600' };
    } else {
      return { status: 'active', label: 'En curso', color: 'text-green-600' };
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
        <Card className="max-w-md">
          <CardContent className="p-6 text-center">
            <GraduationCap className="w-16 h-16 text-blue-500 mx-auto mb-4 animate-pulse" />
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              Cargando...
            </h2>
            <p className="text-gray-600 dark:text-gray-300">
              Verificando autenticación
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      {/* Header */}
      <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border-b border-gray-200 dark:border-gray-700 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex flex-col space-y-3">
            <Breadcrumb items={[{ label: 'Matrículas', icon: GraduationCap }]} />
            
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <Link href="/dashboard">
                  <Button variant="ghost" size="sm" className="text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white">
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Dashboard
                  </Button>
                </Link>
                <div className="h-6 w-px bg-gray-300 dark:bg-gray-600" />
                <div>
                  <h1 className="text-xl font-bold text-gray-900 dark:text-white flex items-center">
                    <GraduationCap className="w-6 h-6 mr-2 text-blue-600" />
                    Gestión de Matrículas
                  </h1>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    CFP Fondo Común - Lago Puelo
                  </p>
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                <ThemeToggle />
                <Button variant="outline" onClick={logout} size="sm">
                  Cerrar Sesión
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-6">
        {/* Filters */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="w-5 h-5 text-blue-600" />
              Filtros
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Buscar estudiante, DNI o curso..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>

              {/* Status Filter */}
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              >
                <option value="ALL">Todos los estados</option>
                <option value="ACTIVE">Activas</option>
                <option value="COMPLETED">Completadas</option>
                <option value="CANCELLED">Canceladas</option>
                <option value="SUSPENDED">Suspendidas</option>
              </select>

              {/* Course Filter */}
              <select
                value={courseFilter}
                onChange={(e) => setCourseFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              >
                <option value="">Todos los cursos</option>
                {courses.map((course) => (
                  <option key={course.id} value={course.id}>
                    {course.name}
                  </option>
                ))}
              </select>

              {/* Reset Filters */}
              <Button
                variant="outline"
                onClick={() => {
                  setSearchTerm('');
                  setStatusFilter('ACTIVE');
                  setCourseFilter('');
                  setCurrentPage(1);
                }}
              >
                Limpiar Filtros
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Results */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Users className="w-5 h-5 text-green-600" />
                  Matrículas
                  {pagination && (
                    <span className="text-sm font-normal text-gray-500 dark:text-gray-400">
                      ({pagination.totalCount} total)
                    </span>
                  )}
                </CardTitle>
                <CardDescription>
                  Lista de todas las matrículas del sistema
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <TableSkeleton />
            ) : error ? (
              <div className="text-center py-8">
                <div className="text-red-500 mb-4">
                  <Users className="w-12 h-12 mx-auto mb-2" />
                  <p className="text-lg font-semibold">Error al cargar matrículas</p>
                  <p className="text-sm">{error}</p>
                </div>
                <Button onClick={fetchEnrollments} variant="outline">
                  Reintentar
                </Button>
              </div>
            ) : enrollments.length === 0 ? (
              <div className="text-center py-8">
                <GraduationCap className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500 dark:text-gray-400">
                  No se encontraron matrículas con los filtros aplicados
                </p>
              </div>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-200 dark:border-gray-700">
                        <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white">
                          Estudiante
                        </th>
                        <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white">
                          Curso
                        </th>
                        <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white">
                          Período
                        </th>
                        <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white">
                          Estado
                        </th>
                        <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white">
                          Fecha de Matrícula
                        </th>
                        <th className="text-right py-3 px-4 font-medium text-gray-900 dark:text-white">
                          Acciones
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {enrollments.map((enrollment) => {
                        const periodStatus = getPeriodStatus(
                          enrollment.coursePeriod.startDate,
                          enrollment.coursePeriod.endDate
                        );
                        
                        return (
                          <tr
                            key={enrollment.id}
                            className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50"
                          >
                            <td className="py-4 px-4">
                              <div className="flex items-center space-x-3">
                                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center">
                                  <User className="w-4 h-4 text-white" />
                                </div>
                                <div>
                                  <div className="font-medium text-gray-900 dark:text-white">
                                    {enrollment.student.firstName} {enrollment.student.lastName}
                                  </div>
                                  <div className="text-sm text-gray-500 dark:text-gray-400">
                                    DNI: {enrollment.student.dni}
                                  </div>
                                </div>
                              </div>
                            </td>
                            
                            <td className="py-4 px-4">
                              <div>
                                <div className="font-medium text-gray-900 dark:text-white">
                                  {enrollment.coursePeriod.course.name}
                                </div>
                                {enrollment.coursePeriod.course.description && (
                                  <div className="text-sm text-gray-500 dark:text-gray-400">
                                    {enrollment.coursePeriod.course.description}
                                  </div>
                                )}
                              </div>
                            </td>
                            
                            <td className="py-4 px-4">
                              <div>
                                <div className="font-medium text-gray-900 dark:text-white">
                                  {enrollment.coursePeriod.name}
                                </div>
                                <div className="text-sm text-gray-500 dark:text-gray-400">
                                  {formatDate(enrollment.coursePeriod.startDate)} - {formatDate(enrollment.coursePeriod.endDate)}
                                </div>
                                <div className={`text-xs font-medium ${periodStatus.color}`}>
                                  {periodStatus.label}
                                </div>
                              </div>
                            </td>
                            
                            <td className="py-4 px-4">
                              <div className="flex flex-col space-y-1">
                                {getStatusBadge(enrollment.status)}
                                <div className="flex items-center space-x-1">
                                  {enrollment.student.isActive ? (
                                    <UserCheck className="w-3 h-3 text-green-500" />
                                  ) : (
                                    <UserX className="w-3 h-3 text-red-500" />
                                  )}
                                  <span className="text-xs text-gray-500 dark:text-gray-400">
                                    {enrollment.student.isActive ? 'Activo' : 'Inactivo'}
                                  </span>
                                </div>
                              </div>
                            </td>
                            
                            <td className="py-4 px-4">
                              <span className="text-sm text-gray-600 dark:text-gray-300">
                                {formatDate(enrollment.enrollmentDate)}
                              </span>
                            </td>
                            
                            <td className="py-4 px-4 text-right">
                              <div className="flex items-center justify-end space-x-2">
                                <Link href={`/dashboard/estudiantes/${enrollment.student.id}`}>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    title="Ver perfil del estudiante"
                                  >
                                    <Eye className="w-3 h-3" />
                                  </Button>
                                </Link>
                                <Link href={`/dashboard/cursos/${enrollment.coursePeriod.course.id}/periodos/${enrollment.coursePeriod.id}`}>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    title="Ver período del curso"
                                  >
                                    <BookOpen className="w-3 h-3" />
                                  </Button>
                                </Link>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                {/* Pagination */}
                {pagination && pagination.totalPages > 1 && (
                  <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
                    <div className="text-sm text-gray-600 dark:text-gray-300">
                      Mostrando {((pagination.page - 1) * pagination.limit) + 1} a{' '}
                      {Math.min(pagination.page * pagination.limit, pagination.totalCount)} de{' '}
                      {pagination.totalCount} matrículas
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentPage(pagination.page - 1)}
                        disabled={!pagination.hasPrev}
                      >
                        <ChevronLeft className="w-4 h-4" />
                        Anterior
                      </Button>
                      
                      <span className="text-sm text-gray-600 dark:text-gray-300">
                        Página {pagination.page} de {pagination.totalPages}
                      </span>
                      
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentPage(pagination.page + 1)}
                        disabled={!pagination.hasNext}
                      >
                        Siguiente
                        <ChevronRight className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
