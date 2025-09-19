'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/providers/auth-provider';
import { useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Breadcrumb } from '@/components/breadcrumb';
import { 
  ArrowLeft, 
  User, 
  Mail,
  Phone,
  MapPin,
  Calendar,
  GraduationCap,
  DollarSign,
  BookOpen,
  TrendingUp,
  Eye,
  Edit,
  UserCheck,
  UserX,
  AlertCircle,
  CheckCircle,
  Clock,
  CreditCard,
  FileText,
  Award
} from 'lucide-react';
import Link from 'next/link';
import { formatCurrency, formatDate } from '@/lib/format';

interface Student {
  id: string;
  firstName: string;
  lastName: string;
  dni: string;
  email: string | null;
  phone: string | null;
  address: string | null;
  birthDate: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  enrollments: Array<{
    id: string;
    enrollmentDate: string;
    status: string;
    observations: string | null;
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
  }>;
  contributions: Array<{
    id: string;
    amount: number;
    month: number;
    year: number;
    paymentDate: string;
    concept: string | null;
    paymentMethod: string | null;
  }>;
  _count: {
    contributions: number;
  };
}

const MESES = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
];

export default function StudentDetailPage() {
  const { user, isLoading } = useAuth();
  const params = useParams();
  const studentId = params.id as string;
  
  const [student, setStudent] = useState<Student | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!isLoading && user && studentId) {
      fetchStudentData();
    }
  }, [isLoading, user, studentId]);

  const fetchStudentData = async () => {
    try {
      setLoading(true);
      
      const response = await fetch(`/api/estudiantes/${studentId}`, {
        credentials: 'include',
      });
      
      if (response.ok) {
        const studentData = await response.json();
        setStudent(studentData);
      } else if (response.status === 404) {
        setError('Estudiante no encontrado');
      } else {
        setError('Error al cargar los datos del estudiante');
      }
      
    } catch (err) {
      setError('Error de conexión');
    } finally {
      setLoading(false);
    }
  };

  const calculateAge = (birthDate: string) => {
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    
    return age;
  };

  const getTotalContributions = () => {
    if (!student) return 0;
    return student.contributions.reduce((sum, contrib) => sum + contrib.amount, 0);
  };

  const getActiveEnrollments = () => {
    if (!student) return [];
    return student.enrollments.filter(enrollment => enrollment.status === 'ACTIVE');
  };

  const getEnrollmentStatusBadge = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">Activa</Badge>;
      case 'COMPLETED':
        return <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">Completada</Badge>;
      case 'CANCELLED':
        return <Badge className="bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200">Cancelada</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
        <Card className="max-w-md">
          <CardContent className="p-6 text-center">
            <User className="w-16 h-16 text-blue-500 mx-auto mb-4 animate-pulse" />
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              Cargando estudiante...
            </h2>
            <p className="text-gray-600 dark:text-gray-300">
              Obteniendo información del perfil
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error || !student) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
        <Card className="max-w-md">
          <CardContent className="p-6 text-center">
            <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              Error
            </h2>
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              {error || 'Estudiante no encontrado'}
            </p>
            <Link href="/dashboard/estudiantes">
              <Button variant="outline">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Volver a Estudiantes
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
          <div className="flex flex-col space-y-3">
            <Breadcrumb items={[
              { label: 'Estudiantes', href: '/dashboard/estudiantes' },
              { label: `${student.firstName} ${student.lastName}` }
            ]} />
            
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <Link href="/dashboard/estudiantes">
                  <Button variant="ghost" size="sm" className="text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white">
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Estudiantes
                  </Button>
                </Link>
                <div className="h-6 w-px bg-gray-300 dark:bg-gray-600" />
                <div>
                  <h1 className="text-xl font-bold text-gray-900 dark:text-white flex items-center">
                    <User className="w-6 h-6 mr-2 text-blue-600" />
                    {student.firstName} {student.lastName}
                  </h1>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    DNI: {student.dni}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                <Button variant="outline" size="sm" disabled>
                  <Edit className="w-4 h-4 mr-2" />
                  Editar
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-6">
        {/* Student Status */}
        <div className="mb-6">
          <div className="flex items-center space-x-2">
            {student.isActive ? (
              <>
                <UserCheck className="w-5 h-5 text-green-500" />
                <span className="text-green-600 dark:text-green-400 font-medium">
                  Estudiante Activo
                </span>
              </>
            ) : (
              <>
                <UserX className="w-5 h-5 text-red-500" />
                <span className="text-red-600 dark:text-red-400 font-medium">
                  Estudiante Inactivo
                </span>
              </>
            )}
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white border-0">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-100 text-sm font-medium">Matrículas</p>
                  <p className="text-3xl font-bold">{student.enrollments.length}</p>
                </div>
                <GraduationCap className="w-8 h-8 text-blue-200" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white border-0">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-100 text-sm font-medium">Aportes Totales</p>
                  <p className="text-3xl font-bold">{student._count.contributions}</p>
                </div>
                <CreditCard className="w-8 h-8 text-green-200" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-r from-purple-500 to-purple-600 text-white border-0">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-100 text-sm font-medium">Total Aportado</p>
                  <p className="text-2xl font-bold">{formatCurrency(getTotalContributions())}</p>
                </div>
                <DollarSign className="w-8 h-8 text-purple-200" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-r from-orange-500 to-orange-600 text-white border-0">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-orange-100 text-sm font-medium">Cursadas Activas</p>
                  <p className="text-3xl font-bold">{getActiveEnrollments().length}</p>
                </div>
                <BookOpen className="w-8 h-8 text-orange-200" />
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Personal Information */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="w-5 h-5 text-blue-600" />
                  Información Personal
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-500 dark:text-gray-400">
                    Nombre Completo
                  </label>
                  <p className="text-gray-900 dark:text-white font-medium">
                    {student.firstName} {student.lastName}
                  </p>
                </div>
                
                <div>
                  <label className="text-sm font-medium text-gray-500 dark:text-gray-400">
                    DNI
                  </label>
                  <p className="text-gray-900 dark:text-white font-medium">
                    {student.dni}
                  </p>
                </div>
                
                {student.email && (
                  <div>
                    <label className="text-sm font-medium text-gray-500 dark:text-gray-400">
                      Email
                    </label>
                    <div className="flex items-center space-x-2">
                      <Mail className="w-4 h-4 text-gray-400" />
                      <p className="text-gray-900 dark:text-white">
                        {student.email}
                      </p>
                    </div>
                  </div>
                )}
                
                {student.phone && (
                  <div>
                    <label className="text-sm font-medium text-gray-500 dark:text-gray-400">
                      Teléfono
                    </label>
                    <div className="flex items-center space-x-2">
                      <Phone className="w-4 h-4 text-gray-400" />
                      <p className="text-gray-900 dark:text-white">
                        {student.phone}
                      </p>
                    </div>
                  </div>
                )}
                
                {student.address && (
                  <div>
                    <label className="text-sm font-medium text-gray-500 dark:text-gray-400">
                      Dirección
                    </label>
                    <div className="flex items-center space-x-2">
                      <MapPin className="w-4 h-4 text-gray-400" />
                      <p className="text-gray-900 dark:text-white">
                        {student.address}
                      </p>
                    </div>
                  </div>
                )}
                
                {student.birthDate && (
                  <div>
                    <label className="text-sm font-medium text-gray-500 dark:text-gray-400">
                      Fecha de Nacimiento
                    </label>
                    <div className="flex items-center space-x-2">
                      <Calendar className="w-4 h-4 text-gray-400" />
                      <p className="text-gray-900 dark:text-white">
                        {formatDate(student.birthDate)} ({calculateAge(student.birthDate)} años)
                      </p>
                    </div>
                  </div>
                )}
                
                <div>
                  <label className="text-sm font-medium text-gray-500 dark:text-gray-400">
                    Registrado
                  </label>
                  <p className="text-gray-900 dark:text-white">
                    {formatDate(student.createdAt)}
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Enrollments and Contributions */}
          <div className="lg:col-span-2 space-y-6">
            {/* Current Enrollments */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <GraduationCap className="w-5 h-5 text-green-600" />
                  Matrículas ({student.enrollments.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                {student.enrollments.length === 0 ? (
                  <div className="text-center py-8">
                    <BookOpen className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500 dark:text-gray-400">
                      No hay matrículas registradas
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {student.enrollments.map((enrollment) => (
                      <div key={enrollment.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <h4 className="font-semibold text-gray-900 dark:text-white">
                              {enrollment.coursePeriod.course.name}
                            </h4>
                            <p className="text-sm text-gray-600 dark:text-gray-300">
                              {enrollment.coursePeriod.name}
                            </p>
                          </div>
                          {getEnrollmentStatusBadge(enrollment.status)}
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <span className="text-gray-500 dark:text-gray-400">Fecha de matrícula:</span>
                            <p className="text-gray-900 dark:text-white">
                              {formatDate(enrollment.enrollmentDate)}
                            </p>
                          </div>
                          <div>
                            <span className="text-gray-500 dark:text-gray-400">Precio mensual:</span>
                            <p className="text-gray-900 dark:text-white font-medium">
                              {formatCurrency(enrollment.coursePeriod.monthlyPrice)}
                            </p>
                          </div>
                        </div>
                        
                        <div className="mt-3 text-sm">
                          <span className="text-gray-500 dark:text-gray-400">Período:</span>
                          <p className="text-gray-900 dark:text-white">
                            {formatDate(enrollment.coursePeriod.startDate)} - {formatDate(enrollment.coursePeriod.endDate)}
                          </p>
                        </div>
                        
                        {enrollment.observations && (
                          <div className="mt-3 text-sm">
                            <span className="text-gray-500 dark:text-gray-400">Observaciones:</span>
                            <p className="text-gray-900 dark:text-white">
                              {enrollment.observations}
                            </p>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Recent Contributions */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="w-5 h-5 text-purple-600" />
                  Aportes Recientes ({student.contributions.length > 0 ? `${student.contributions.length} de ${student._count.contributions}` : '0'})
                </CardTitle>
              </CardHeader>
              <CardContent>
                {student.contributions.length === 0 ? (
                  <div className="text-center py-8">
                    <CreditCard className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500 dark:text-gray-400">
                      No hay aportes registrados
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {student.contributions.map((contribution) => (
                      <div key={contribution.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">
                            {formatCurrency(contribution.amount)}
                          </p>
                          <p className="text-sm text-gray-600 dark:text-gray-300">
                            {MESES[contribution.month - 1]} {contribution.year}
                          </p>
                          {contribution.concept && (
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                              {contribution.concept}
                            </p>
                          )}
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-gray-600 dark:text-gray-300">
                            {formatDate(contribution.paymentDate)}
                          </p>
                          {contribution.paymentMethod && (
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                              {contribution.paymentMethod}
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                    
                    {student._count.contributions > student.contributions.length && (
                      <div className="text-center pt-4">
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          Mostrando los últimos {student.contributions.length} aportes de {student._count.contributions} totales
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
