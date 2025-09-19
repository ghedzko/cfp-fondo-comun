'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/providers/auth-provider';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Breadcrumb } from '@/components/breadcrumb';
import {
  ArrowLeft,
  Save,
  Loader2,
  BookOpen,
  AlertCircle,
  CheckCircle,
  Info
} from 'lucide-react';
import { AREAS_FP, NOMENCLADOR_COURSES, getCoursesByArea, getCourseByCode, type NomencladorCourse } from '@/lib/nomenclador';

interface FormData {
  areaCode: string;
  profileCode: string;
  description: string;
}

export default function NuevoCursoPage() {
  const { user, isAdmin } = useAuth();
  const router = useRouter();
  
  const [formData, setFormData] = useState<FormData>({
    areaCode: '',
    profileCode: '',
    description: '',
  });
  const [selectedCourse, setSelectedCourse] = useState<NomencladorCourse | null>(null);
  const [availableCourses, setAvailableCourses] = useState<NomencladorCourse[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');

  // Redirect if not admin
  useEffect(() => {
    if (user && !isAdmin) {
      router.push('/dashboard/cursos');
    }
  }, [user, isAdmin, router]);

  // Update available courses when area changes
  useEffect(() => {
    if (formData.areaCode) {
      const courses = getCoursesByArea(formData.areaCode);
      setAvailableCourses(courses);
      setFormData(prev => ({ ...prev, profileCode: '' }));
      setSelectedCourse(null);
    } else {
      setAvailableCourses([]);
    }
  }, [formData.areaCode]);

  // Update selected course when profile code changes
  useEffect(() => {
    if (formData.areaCode && formData.profileCode) {
      const course = getCourseByCode(formData.areaCode, formData.profileCode);
      setSelectedCourse(course || null);
    } else {
      setSelectedCourse(null);
    }
  }, [formData.areaCode, formData.profileCode]);

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setError('');
    setSuccess('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedCourse) {
      setError('Debes seleccionar un curso del nomenclador');
      return;
    }

    // No price validation needed - price is set per course period

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const response = await fetch('/api/cursos', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          areaCode: formData.areaCode,
          profileCode: formData.profileCode,
          name: selectedCourse.name,
          duration: selectedCourse.duration,
          requirements: selectedCourse.requirements,
          certificateLevel: selectedCourse.certificateLevel,
          certification: selectedCourse.certification,
          description: formData.description || null,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Error al crear el curso');
      }

      const data = await response.json();
      setSuccess('Curso creado exitosamente');
      
      // Redirect to course detail after 2 seconds
      setTimeout(() => {
        router.push(`/dashboard/cursos/${data.course.id}`);
      }, 2000);

    } catch (error: any) {
      console.error('Error:', error);
      setError(error.message || 'Error al crear el curso');
    } finally {
      setLoading(false);
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
              Solo los administradores pueden crear cursos.
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

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <Breadcrumb items={[
            { label: 'Cursos', href: '/dashboard/cursos' },
            { label: 'Nuevo Curso' }
          ]} />
          <h1 className="text-3xl font-bold mt-2">Crear Nuevo Curso</h1>
          <p className="text-muted-foreground">
            Selecciona un curso del nomenclador oficial y personaliza los detalles para tu CFP
          </p>
        </div>
        <Link href="/dashboard/cursos">
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
        {/* Selector del Nomenclador */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="w-5 h-5" />
              Seleccionar del Nomenclador Oficial
            </CardTitle>
            <CardDescription>
              Elige un curso del nomenclador oficial de Formación Profesional de Chubut
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Área */}
              <div className="space-y-2">
                <Label htmlFor="area">Área de Formación</Label>
                <Select
                  value={formData.areaCode}
                  onValueChange={(value) => handleInputChange('areaCode', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona un área" />
                  </SelectTrigger>
                  <SelectContent>
                    {AREAS_FP.map((area) => (
                      <SelectItem key={area.code} value={area.code}>
                        {area.code} - {area.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Curso */}
              <div className="space-y-2">
                <Label htmlFor="curso">Curso</Label>
                <Select
                  value={formData.profileCode}
                  onValueChange={(value) => handleInputChange('profileCode', value)}
                  disabled={!formData.areaCode}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona un curso" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableCourses.map((course) => (
                      <SelectItem key={course.profileCode} value={course.profileCode}>
                        {course.profileCode} - {course.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Vista previa del curso seleccionado */}
            {selectedCourse && (
              <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg border border-blue-200 dark:border-blue-800">
                <div className="flex items-center gap-2 mb-3">
                  <Info className="w-5 h-5 text-blue-600" />
                  <h3 className="font-semibold text-blue-900 dark:text-blue-100">Vista Previa del Curso</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-medium text-blue-800 dark:text-blue-200">Nombre:</span>
                    <p className="text-blue-700 dark:text-blue-300">{selectedCourse.name}</p>
                  </div>
                  <div>
                    <span className="font-medium text-blue-800 dark:text-blue-200">Duración:</span>
                    <p className="text-blue-700 dark:text-blue-300">{selectedCourse.duration} horas reloj</p>
                  </div>
                  <div>
                    <span className="font-medium text-blue-800 dark:text-blue-200">Requisitos:</span>
                    <p className="text-blue-700 dark:text-blue-300">{selectedCourse.requirements}</p>
                  </div>
                  <div>
                    <span className="font-medium text-blue-800 dark:text-blue-200">Certificación:</span>
                    <p className="text-blue-700 dark:text-blue-300">
                      {selectedCourse.certificateLevel} - {selectedCourse.certification}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Configuración del CFP */}
        <Card>
          <CardHeader>
            <CardTitle>Configuración del CFP</CardTitle>
            <CardDescription>
              Agrega información adicional específica para tu Centro de Formación Profesional. El precio se definirá al crear cada cursada.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Descripción adicional */}
            <div className="space-y-2">
              <Label htmlFor="description">Descripción Adicional (Opcional)</Label>
              <textarea
                id="description"
                placeholder="Agrega información específica del CFP, modalidad, horarios, etc."
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white resize-vertical"
              />
            </div>
          </CardContent>
        </Card>

        {/* Botones */}
        <div className="flex items-center justify-end space-x-4">
          <Link href="/dashboard/cursos">
            <Button variant="outline" type="button">
              Cancelar
            </Button>
          </Link>
          <Button 
            type="submit" 
            disabled={loading || !selectedCourse}
            className="flex items-center gap-2"
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            {loading ? 'Creando...' : 'Crear Curso'}
          </Button>
        </div>
      </form>
    </div>
  );
}
