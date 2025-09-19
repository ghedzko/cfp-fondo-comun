'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/providers/auth-provider';
import { useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { ThemeToggle } from '@/components/theme-toggle';
import { 
  ArrowLeft, 
  Search,
  Users, 
  UserPlus, 
  AlertCircle, 
  CheckCircle,
  User,
  Mail,
  Phone,
  IdCard,
  GraduationCap,
  Calendar,
  Plus,
  Eye
} from 'lucide-react';
import Link from 'next/link';

interface ExistingStudent {
  id: string;
  dni: string;
  firstName: string;
  lastName: string;
  email?: string;
  phone?: string;
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
}

interface CoursePeriod {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  monthlyPrice: number;
  course: {
    id: string;
    name: string;
  };
}

interface EnrollmentResult {
  success: any[];
  errors: Array<{ dni: string; error: string }>;
  summary: {
    total: number;
    successful: number;
    failed: number;
  };
}

export default function MatricularPage() {
  const { user, logout, isAdmin } = useAuth();
  const params = useParams();
  const cursoId = params.id as string;
  const periodoId = params.periodoId as string;

  const [coursePeriod, setCoursePeriod] = useState<CoursePeriod | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<EnrollmentResult | null>(null);
  
  // Tab state
  const [activeTab, setActiveTab] = useState<'existing' | 'new'>('existing');
  
  // Existing students state
  const [existingStudents, setExistingStudents] = useState<ExistingStudent[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStudents, setSelectedStudents] = useState<Set<string>>(new Set());
  const [loadingStudents, setLoadingStudents] = useState(false);

  const handleLogout = async () => {
    await logout();
  };

  useEffect(() => {
    if (periodoId) {
      fetchCoursePeriod();
    }
  }, [periodoId]);

  useEffect(() => {
    if (activeTab === 'existing') {
      fetchExistingStudents();
    }
  }, [activeTab, searchTerm]);

  const fetchCoursePeriod = async () => {
    try {
      const response = await fetch(`/api/cursos/${cursoId}/periodos/${periodoId}`, {
        credentials: 'include',
      });
      
      if (response.ok) {
        const data = await response.json();
        setCoursePeriod(data);
      } else {
        setError('Período no encontrado');
      }
    } catch (err) {
      setError('Error al cargar el período');
    } finally {
      setLoading(false);
    }
  };

  const fetchExistingStudents = async () => {
    try {
      setLoadingStudents(true);
      const params = new URLSearchParams({
        search: searchTerm,
        limit: '50',
      });

      const response = await fetch(`/api/estudiantes?${params}`, {
        credentials: 'include',
      });
      
      if (response.ok) {
        const data = await response.json();
        setExistingStudents(data.students || []);
      }
    } catch (err) {
      console.error('Error fetching students:', err);
    } finally {
      setLoadingStudents(false);
    }
  };

  const handleStudentSelection = (studentId: string) => {
    const newSelected = new Set(selectedStudents);
    if (newSelected.has(studentId)) {
      newSelected.delete(studentId);
    } else {
      newSelected.add(studentId);
    }
    setSelectedStudents(newSelected);
  };

  const handleEnrollExistingStudents = async () => {
    if (selectedStudents.size === 0) {
      setError('Debe seleccionar al menos un estudiante');
      return;
    }

    setSubmitting(true);
    setError('');
    setResult(null);

    try {
      const studentsToEnroll = Array.from(selectedStudents).map(studentId => {
        const student = existingStudents.find(s => s.id === studentId);
        return {
          id: studentId,
          dni: student?.dni,
          firstName: student?.firstName,
          lastName: student?.lastName,
          email: student?.email,
          phone: student?.phone,
        };
      });

      const response = await fetch(`/api/cursos/${periodoId}/matriculas`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          students: studentsToEnroll,
          existingStudents: true,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setResult(data);
        
        // Clear selection if all successful
        if (data.errors.length === 0) {
          setSelectedStudents(new Set());
        }
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Error al matricular estudiantes');
      }
    } catch (err) {
      setError('Error de conexión');
    } finally {
      setSubmitting(false);
    }
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

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
        <Card className="max-w-md">
          <CardContent className="p-6 text-center">
            <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              Acceso Denegado
            </h2>
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              Solo los administradores pueden matricular estudiantes.
            </p>
            <Link href="/dashboard">
              <Button variant="outline">Volver al Dashboard</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
        <Card className="max-w-md">
          <CardContent className="p-6 text-center">
            <Users className="w-16 h-16 text-blue-500 mx-auto mb-4 animate-pulse" />
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              Cargando...
            </h2>
            <p className="text-gray-600 dark:text-gray-300">
              Obteniendo información del período
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error && !coursePeriod) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
        <Card className="max-w-md">
          <CardContent className="p-6 text-center">
            <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              Error
            </h2>
            <p className="text-gray-600 dark:text-gray-300 mb-4">{error}</p>
            <Link href={`/dashboard/cursos/${cursoId}`}>
              <Button variant="outline">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Volver al Curso
              </Button>
            </Link>
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
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link href={`/dashboard/cursos/${cursoId}`}>
                <Button variant="ghost" size="sm" className="text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Volver al Curso
                </Button>
              </Link>
              <div className="h-6 w-px bg-gray-300 dark:bg-gray-600" />
              <div>
                <h1 className="text-xl font-bold text-gray-900 dark:text-white flex items-center">
                  <UserPlus className="w-6 h-6 mr-2 text-blue-600" />
                  Matricular Estudiantes
                </h1>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  CFP Fondo Común - Lago Puelo
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <ThemeToggle />
              <Button variant="outline" onClick={handleLogout} size="sm">
                Cerrar Sesión
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-6">
        {/* Course Period Info */}
        {coursePeriod && (
          <Card className="mb-8 bg-gradient-to-r from-blue-600 to-purple-600 text-white border-0">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold mb-2">
                    {coursePeriod.course.name}
                  </h2>
                  <p className="text-blue-100 mb-2">
                    Cursada: {coursePeriod.name}
                  </p>
                  <div className="flex items-center space-x-6 text-sm">
                    <span>Inicio: {formatDate(coursePeriod.startDate)}</span>
                    <span>Fin: {formatDate(coursePeriod.endDate)}</span>
                    <span>Precio: {formatCurrency(coursePeriod.monthlyPrice)}/mes</span>
                  </div>
                </div>
                <div className="hidden lg:block">
                  <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center">
                    <Users className="w-8 h-8 text-white" />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Tab Navigation */}
        <div className="mb-6">
          <div className="flex space-x-1 bg-gray-100 dark:bg-gray-800 p-1 rounded-lg">
            <button
              onClick={() => setActiveTab('existing')}
              className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                activeTab === 'existing'
                  ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
                  : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              <Search className="w-4 h-4 inline mr-2" />
              Estudiantes Existentes
            </button>
            <button
              onClick={() => setActiveTab('new')}
              className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                activeTab === 'new'
                  ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
                  : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              <Plus className="w-4 h-4 inline mr-2" />
              Nuevos Estudiantes
            </button>
          </div>
        </div>

        {/* Tab Content */}
        {activeTab === 'existing' ? (
          <div className="space-y-6">
            {/* Search Bar */}
            <Card>
              <CardContent className="p-6">
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <Input
                      type="text"
                      placeholder="Buscar por DNI, nombre o apellido..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  <Button 
                    onClick={handleEnrollExistingStudents}
                    disabled={selectedStudents.size === 0 || submitting}
                    className="bg-green-600 hover:bg-green-700 text-white"
                  >
                    <UserPlus className="w-4 h-4 mr-2" />
                    Matricular Seleccionados ({selectedStudents.size})
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Students List */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="w-5 h-5 text-blue-600" />
                  Estudiantes Disponibles
                </CardTitle>
                <CardDescription>
                  Selecciona los estudiantes que deseas matricular en esta cursada
                </CardDescription>
              </CardHeader>
              <CardContent>
                {loadingStudents ? (
                  <div className="text-center py-8">
                    <Users className="w-12 h-12 text-gray-300 mx-auto mb-4 animate-pulse" />
                    <p className="text-gray-600 dark:text-gray-300">Buscando estudiantes...</p>
                  </div>
                ) : existingStudents.length === 0 ? (
                  <div className="text-center py-8">
                    <User className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                      {searchTerm ? 'No se encontraron estudiantes' : 'No hay estudiantes registrados'}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-300">
                      {searchTerm 
                        ? 'Intenta con otros términos de búsqueda.'
                        : 'Primero debes registrar estudiantes en el sistema.'
                      }
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {existingStudents.map((student) => (
                      <div
                        key={student.id}
                        className={`border rounded-lg p-4 cursor-pointer transition-all ${
                          selectedStudents.has(student.id)
                            ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                            : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                        }`}
                        onClick={() => handleStudentSelection(student.id)}
                      >
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex-1">
                            <h4 className="font-semibold text-gray-900 dark:text-white">
                              {student.lastName}, {student.firstName}
                            </h4>
                            <div className="flex items-center mt-1">
                              <Badge variant="outline" className="text-xs">
                                <IdCard className="w-3 h-3 mr-1" />
                                {student.dni}
                              </Badge>
                            </div>
                          </div>
                          <div className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
                            selectedStudents.has(student.id)
                              ? 'bg-blue-600 border-blue-600'
                              : 'border-gray-300 dark:border-gray-600'
                          }`}>
                            {selectedStudents.has(student.id) && (
                              <CheckCircle className="w-3 h-3 text-white" />
                            )}
                          </div>
                        </div>

                        <div className="space-y-1 text-sm text-gray-600 dark:text-gray-300">
                          {student.email && (
                            <div className="flex items-center">
                              <Mail className="w-3 h-3 mr-2" />
                              <span className="truncate">{student.email}</span>
                            </div>
                          )}
                          {student.phone && (
                            <div className="flex items-center">
                              <Phone className="w-3 h-3 mr-2" />
                              <span>{student.phone}</span>
                            </div>
                          )}
                        </div>

                        {student.enrollments.length > 0 && (
                          <div className="mt-3">
                            <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                              Cursos actuales:
                            </p>
                            <div className="flex flex-wrap gap-1">
                              {student.enrollments.slice(0, 2).map((enrollment) => (
                                <Badge 
                                  key={enrollment.id} 
                                  variant="secondary"
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
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Plus className="w-5 h-5 text-green-600" />
                Crear Nuevos Estudiantes
              </CardTitle>
              <CardDescription>
                Esta funcionalidad estará disponible próximamente. Por ahora, usa la pestaña &quot;Estudiantes Existentes&quot; para matricular estudiantes ya registrados en el sistema.
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center py-12">
              <UserPlus className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                Funcionalidad en Desarrollo
              </h3>
              <p className="text-gray-600 dark:text-gray-300 mb-6">
                Mientras tanto, puedes crear estudiantes desde la página de gestión de estudiantes y luego matricularlos aquí.
              </p>
              <Link href="/dashboard/estudiantes/nuevo">
                <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                  <Plus className="w-4 h-4 mr-2" />
                  Ir a Crear Estudiante
                </Button>
              </Link>
            </CardContent>
          </Card>
        )}

        {/* Results */}
        {error && (
          <Card className="mt-6 border-red-200 bg-red-50 dark:bg-red-900/20">
            <CardContent className="p-4">
              <div className="flex items-center">
                <AlertCircle className="w-5 h-5 text-red-500 mr-2" />
                <p className="text-red-700 dark:text-red-300">{error}</p>
              </div>
            </CardContent>
          </Card>
        )}

        {result && (
          <Card className="mt-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-green-600" />
                Resultado de la Matriculación
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-4 mb-4">
                <div className="text-center">
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {result.summary.total}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-300">Total</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-green-600">
                    {result.summary.successful}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-300">Exitosos</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-red-600">
                    {result.summary.failed}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-300">Fallidos</p>
                </div>
              </div>

              {result.errors.length > 0 && (
                <div className="mt-4">
                  <h4 className="font-semibold text-red-600 mb-2">Errores:</h4>
                  <ul className="space-y-1">
                    {result.errors.map((error, index) => (
                      <li key={index} className="text-sm text-red-600">
                        DNI {error.dni}: {error.error}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
