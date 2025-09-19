'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/providers/auth-provider';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
// import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Breadcrumb } from '@/components/breadcrumb';
import { 
  ArrowLeft, 
  Save, 
  Loader2, 
  BookOpen,
  AlertCircle,
  CheckCircle,
  Info,
  Settings
} from 'lucide-react';
import { getAreaByCode } from '@/lib/nomenclador';

interface Course {
  id: string;
  areaCode: string;
  profileCode: string;
  name: string;
  description: string | null;
  duration: number;
  requirements: string | null;
  certificateLevel: string | null;
  certification: string | null;
  price: number;
  isActive: boolean;
}

interface FormData {
  description: string;
  isActive: boolean;
}

export default function EditarCursoPage() {
  const { user, isAdmin } = useAuth();
  const router = useRouter();
  const params = useParams();
  const cursoId = params.id as string;
  
  const [curso, setCurso] = useState<Course | null>(null);
  const [formData, setFormData] = useState<FormData>({
    description: '',
    isActive: true,
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');

  // Redirect if not admin
  useEffect(() => {
    if (user && !isAdmin) {
      router.push('/dashboard/cursos');
    }
  }, [user, isAdmin, router]);

  // Fetch course data
  useEffect(() => {
    const fetchCurso = async () => {
      try {
        const response = await fetch(`/api/cursos/${cursoId}`, {
          credentials: 'include',
        });

        if (!response.ok) {
          throw new Error('Error al cargar el curso');
        }

        const data = await response.json();
        setCurso(data.course);
        setFormData({
          description: data.course.description || '',
          isActive: data.course.isActive,
        });
      } catch (error: any) {
        console.error('Error:', error);
        setError(error.message || 'Error al cargar el curso');
      } finally {
        setLoading(false);
      }
    };

    if (cursoId) {
      fetchCurso();
    }
  }, [cursoId]);

  const handleInputChange = (field: keyof FormData, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setError('');
    setSuccess('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // No price validation needed - price is set per course period

    setSaving(true);
    setError('');
    setSuccess('');

    try {
      const response = await fetch(`/api/cursos/${cursoId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          description: formData.description || null,
          isActive: formData.isActive,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Error al actualizar el curso');
      }

      const data = await response.json();
      setSuccess('Curso actualizado exitosamente');
      
      // Update local state
      setCurso(data.course);
      
      // Redirect to course detail after 2 seconds
      setTimeout(() => {
        router.push(`/dashboard/cursos/${cursoId}`);
      }, 2000);

    } catch (error: any) {
      console.error('Error:', error);
      setError(error.message || 'Error al actualizar el curso');
    } finally {
      setSaving(false);
    }
  };

  if (!user || !isAdmin) {
    return (
      <div className="container mx-auto p-6">
        <Card>
          <CardContent className="p-6 text-center">
            <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              Acceso Denegado
            </h2>
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              Solo los administradores pueden editar cursos.
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

  if (loading) {
    return (
      <div className="container mx-auto p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Editar Curso</h1>
            <p className="text-muted-foreground">
              Cargando información del curso...
            </p>
          </div>
        </div>
        <Card>
          <CardContent className="p-6 text-center">
            <Loader2 className="w-16 h-16 text-blue-500 mx-auto mb-4 animate-spin" />
            <p className="text-gray-600 dark:text-gray-300">
              Cargando datos del curso...
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error && !curso) {
    return (
      <div className="container mx-auto p-6">
        <Card>
          <CardContent className="p-6 text-center">
            <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              Error
            </h2>
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              {error}
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

  if (!curso) return null;

  const area = getAreaByCode(curso.areaCode);

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <Breadcrumb items={[
            { label: 'Cursos', href: '/dashboard/cursos' },
            { label: curso.name, href: `/dashboard/cursos/${curso.id}` },
            { label: 'Editar' }
          ]} />
          <h1 className="text-3xl font-bold mt-2">Editar Curso</h1>
          <p className="text-muted-foreground">
            Modifica los campos personalizables del curso
          </p>
        </div>
        <Link href={`/dashboard/cursos/${curso.id}`}>
          <Button variant="outline">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Volver
          </Button>
        </Link>
      </div>

      {/* Alerts */}
      {error && (
        <Alert className="border-red-200 bg-red-50 dark:bg-red-950">
          <AlertCircle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-800 dark:text-red-200">
            {error}
          </AlertDescription>
        </Alert>
      )}

      {success && (
        <Alert className="border-green-200 bg-green-50 dark:bg-green-950">
          <CheckCircle className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-800 dark:text-green-200">
            {success}
          </AlertDescription>
        </Alert>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Información del Nomenclador (Solo lectura) */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="w-5 h-5" />
              Información del Nomenclador (Solo lectura)
            </CardTitle>
            <CardDescription>
              Estos datos provienen del nomenclador oficial y no se pueden modificar
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-gray-50 dark:bg-gray-900/20 rounded-lg">
              <div>
                <Label className="text-sm font-medium text-gray-600 dark:text-gray-400">Área</Label>
                <p className="font-semibold text-gray-900 dark:text-white">
                  {curso.areaCode} - {area?.name || 'Área no encontrada'}
                </p>
              </div>
              <div>
                <Label className="text-sm font-medium text-gray-600 dark:text-gray-400">Código</Label>
                <p className="font-semibold text-gray-900 dark:text-white">{curso.profileCode}</p>
              </div>
              <div className="md:col-span-2">
                <Label className="text-sm font-medium text-gray-600 dark:text-gray-400">Nombre del Curso</Label>
                <p className="font-semibold text-gray-900 dark:text-white">{curso.name}</p>
              </div>
              <div>
                <Label className="text-sm font-medium text-gray-600 dark:text-gray-400">Duración</Label>
                <p className="font-semibold text-gray-900 dark:text-white">{curso.duration} horas reloj</p>
              </div>
              {curso.certificateLevel && (
                <div>
                  <Label className="text-sm font-medium text-gray-600 dark:text-gray-400">Certificación</Label>
                  <p className="font-semibold text-gray-900 dark:text-white">
                    {curso.certificateLevel} - {curso.certification}
                  </p>
                </div>
              )}
              {curso.requirements && (
                <div className="md:col-span-2">
                  <Label className="text-sm font-medium text-gray-600 dark:text-gray-400">Requisitos</Label>
                  <p className="font-semibold text-gray-900 dark:text-white">{curso.requirements}</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Campos Editables */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="w-5 h-5" />
              Configuración del CFP
            </CardTitle>
            <CardDescription>
              Modifica los campos específicos de tu Centro de Formación Profesional. El precio se define al crear cada cursada.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Estado */}
            <div className="space-y-2">
              <Label htmlFor="isActive">Estado del Curso</Label>
              <select
                id="isActive"
                value={formData.isActive ? 'true' : 'false'}
                onChange={(e) => handleInputChange('isActive', e.target.value === 'true')}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              >
                <option value="true">Activo</option>
                <option value="false">Inactivo</option>
              </select>
            </div>

            {/* Descripción adicional */}
            <div className="space-y-2">
              <Label htmlFor="description">Descripción Adicional (Opcional)</Label>
              <textarea
                id="description"
                placeholder="Agrega información específica del CFP, modalidad, horarios, etc."
                value={formData.description}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => handleInputChange('description', e.target.value)}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white resize-vertical"
              />
            </div>
          </CardContent>
        </Card>

        {/* Botones */}
        <div className="flex items-center justify-end space-x-4">
          <Link href={`/dashboard/cursos/${curso.id}`}>
            <Button variant="outline" type="button">
              Cancelar
            </Button>
          </Link>
          <Button 
            type="submit" 
            disabled={saving}
            className="flex items-center gap-2"
          >
            {saving ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            {saving ? 'Guardando...' : 'Guardar Cambios'}
          </Button>
        </div>
      </form>
    </div>
  );
}
