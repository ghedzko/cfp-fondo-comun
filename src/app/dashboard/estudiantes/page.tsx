'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/providers/auth-provider';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ThemeToggle } from '@/components/theme-toggle';
import { 
  Search, 
  Plus, 
  User, 
  GraduationCap, 
  Calendar,
  ArrowLeft,
  Users,
  BookOpen,
  TrendingUp,
  Eye,
  Edit,
  Phone,
  Mail,
  IdCard,
  Filter
} from 'lucide-react';
import Link from 'next/link';

interface Student {
  id: string;
  dni: string;
  firstName: string;
  lastName: string;
  email?: string;
  phone?: string;
  birthDate?: string;
  createdAt: string;
  enrollments: Array<{
    id: string;
    status: string;
    coursePeriod: {
      name: string;
      course: {
        name: string;
      };
    };
  }>;
  _count: {
    contributions: number;
  };
}

interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  pages: number;
}

export default function EstudiantesPage() {
  const { user, logout, isLoading } = useAuth();
  const [estudiantes, setEstudiantes] = useState<Student[]>([]);
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
        setEstudiantes(data.students || []);
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

  const handleLogout = async () => {
    await logout();
  };

  if (isLoading || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
        <Card className="max-w-md">
          <CardContent className="p-6 text-center">
            <Users className="w-16 h-16 text-blue-500 mx-auto mb-4 animate-pulse" />
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              Cargando estudiantes...
            </h2>
            <p className="text-gray-600 dark:text-gray-300">
              Obteniendo información de estudiantes
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Calculate stats
  const totalEnrollments = estudiantes.reduce((sum, student) => sum + student.enrollments.length, 0);
  const totalContributions = estudiantes.reduce((sum, student) => sum + student._count.contributions, 0);
  const activeStudents = estudiantes.filter(student => 
    student.enrollments.some(enrollment => enrollment.status === 'ACTIVE')
  ).length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      {/* Header */}
      <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border-b border-gray-200 dark:border-gray-700 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-4">
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
                  <Users className="w-6 h-6 mr-2 text-blue-600" />
                  Gestión de Estudiantes
                </h1>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  CFP Fondo Común - Lago Puelo
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <Link href="/dashboard/estudiantes/nuevo">
                <Button className="bg-green-600 hover:bg-green-700 text-white">
                  <Plus className="w-4 h-4 mr-2" />
                  Nuevo Estudiante
                </Button>
              </Link>
              <ThemeToggle />
              <Button variant="outline" onClick={handleLogout} size="sm">
                Cerrar Sesión
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white border-0">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-100 text-sm font-medium">Total Estudiantes</p>
                  <p className="text-3xl font-bold">{estudiantes.length}</p>
                </div>
                <Users className="w-8 h-8 text-blue-200" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white border-0">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-100 text-sm font-medium">Estudiantes Activos</p>
                  <p className="text-3xl font-bold">{activeStudents}</p>
                </div>
                <GraduationCap className="w-8 h-8 text-green-200" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-r from-purple-500 to-purple-600 text-white border-0">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-100 text-sm font-medium">Total Matrículas</p>
                  <p className="text-3xl font-bold">{totalEnrollments}</p>
                </div>
                <BookOpen className="w-8 h-8 text-purple-200" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-r from-orange-500 to-orange-600 text-white border-0">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-orange-100 text-sm font-medium">Total Aportes</p>
                  <p className="text-3xl font-bold">{totalContributions}</p>
                </div>
                <Calendar className="w-8 h-8 text-orange-200" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search Bar */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  type="text"
                  placeholder="Buscar por DNI, nombre, apellido o email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white">
                <Search className="w-4 h-4 mr-2" />
                Buscar
              </Button>
              <Button type="button" variant="outline">
                <Filter className="w-4 h-4 mr-2" />
                Filtros
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Students Grid */}
        {estudiantes.length === 0 ? (
          <Card className="text-center py-12">
            <CardContent>
              <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                {searchTerm ? 'No se encontraron estudiantes' : 'No hay estudiantes registrados'}
              </h3>
              <p className="text-gray-600 dark:text-gray-300 mb-6">
                {searchTerm 
                  ? 'No hay estudiantes que coincidan con tu búsqueda.'
                  : 'Comienza agregando el primer estudiante al sistema.'
                }
              </p>
              <Link href="/dashboard/estudiantes/nuevo">
                <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                  <Plus className="w-4 h-4 mr-2" />
                  {searchTerm ? 'Agregar Estudiante' : 'Agregar Primer Estudiante'}
                </Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {estudiantes.map((student: Student) => (
                <Card key={student.id} className="group hover:shadow-lg transition-all duration-200 border-0 shadow-md hover:shadow-xl hover:-translate-y-1">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-lg font-semibold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                          {student.lastName}, {student.firstName}
                        </CardTitle>
                        <div className="mt-2 flex items-center space-x-2">
                          <Badge variant="outline" className="text-xs">
                            <IdCard className="w-3 h-3 mr-1" />
                            {student.dni}
                          </Badge>
                        </div>
                      </div>
                      <div className="ml-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
                          <User className="w-5 h-5 text-white" />
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  
                  <CardContent className="pt-0">
                    {/* Contact Info */}
                    <div className="space-y-2 mb-4">
                      {student.email && (
                        <div className="flex items-center text-sm text-gray-600 dark:text-gray-300">
                          <Mail className="w-4 h-4 mr-2 text-gray-400" />
                          <span className="truncate">{student.email}</span>
                        </div>
                      )}
                      {student.phone && (
                        <div className="flex items-center text-sm text-gray-600 dark:text-gray-300">
                          <Phone className="w-4 h-4 mr-2 text-gray-400" />
                          <span>{student.phone}</span>
                        </div>
                      )}
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-2 gap-3 mb-4">
                      <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3">
                        <div className="flex items-center space-x-2">
                          <GraduationCap className="w-4 h-4 text-blue-500" />
                          <div>
                            <p className="text-xs text-gray-500 dark:text-gray-400">Matrículas</p>
                            <p className="text-lg font-semibold text-gray-900 dark:text-white">
                              {student.enrollments.length}
                            </p>
                          </div>
                        </div>
                      </div>
                      
                      <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3">
                        <div className="flex items-center space-x-2">
                          <Calendar className="w-4 h-4 text-green-500" />
                          <div>
                            <p className="text-xs text-gray-500 dark:text-gray-400">Aportes</p>
                            <p className="text-lg font-semibold text-gray-900 dark:text-white">
                              {student._count.contributions}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Current Courses */}
                    {student.enrollments.length > 0 && (
                      <div className="mb-4">
                        <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">Cursos actuales:</p>
                        <div className="flex flex-wrap gap-1">
                          {student.enrollments.slice(0, 2).map((enrollment) => (
                            <Badge 
                              key={enrollment.id} 
                              variant={enrollment.status === 'ACTIVE' ? 'default' : 'secondary'}
                              className="text-xs"
                            >
                              {enrollment.coursePeriod.course.name}
                            </Badge>
                          ))}
                          {student.enrollments.length > 2 && (
                            <Badge variant="outline" className="text-xs">
                              +{student.enrollments.length - 2} más
                            </Badge>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Actions */}
                    <div className="flex gap-2">
                      <Link href={`/dashboard/estudiantes/${student.id}`} className="flex-1">
                        <Button variant="outline" size="sm" className="w-full">
                          <Eye className="w-4 h-4 mr-2" />
                          Ver Detalles
                        </Button>
                      </Link>
                      <Link href={`/dashboard/estudiantes/${student.id}/editar`}>
                        <Button size="sm" className="bg-blue-600 hover:bg-blue-700 text-white">
                          <Edit className="w-4 h-4 mr-2" />
                          Editar
                        </Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Pagination */}
            {pagination.pages > 1 && (
              <Card>
                <CardContent className="p-6">
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="text-sm text-gray-600 dark:text-gray-300">
                      Mostrando {((pagination.page - 1) * pagination.limit) + 1} - {Math.min(pagination.page * pagination.limit, pagination.total)} de {pagination.total} estudiantes
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="outline"
                        onClick={() => handlePageChange(pagination.page - 1)}
                        disabled={pagination.page === 1}
                        size="sm"
                      >
                        Anterior
                      </Button>
                      <span className="text-sm text-gray-600 dark:text-gray-300 px-3">
                        Página {pagination.page} de {pagination.pages}
                      </span>
                      <Button
                        variant="outline"
                        onClick={() => handlePageChange(pagination.page + 1)}
                        disabled={pagination.page === pagination.pages}
                        size="sm"
                      >
                        Siguiente
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </>
        )}
      </div>
    </div>
  );
}
