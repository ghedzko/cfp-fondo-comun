'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/providers/auth-provider';
import { useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ThemeToggle } from '@/components/theme-toggle';
import { Breadcrumb } from '@/components/breadcrumb';
import { 
  ArrowLeft, 
  Plus, 
  Calendar, 
  Users, 
  DollarSign, 
  BookOpen,
  GraduationCap,
  Clock,
  TrendingUp,
  Eye,
  UserPlus,
  Settings,
  MapPin,
  Award,
  Activity
} from 'lucide-react';
import Link from 'next/link';

interface CoursePeriod {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  monthlyPrice: number;
  isActive: boolean;
  _count: {
    enrollments: number;
  };
}

interface Course {
  id: string;
  name: string;
  description: string | null;
  duration: number;
  price: number;
  isActive: boolean;
  periods: CoursePeriod[];
  _count: {
    periods: number;
  };
}

export default function CursoDetailPage() {
  const { user, logout, isAdmin } = useAuth();
  const params = useParams();
  const cursoId = params.id as string;
  
  const [curso, setCurso] = useState<Course | null>(null);
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
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
        <Card className="max-w-md">
          <CardContent className="p-6 text-center">
            <BookOpen className="w-16 h-16 text-blue-500 mx-auto mb-4 animate-pulse" />
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              Cargando curso...
            </h2>
            <p className="text-gray-600 dark:text-gray-300">
              Obteniendo información del curso
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error || !curso) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
        <Card className="max-w-md">
          <CardContent className="p-6 text-center">
            <Activity className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              Error
            </h2>
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              {error || 'Curso no encontrado'}
            </p>
            <Link href="/dashboard/cursos">
              <Button variant="outline">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Volver a Cursos
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Calculate stats
  const totalEnrollments = curso.periods.reduce((sum, period) => sum + period._count.enrollments, 0);
  const activePeriods = curso.periods.filter(p => p.isActive).length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      {/* Header */}
      <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border-b border-gray-200 dark:border-gray-700 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex flex-col space-y-3">
            <Breadcrumb items={[
              { label: 'Cursos', href: '/dashboard/cursos' },
              { label: curso.name }
            ]} />
            
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <Link href="/dashboard/cursos">
                  <Button variant="ghost" size="sm" className="text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white">
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Cursos
                  </Button>
                </Link>
                <div className="h-6 w-px bg-gray-300 dark:bg-gray-600" />
                <div>
                  <h1 className="text-xl font-bold text-gray-900 dark:text-white flex items-center">
                    <GraduationCap className="w-6 h-6 mr-2 text-blue-600" />
                    {curso.name}
                  </h1>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    {curso.description || 'Sin descripción disponible'}
                  </p>
                </div>
              </div>
            
            <div className="flex items-center space-x-3">
              {isAdmin && (
                <Link href={`/dashboard/cursos/${curso.id}/nuevo-periodo`}>
                  <Button className="bg-green-600 hover:bg-green-700 text-white">
                    <Plus className="w-4 h-4 mr-2" />
                    Nueva Cursada
                  </Button>
                </Link>
              )}
              <ThemeToggle />
              <Button variant="outline" onClick={handleLogout} size="sm">
                Cerrar Sesión
              </Button>
            </div>
          </div>
        </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-6">
        {/* Course Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white border-0">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-100 text-sm font-medium">Cursadas Totales</p>
                  <p className="text-3xl font-bold">{curso._count.periods}</p>
                </div>
                <Calendar className="w-8 h-8 text-blue-200" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white border-0">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-100 text-sm font-medium">Cursadas Activas</p>
                  <p className="text-3xl font-bold">{activePeriods}</p>
                </div>
                <Activity className="w-8 h-8 text-green-200" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-r from-purple-500 to-purple-600 text-white border-0">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-100 text-sm font-medium">Total Estudiantes</p>
                  <p className="text-3xl font-bold">{totalEnrollments}</p>
                </div>
                <Users className="w-8 h-8 text-purple-200" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-r from-orange-500 to-orange-600 text-white border-0">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-orange-100 text-sm font-medium">Duración</p>
                  <p className="text-2xl font-bold">{curso.duration} meses</p>
                </div>
                <Clock className="w-8 h-8 text-orange-200" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Course Information */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-blue-600" />
                Información del Curso
              </CardTitle>
              <CardDescription>
                Detalles generales y configuración del programa académico
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/20 rounded-lg flex items-center justify-center">
                      <Clock className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Duración</p>
                      <p className="font-semibold text-gray-900 dark:text-white">{curso.duration} meses</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-green-100 dark:bg-green-900/20 rounded-lg flex items-center justify-center">
                      <DollarSign className="w-5 h-5 text-green-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Precio Base</p>
                      <p className="font-semibold text-gray-900 dark:text-white">{formatCurrency(curso.price)}</p>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/20 rounded-lg flex items-center justify-center">
                      <Award className="w-5 h-5 text-purple-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Estado</p>
                      <Badge variant={curso.isActive ? 'default' : 'secondary'} className="mt-1">
                        {curso.isActive ? 'Activo' : 'Inactivo'}
                      </Badge>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-orange-100 dark:bg-orange-900/20 rounded-lg flex items-center justify-center">
                      <Calendar className="w-5 h-5 text-orange-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Total Cursadas</p>
                      <p className="font-semibold text-gray-900 dark:text-white">{curso._count.periods}</p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-green-600" />
                Resumen Rápido
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="text-center p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{totalEnrollments}</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Estudiantes matriculados</p>
                </div>
                
                <div className="text-center p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{activePeriods}</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Cursadas activas</p>
                </div>
                
                {isAdmin && (
                  <Link href={`/dashboard/cursos/${curso.id}/nuevo-periodo`} className="block">
                    <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white">
                      <Plus className="w-4 h-4 mr-2" />
                      Nueva Cursada
                    </Button>
                  </Link>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Course Periods */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-blue-600" />
                  Cursadas del Programa
                </CardTitle>
                <CardDescription>
                  Gestiona las diferentes cursadas e instancias de este curso
                </CardDescription>
              </div>
              {isAdmin && curso.periods.length > 0 && (
                <Link href={`/dashboard/cursos/${curso.id}/nuevo-periodo`}>
                  <Button className="bg-green-600 hover:bg-green-700 text-white">
                    <Plus className="w-4 h-4 mr-2" />
                    Nueva Cursada
                  </Button>
                </Link>
              )}
            </div>
          </CardHeader>
          
          <CardContent>
            {curso.periods.length === 0 ? (
              <div className="text-center py-12">
                <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                  No hay cursadas creadas
                </h3>
                <p className="text-gray-600 dark:text-gray-300 mb-6">
                  Crea la primera cursada para comenzar a gestionar estudiantes y aportes
                </p>
                {isAdmin && (
                  <Link href={`/dashboard/cursos/${curso.id}/nuevo-periodo`}>
                    <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                      <Plus className="w-4 h-4 mr-2" />
                      Crear Primera Cursada
                    </Button>
                  </Link>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {curso.periods.map((period: CoursePeriod) => (
                  <Card key={period.id} className="group hover:shadow-lg transition-all duration-200 border-0 shadow-md hover:shadow-xl hover:-translate-y-1">
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <CardTitle className="text-lg font-semibold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                            {period.name}
                          </CardTitle>
                          <div className="mt-2">
                            <Badge variant={period.isActive ? 'default' : 'secondary'}>
                              {period.isActive ? 'Activa' : 'Inactiva'}
                            </Badge>
                          </div>
                        </div>
                        <div className="ml-3">
                          <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-green-600 rounded-lg flex items-center justify-center">
                            <Calendar className="w-5 h-5 text-white" />
                          </div>
                        </div>
                      </div>
                    </CardHeader>
                    
                    <CardContent className="pt-0">
                      {/* Stats */}
                      <div className="grid grid-cols-2 gap-3 mb-4">
                        <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3">
                          <div className="flex items-center space-x-2">
                            <Users className="w-4 h-4 text-blue-500" />
                            <div>
                              <p className="text-xs text-gray-500 dark:text-gray-400">Estudiantes</p>
                              <p className="text-lg font-semibold text-gray-900 dark:text-white">
                                {period._count.enrollments}
                              </p>
                            </div>
                          </div>
                        </div>
                        
                        <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3">
                          <div className="flex items-center space-x-2">
                            <DollarSign className="w-4 h-4 text-green-500" />
                            <div>
                              <p className="text-xs text-gray-500 dark:text-gray-400">Mensual</p>
                              <p className="text-sm font-medium text-gray-900 dark:text-white">
                                {formatCurrency(period.monthlyPrice)}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Dates */}
                      <div className="space-y-2 mb-4">
                        <div className="flex items-center text-sm text-gray-600 dark:text-gray-300">
                          <MapPin className="w-4 h-4 mr-2 text-gray-400" />
                          <span className="font-medium">Inicio:</span>
                          <span className="ml-2">{formatDate(period.startDate)}</span>
                        </div>
                        <div className="flex items-center text-sm text-gray-600 dark:text-gray-300">
                          <MapPin className="w-4 h-4 mr-2 text-gray-400" />
                          <span className="font-medium">Fin:</span>
                          <span className="ml-2">{formatDate(period.endDate)}</span>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex gap-2">
                        <Link href={`/dashboard/cursos/${curso.id}/periodos/${period.id}`} className="flex-1">
                          <Button variant="outline" size="sm" className="w-full">
                            <Eye className="w-4 h-4 mr-2" />
                            Ver Detalles
                          </Button>
                        </Link>
                        {isAdmin && (
                          <Link href={`/dashboard/cursos/${curso.id}/periodos/${period.id}/matricular`}>
                            <Button size="sm" className="bg-blue-600 hover:bg-blue-700 text-white">
                              <UserPlus className="w-4 h-4 mr-2" />
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
          </CardContent>
        </Card>

        {/* Development Notice */}
        <Card className="mt-8 bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 border-amber-200 dark:border-amber-800">
          <CardContent className="p-6">
            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0">
                <Settings className="w-6 h-6 text-amber-600 dark:text-amber-400" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-amber-900 dark:text-amber-100 mb-2">
                  🚧 Funcionalidades en Desarrollo
                </h3>
                <p className="text-amber-800 dark:text-amber-200 leading-relaxed">
                  La gestión completa de cursadas está siendo implementada. Actualmente puedes crear 
                  cursadas con selección de meses habilitados y matricular estudiantes. Las funcionalidades 
                  de gestión de aportes y reportes avanzados estarán disponibles próximamente.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
