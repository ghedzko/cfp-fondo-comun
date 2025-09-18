'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/providers/auth-provider';
import { useParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { AccessibleTextarea } from '@/components/accessible-form';
import { ThemeToggle } from '@/components/theme-toggle';
import { ArrowLeft, Plus, Trash2, Users, UserPlus, AlertCircle, CheckCircle } from 'lucide-react';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';

interface Student {
  dni: string;
  firstName: string;
  lastName: string;
  email?: string;
  phone?: string;
  address?: string;
  birthDate?: string;
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
  const router = useRouter();
  const cursoId = params.id as string;
  const periodoId = params.periodoId as string;
  
  const [coursePeriod, setCoursePeriod] = useState<CoursePeriod | null>(null);
  const [students, setStudents] = useState<Student[]>([{
    dni: '',
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    birthDate: ''
  }]);
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState<EnrollmentResult | null>(null);

  useEffect(() => {
    if (cursoId && periodoId) {
      fetchCoursePeriod();
    }
  }, [cursoId, periodoId]);

  const fetchCoursePeriod = async () => {
    try {
      const response = await fetch(`/api/cursos/${cursoId}/periodos/${periodoId}`, {
        credentials: 'include',
      });
      
      if (response.ok) {
        const data = await response.json();
        setCoursePeriod(data);
      } else {
        setError('Período de curso no encontrado');
      }
    } catch (err) {
      setError('Error al cargar el período de curso');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await logout();
  };

  const addStudent = () => {
    setStudents([...students, {
      dni: '',
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      address: '',
      birthDate: ''
    }]);
  };

  const removeStudent = (index: number) => {
    if (students.length > 1) {
      setStudents(students.filter((_, i) => i !== index));
    }
  };

  const updateStudent = (index: number, field: keyof Student, value: string) => {
    const updatedStudents = [...students];
    updatedStudents[index] = { ...updatedStudents[index], [field]: value };
    setStudents(updatedStudents);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    setResult(null);

    try {
      // Filter out empty students
      const validStudents = students.filter(student => 
        student.dni.trim() && student.firstName.trim() && student.lastName.trim()
      );

      if (validStudents.length === 0) {
        setError('Debe agregar al menos un estudiante válido');
        return;
      }

      const response = await fetch(`/api/cursos/${periodoId}/matriculas`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          students: validStudents,
          notes: notes.trim() || undefined,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setResult(data);
        
        // Clear form if all successful
        if (data.errors.length === 0) {
          setStudents([{
            dni: '',
            firstName: '',
            lastName: '',
            email: '',
            phone: '',
            address: '',
            birthDate: ''
          }]);
          setNotes('');
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
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Acceso Denegado</h1>
          <p className="text-gray-600 dark:text-gray-300 mb-4">Solo los administradores pueden matricular estudiantes.</p>
          <Link href="/dashboard">
            <Button variant="outline">Volver al Dashboard</Button>
          </Link>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Cargando...</h1>
          <p className="text-gray-600 dark:text-gray-300">Obteniendo información del período...</p>
        </div>
      </div>
    );
  }

  if (error && !coursePeriod) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Error</h1>
          <p className="text-gray-600 dark:text-gray-300 mb-4">{error}</p>
          <Link href={`/dashboard/cursos/${cursoId}`}>
            <Button variant="outline">Volver al Curso</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Header */}
      <header className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-700 sticky top-0 z-50">
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8" role="navigation" aria-label="Navegación del dashboard">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                CFP Fondo Común
              </h1>
              <span className="text-gray-400">•</span>
              <span className="text-gray-600 dark:text-gray-300">Matricular Estudiantes</span>
            </div>
            <div className="flex items-center space-x-4">
              <Link href={`/dashboard/cursos/${cursoId}`}>
                <Button variant="outline" size="sm">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Volver al Curso
                </Button>
              </Link>
              <ThemeToggle />
              <Button 
                onClick={handleLogout}
                variant="outline"
                size="sm"
                className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
              >
                Cerrar Sesión
              </Button>
            </div>
          </div>
        </nav>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8" role="main">
        {/* Course Period Info */}
        {coursePeriod && (
          <div className="mb-8">
            <Card className="border-0 shadow-lg bg-gradient-to-r from-blue-600 to-purple-600 text-white">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl font-bold mb-2">
                      {coursePeriod.course.name}
                    </h2>
                    <p className="text-blue-100 mb-2">
                      Período: {coursePeriod.name}
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
          </div>
        )}

        {/* Enrollment Results */}
        {result && (
          <div className="mb-8">
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  Resultado de Matriculación
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                      {result.summary.total}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-300">Total Procesados</div>
                  </div>
                  <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                    <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                      {result.summary.successful}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-300">Exitosos</div>
                  </div>
                  <div className="text-center p-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
                    <div className="text-2xl font-bold text-red-600 dark:text-red-400">
                      {result.summary.failed}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-300">Fallidos</div>
                  </div>
                </div>

                {result.errors.length > 0 && (
                  <div>
                    <h4 className="font-semibold text-red-600 dark:text-red-400 mb-2">Errores:</h4>
                    <div className="space-y-2">
                      {result.errors.map((error, index) => (
                        <div key={index} className="flex items-center gap-2 p-2 bg-red-50 dark:bg-red-900/20 rounded">
                          <AlertCircle className="w-4 h-4 text-red-500" />
                          <span className="text-sm">
                            <strong>DNI {error.dni}:</strong> {error.error}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}

        {/* Enrollment Form */}
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UserPlus className="w-5 h-5" />
              Matricular Estudiantes
            </CardTitle>
            <CardDescription>
              Agregue los datos de los estudiantes que desea matricular en este período.
              Los estudiantes existentes serán actualizados automáticamente.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Students */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label className="text-base font-semibold">Estudiantes</Label>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={addStudent}
                    className="flex items-center gap-2"
                  >
                    <Plus className="w-4 h-4" />
                    Agregar Estudiante
                  </Button>
                </div>

                {students.map((student, index) => (
                  <Card key={index} className="p-4 bg-gray-50 dark:bg-gray-800/50">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="font-medium">Estudiante {index + 1}</h4>
                      {students.length > 1 && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeStudent(index)}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      <div>
                        <Label htmlFor={`dni-${index}`}>DNI *</Label>
                        <Input
                          id={`dni-${index}`}
                          value={student.dni}
                          onChange={(e) => updateStudent(index, 'dni', e.target.value)}
                          placeholder="12345678"
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor={`firstName-${index}`}>Nombre *</Label>
                        <Input
                          id={`firstName-${index}`}
                          value={student.firstName}
                          onChange={(e) => updateStudent(index, 'firstName', e.target.value)}
                          placeholder="Juan"
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor={`lastName-${index}`}>Apellido *</Label>
                        <Input
                          id={`lastName-${index}`}
                          value={student.lastName}
                          onChange={(e) => updateStudent(index, 'lastName', e.target.value)}
                          placeholder="Pérez"
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor={`email-${index}`}>Email</Label>
                        <Input
                          id={`email-${index}`}
                          type="email"
                          value={student.email}
                          onChange={(e) => updateStudent(index, 'email', e.target.value)}
                          placeholder="juan@email.com"
                        />
                      </div>
                      <div>
                        <Label htmlFor={`phone-${index}`}>Teléfono</Label>
                        <Input
                          id={`phone-${index}`}
                          value={student.phone}
                          onChange={(e) => updateStudent(index, 'phone', e.target.value)}
                          placeholder="+54 9 11 1234-5678"
                        />
                      </div>
                      <div>
                        <Label htmlFor={`birthDate-${index}`}>Fecha de Nacimiento</Label>
                        <Input
                          id={`birthDate-${index}`}
                          type="date"
                          value={student.birthDate}
                          onChange={(e) => updateStudent(index, 'birthDate', e.target.value)}
                        />
                      </div>
                      <div className="md:col-span-2 lg:col-span-3">
                        <Label htmlFor={`address-${index}`}>Dirección</Label>
                        <Input
                          id={`address-${index}`}
                          value={student.address}
                          onChange={(e) => updateStudent(index, 'address', e.target.value)}
                          placeholder="Calle 123, Ciudad"
                        />
                      </div>
                    </div>
                  </Card>
                ))}
              </div>

              {/* Notes */}
              <div>
                <AccessibleTextarea
                  label="Observaciones"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Observaciones adicionales sobre la matriculación..."
                  rows={3}
                />
              </div>

              {/* Error Display */}
              {error && (
                <div className="flex items-center gap-2 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                  <AlertCircle className="w-5 h-5 text-red-500" />
                  <span className="text-red-700 dark:text-red-300">{error}</span>
                </div>
              )}

              {/* Submit Button */}
              <div className="flex gap-4">
                <Button
                  type="submit"
                  disabled={submitting}
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                >
                  {submitting ? 'Matriculando...' : 'Matricular Estudiantes'}
                </Button>
                <Link href={`/dashboard/cursos/${cursoId}`}>
                  <Button type="button" variant="outline">
                    Cancelar
                  </Button>
                </Link>
              </div>
            </form>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
