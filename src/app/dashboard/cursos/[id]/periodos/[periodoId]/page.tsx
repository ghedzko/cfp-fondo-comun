'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAuth } from '@/providers/auth-provider';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Breadcrumb } from '@/components/breadcrumb';
import { 
  ArrowLeft, 
  Calendar, 
  DollarSign, 
  Users, 
  UserPlus,
  Edit,
  Trash2,
  Eye,
  FileText,
  BarChart3,
  AlertCircle,
  CheckCircle,
  Clock,
  BookOpen
} from 'lucide-react';
import Link from 'next/link';

interface Curso {
  id: string;
  nombre: string;
  descripcion: string | null;
}

interface CursoPeriodo {
  id: string;
  nombre: string;
  fechaInicio: string;
  fechaFin: string;
  precioMensual: number;
  mesesHabilitados: number[];
  curso: Curso;
  _count?: {
    matriculas: number;
  };
}

interface Matricula {
  id: string;
  fechaMatricula: string;
  estudiante: {
    id: string;
    nombre: string;
    apellido: string;
    dni: string;
    email: string;
  };
}

const MESES = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
];

export default function PeriodoDetailPage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const params = useParams();
  const cursoId = params.id as string;
  const periodoId = params.periodoId as string;
  
  const [periodo, setPeriodo] = useState<CursoPeriodo | null>(null);
  const [matriculas, setMatriculas] = useState<Matricula[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!isLoading && user && cursoId && periodoId) {
      fetchPeriodoData();
    }
  }, [isLoading, user, cursoId, periodoId]);

  const fetchPeriodoData = async () => {
    try {
      setLoading(true);
      
      // Fetch period details
      const periodoResponse = await fetch(`/api/cursos/${cursoId}/periodos/${periodoId}`, {
        credentials: 'include',
      });
      
      if (periodoResponse.ok) {
        const periodoData = await periodoResponse.json();
        setPeriodo(periodoData);
      } else {
        setError('Período no encontrado');
        return;
      }
      
      // Fetch enrollments
      const matriculasResponse = await fetch(`/api/cursos/${cursoId}/matriculas?periodoId=${periodoId}`, {
        credentials: 'include',
      });
      
      if (matriculasResponse.ok) {
        const matriculasData = await matriculasResponse.json();
        setMatriculas(matriculasData);
      }
      
    } catch (err) {
      setError('Error al cargar los datos del período');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-AR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getMesesHabilitadosText = (meses: number[]) => {
    if (meses.length === 0) return 'Ningún mes habilitado';
    if (meses.length === 12) return 'Todo el año';
    
    return meses.map(mes => MESES[mes - 1]).join(', ');
  };

  const getEstadoPeriodo = () => {
    if (!periodo) return { status: 'unknown', label: 'Desconocido', color: 'gray' };
    
    const now = new Date();
    const inicio = new Date(periodo.fechaInicio);
    const fin = new Date(periodo.fechaFin);
    
    if (now < inicio) {
      return { status: 'upcoming', label: 'Próximo', color: 'blue' };
    } else if (now > fin) {
      return { status: 'finished', label: 'Finalizado', color: 'gray' };
    } else {
      return { status: 'active', label: 'Activo', color: 'green' };
    }
  };

  const breadcrumbItems = [
    { label: 'Cursos', href: '/dashboard/cursos' },
    { label: periodo?.curso.nombre || 'Curso', href: `/dashboard/cursos/${cursoId}` },
    { label: periodo?.nombre || 'Período' }
  ];

  if (isLoading || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
        <Card className="max-w-md">
          <CardContent className="p-6 text-center">
            <Calendar className="w-16 h-16 text-blue-500 mx-auto mb-4 animate-pulse" />
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

  if (error || !periodo) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
        <Card className="max-w-md">
          <CardContent className="p-6 text-center">
            <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              Error
            </h2>
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              {error || 'No se pudo cargar el período'}
            </p>
            <Link href={`/dashboard/cursos/${cursoId}`}>
              <Button variant="outline">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Volver al curso
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  const estado = getEstadoPeriodo();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      {/* Header */}
      <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border-b border-gray-200 dark:border-gray-700 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex flex-col space-y-3">
            <Breadcrumb items={breadcrumbItems} />
            
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <Link href={`/dashboard/cursos/${cursoId}`}>
                  <Button variant="ghost" size="sm" className="text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white">
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Volver al curso
                  </Button>
                </Link>
                <div className="h-6 w-px bg-gray-300 dark:bg-gray-600" />
                <div>
                  <h1 className="text-xl font-bold text-gray-900 dark:text-white flex items-center">
                    <Calendar className="w-6 h-6 mr-2 text-blue-600" />
                    {periodo.nombre}
                  </h1>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    {periodo.curso.nombre}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <Badge 
                  variant={estado.color === 'green' ? 'default' : 'secondary'}
                  className={`${
                    estado.color === 'green' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                    estado.color === 'blue' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' :
                    'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
                  }`}
                >
                  {estado.status === 'active' && <CheckCircle className="w-3 h-3 mr-1" />}
                  {estado.status === 'upcoming' && <Clock className="w-3 h-3 mr-1" />}
                  {estado.status === 'finished' && <AlertCircle className="w-3 h-3 mr-1" />}
                  {estado.label}
                </Badge>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-6">
        {/* Period Info Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Estudiantes</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {matriculas.length}
                  </p>
                </div>
                <Users className="w-8 h-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Precio Mensual</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    ${periodo.precioMensual.toLocaleString()}
                  </p>
                </div>
                <DollarSign className="w-8 h-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Meses Activos</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {periodo.mesesHabilitados.length}
                  </p>
                </div>
                <Calendar className="w-8 h-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Estado</p>
                  <p className="text-lg font-bold text-gray-900 dark:text-white">
                    {estado.label}
                  </p>
                </div>
                <BookOpen className="w-8 h-8 text-orange-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Period Details */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-blue-600" />
                Información del Período
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Nombre</label>
                <p className="text-gray-900 dark:text-white">{periodo.nombre}</p>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Fecha de Inicio</label>
                  <p className="text-gray-900 dark:text-white">{formatDate(periodo.fechaInicio)}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Fecha de Fin</label>
                  <p className="text-gray-900 dark:text-white">{formatDate(periodo.fechaFin)}</p>
                </div>
              </div>
              
              <div>
                <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Precio Mensual</label>
                <p className="text-gray-900 dark:text-white">${periodo.precioMensual.toLocaleString()}</p>
              </div>
              
              <div>
                <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Meses Habilitados</label>
                <p className="text-gray-900 dark:text-white">{getMesesHabilitadosText(periodo.mesesHabilitados)}</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5 text-green-600" />
                Acciones Rápidas
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Link href={`/dashboard/cursos/${cursoId}/periodos/${periodoId}/matricular`}>
                <Button className="w-full justify-start" variant="outline">
                  <UserPlus className="w-4 h-4 mr-2" />
                  Matricular Estudiantes
                </Button>
              </Link>
              
              <Link href={`/dashboard/aportes?curso=${cursoId}&periodo=${periodoId}`}>
                <Button className="w-full justify-start" variant="outline">
                  <DollarSign className="w-4 h-4 mr-2" />
                  Gestionar Aportes
                </Button>
              </Link>
              
              <Button className="w-full justify-start" variant="outline" disabled>
                <BarChart3 className="w-4 h-4 mr-2" />
                Ver Reportes
                <Badge variant="secondary" className="ml-auto text-xs">Próximamente</Badge>
              </Button>
              
              <Button className="w-full justify-start" variant="outline" disabled>
                <Edit className="w-4 h-4 mr-2" />
                Editar Período
                <Badge variant="secondary" className="ml-auto text-xs">Próximamente</Badge>
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Students List */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Users className="w-5 h-5 text-blue-600" />
                  Estudiantes Matriculados ({matriculas.length})
                </CardTitle>
                <CardDescription>
                  Lista de estudiantes inscritos en este período
                </CardDescription>
              </div>
              <Link href={`/dashboard/cursos/${cursoId}/periodos/${periodoId}/matricular`}>
                <Button>
                  <UserPlus className="w-4 h-4 mr-2" />
                  Agregar Estudiantes
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            {matriculas.length === 0 ? (
              <div className="text-center py-12">
                <Users className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  No hay estudiantes matriculados
                </h3>
                <p className="text-gray-600 dark:text-gray-300 mb-4">
                  Comienza agregando estudiantes a este período de curso.
                </p>
                <Link href={`/dashboard/cursos/${cursoId}/periodos/${periodoId}/matricular`}>
                  <Button>
                    <UserPlus className="w-4 h-4 mr-2" />
                    Matricular Estudiantes
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Estudiante
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        DNI
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Email
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Fecha de Matrícula
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
                    {matriculas.map((matricula) => (
                      <tr key={matricula.id} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                        <td className="px-4 py-4">
                          <div className="flex items-center">
                            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center mr-3">
                              <Users className="w-4 h-4 text-white" />
                            </div>
                            <div>
                              <div className="text-sm font-medium text-gray-900 dark:text-white">
                                {matricula.estudiante.apellido}, {matricula.estudiante.nombre}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-4">
                          <Badge variant="outline" className="text-xs">
                            {matricula.estudiante.dni}
                          </Badge>
                        </td>
                        <td className="px-4 py-4 text-sm text-gray-600 dark:text-gray-300">
                          {matricula.estudiante.email}
                        </td>
                        <td className="px-4 py-4 text-sm text-gray-600 dark:text-gray-300">
                          {formatDate(matricula.fechaMatricula)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
