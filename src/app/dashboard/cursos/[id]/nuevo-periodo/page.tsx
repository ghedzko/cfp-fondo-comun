'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAuth } from '@/providers/auth-provider';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { MonthSelector } from '@/components/ui/month-selector';
import { ThemeToggle } from '@/components/theme-toggle';
import { 
  ArrowLeft, 
  Save, 
  Calendar, 
  DollarSign, 
  Clock,
  Users,
  CheckCircle,
  AlertCircle,
  Lightbulb,
  Copy,
  Sparkles,
  Eye,
  BookOpen
} from 'lucide-react';
import Link from 'next/link';

interface Curso {
  id: string;
  nombre: string;
  descripcion: string | null;
}

interface PeriodoForm {
  nombre: string;
  fechaInicio: string;
  fechaFin: string;
  precioMensual: string;
  mesesHabilitados: number[];
}

export default function NuevoPeriodoPage() {
  const { user, isLoading, logout } = useAuth();
  const router = useRouter();
  const params = useParams();
  const cursoId = params.id as string;
  
  const [curso, setCurso] = useState<Curso | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showPreview, setShowPreview] = useState(false);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  
  const [formData, setFormData] = useState<PeriodoForm>({
    nombre: '',
    fechaInicio: '',
    fechaFin: '',
    precioMensual: '',
    mesesHabilitados: [],
  });

  // Templates for quick setup
  const templates = [
    {
      name: 'Cuatrimestre Estándar',
      months: [3, 4, 5, 6],
      duration: '4 meses',
      icon: BookOpen,
      description: 'Período típico de marzo a junio'
    },
    {
      name: 'Segundo Cuatrimestre',
      months: [8, 9, 10, 11],
      duration: '4 meses', 
      icon: Calendar,
      description: 'Período de agosto a noviembre'
    },
    {
      name: 'Curso Intensivo',
      months: [1, 2, 3],
      duration: '3 meses',
      icon: Clock,
      description: 'Curso corto e intensivo'
    },
    {
      name: 'Año Completo',
      months: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
      duration: '12 meses',
      icon: Sparkles,
      description: 'Curso anual completo'
    }
  ];

  useEffect(() => {
    if (!isLoading && user && cursoId) {
      fetchCurso();
    }
  }, [isLoading, user, cursoId]);

  const fetchCurso = async () => {
    try {
      const response = await fetch(`/api/cursos/${cursoId}`, {
        credentials: 'include',
      });
      
      if (response.ok) {
        const data = await response.json();
        setCurso(data);
        // Auto-generate period name based on course
        setFormData(prev => ({
          ...prev,
          nombre: `${data.nombre} - ${new Date().getFullYear()}`,
        }));
      } else {
        setError('Curso no encontrado');
      }
    } catch (err) {
      setError('Error al cargar el curso');
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
    
    // Clear validation error when user starts typing
    if (validationErrors[name]) {
      setValidationErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
    
    // Real-time validation
    validateField(name, value);
  };

  const handleMonthsChange = (months: number[]) => {
    setFormData(prev => ({
      ...prev,
      mesesHabilitados: months,
    }));
    
    // Clear months validation error
    if (validationErrors.mesesHabilitados) {
      setValidationErrors(prev => ({
        ...prev,
        mesesHabilitados: ''
      }));
    }
  };

  const validateField = (name: string, value: string) => {
    let error = '';
    
    switch (name) {
      case 'nombre':
        if (!value.trim()) {
          error = 'El nombre del período es obligatorio';
        } else if (value.length < 3) {
          error = 'El nombre debe tener al menos 3 caracteres';
        }
        break;
      case 'fechaInicio':
        if (!value) {
          error = 'La fecha de inicio es obligatoria';
        } else if (new Date(value) < new Date()) {
          error = 'La fecha de inicio no puede ser anterior a hoy';
        }
        break;
      case 'fechaFin':
        if (!value) {
          error = 'La fecha de fin es obligatoria';
        } else if (formData.fechaInicio && new Date(value) <= new Date(formData.fechaInicio)) {
          error = 'La fecha de fin debe ser posterior a la fecha de inicio';
        }
        break;
      case 'precioMensual':
        if (!value) {
          error = 'El precio mensual es obligatorio';
        } else if (parseFloat(value) < 0) {
          error = 'El precio no puede ser negativo';
        } else if (parseFloat(value) > 1000000) {
          error = 'El precio parece demasiado alto';
        }
        break;
    }
    
    setValidationErrors(prev => ({
      ...prev,
      [name]: error
    }));
    
    return error === '';
  };

  const validateForm = () => {
    const errors: Record<string, string> = {};
    
    if (!formData.nombre.trim()) {
      errors.nombre = 'El nombre del período es obligatorio';
    }
    if (!formData.fechaInicio) {
      errors.fechaInicio = 'La fecha de inicio es obligatoria';
    }
    if (!formData.fechaFin) {
      errors.fechaFin = 'La fecha de fin es obligatoria';
    }
    if (!formData.precioMensual) {
      errors.precioMensual = 'El precio mensual es obligatorio';
    }
    if (formData.mesesHabilitados.length === 0) {
      errors.mesesHabilitados = 'Debe seleccionar al menos un mes';
    }
    
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const applyTemplate = (template: typeof templates[0]) => {
    const currentYear = new Date().getFullYear();
    const startMonth = Math.min(...template.months);
    const endMonth = Math.max(...template.months);
    
    setFormData(prev => ({
      ...prev,
      nombre: `${curso?.nombre} - ${template.name} ${currentYear}`,
      fechaInicio: `${currentYear}-${startMonth.toString().padStart(2, '0')}-01`,
      fechaFin: `${currentYear}-${endMonth.toString().padStart(2, '0')}-${new Date(currentYear, endMonth, 0).getDate()}`,
      mesesHabilitados: template.months
    }));
    
    setSuccess(`Template "${template.name}" aplicado exitosamente`);
    setTimeout(() => setSuccess(''), 3000);
  };

  const generateSuggestedName = () => {
    if (!curso) return '';
    
    const currentYear = new Date().getFullYear();
    const monthCount = formData.mesesHabilitados.length;
    
    if (monthCount === 0) return `${curso.nombre} - ${currentYear}`;
    
    const startMonth = Math.min(...formData.mesesHabilitados);
    const endMonth = Math.max(...formData.mesesHabilitados);
    
    const monthNames = ['', 'Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
    
    if (monthCount <= 3) {
      return `${curso.nombre} - Intensivo ${monthNames[startMonth]} ${currentYear}`;
    } else if (monthCount <= 6) {
      return `${curso.nombre} - ${monthNames[startMonth]}-${monthNames[endMonth]} ${currentYear}`;
    } else {
      return `${curso.nombre} - Anual ${currentYear}`;
    }
  };

  const handleLogout = async () => {
    await logout();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      setError('Por favor corrige los errores en el formulario');
      return;
    }
    
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const response = await fetch(`/api/cursos/${cursoId}/periodos`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          nombre: formData.nombre,
          fechaInicio: formData.fechaInicio,
          fechaFin: formData.fechaFin,
          precioMensual: parseFloat(formData.precioMensual),
          mesesHabilitados: formData.mesesHabilitados,
        }),
      });

      if (response.ok) {
        const periodo = await response.json();
        setSuccess('¡Período creado exitosamente! Redirigiendo...');
        setTimeout(() => {
          router.push(`/dashboard/cursos/${cursoId}`);
        }, 1500);
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Error al crear el período');
      }
    } catch (error) {
      setError('Error de conexión. Intenta nuevamente.');
    } finally {
      setLoading(false);
    }
  };

  if (isLoading || !curso) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
        <Card className="max-w-md">
          <CardContent className="p-6 text-center">
            <Calendar className="w-16 h-16 text-blue-500 mx-auto mb-4 animate-pulse" />
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              Cargando...
            </h2>
            <p className="text-gray-600 dark:text-gray-300">
              Obteniendo información del curso
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
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link href={`/dashboard/cursos/${cursoId}`}>
                <Button variant="ghost" size="sm" className="text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Volver a {curso.nombre}
                </Button>
              </Link>
              <div className="h-6 w-px bg-gray-300 dark:bg-gray-600" />
              <div>
                <h1 className="text-xl font-bold text-gray-900 dark:text-white flex items-center">
                  <Calendar className="w-6 h-6 mr-2 text-blue-600" />
                  Nuevo Período de Curso
                </h1>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  Crear un nuevo período para {curso.nombre}
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
        {/* Course Info Banner */}
        <Card className="mb-8 bg-gradient-to-r from-blue-600 to-purple-600 text-white border-0">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold mb-2">{curso.nombre}</h2>
                <p className="text-blue-100 mb-2">
                  {curso.descripcion || 'Configurando nuevo período de cursada'}
                </p>
                <div className="flex items-center space-x-4 text-sm">
                  <span className="flex items-center">
                    <Users className="w-4 h-4 mr-1" />
                    Nuevo período
                  </span>
                  <span className="flex items-center">
                    <Calendar className="w-4 h-4 mr-1" />
                    {new Date().getFullYear()}
                  </span>
                </div>
              </div>
              <div className="hidden lg:block">
                <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center">
                  <BookOpen className="w-8 h-8 text-white" />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Alerts */}
        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {success && (
          <Alert className="mb-6 border-green-200 bg-green-50 dark:bg-green-900/20">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-800 dark:text-green-200">
              {success}
            </AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Quick Templates */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lightbulb className="w-5 h-5 text-yellow-600" />
                Templates Rápidos
              </CardTitle>
              <CardDescription>
                Usa un template predefinido para configurar rápidamente tu período
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {templates.map((template) => {
                  const IconComponent = template.icon;
                  return (
                    <button
                      key={template.name}
                      type="button"
                      onClick={() => applyTemplate(template)}
                      disabled={loading}
                      className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:border-blue-300 dark:hover:border-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all text-left group"
                    >
                      <div className="flex items-center mb-2">
                        <IconComponent className="w-5 h-5 text-blue-600 mr-2" />
                        <span className="font-medium text-gray-900 dark:text-white">
                          {template.name}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">
                        {template.description}
                      </p>
                      <Badge variant="outline" className="text-xs">
                        {template.duration}
                      </Badge>
                    </button>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-blue-600" />
                Información Básica
              </CardTitle>
              <CardDescription>
                Configura los datos principales del período de curso
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Name Field with Suggestion */}
              <div className="space-y-2">
                <Label htmlFor="nombre" className="text-sm font-medium">
                  Nombre del Período *
                </Label>
                <div className="flex gap-2">
                  <Input
                    id="nombre"
                    name="nombre"
                    type="text"
                    value={formData.nombre}
                    onChange={handleInputChange}
                    placeholder="Ej: Curso Básico - Marzo 2025"
                    className={validationErrors.nombre ? 'border-red-500' : ''}
                  />
                  {formData.mesesHabilitados.length > 0 && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setFormData(prev => ({ ...prev, nombre: generateSuggestedName() }))}
                      className="whitespace-nowrap"
                    >
                      <Sparkles className="w-4 h-4 mr-1" />
                      Sugerir
                    </Button>
                  )}
                </div>
                {validationErrors.nombre && (
                  <p className="text-sm text-red-600 flex items-center">
                    <AlertCircle className="w-4 h-4 mr-1" />
                    {validationErrors.nombre}
                  </p>
                )}
              </div>

              {/* Date Fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="fechaInicio" className="text-sm font-medium">
                    Fecha de Inicio *
                  </Label>
                  <Input
                    id="fechaInicio"
                    name="fechaInicio"
                    type="date"
                    value={formData.fechaInicio}
                    onChange={handleInputChange}
                    className={validationErrors.fechaInicio ? 'border-red-500' : ''}
                  />
                  {validationErrors.fechaInicio && (
                    <p className="text-sm text-red-600 flex items-center">
                      <AlertCircle className="w-4 h-4 mr-1" />
                      {validationErrors.fechaInicio}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="fechaFin" className="text-sm font-medium">
                    Fecha de Fin *
                  </Label>
                  <Input
                    id="fechaFin"
                    name="fechaFin"
                    type="date"
                    value={formData.fechaFin}
                    onChange={handleInputChange}
                    className={validationErrors.fechaFin ? 'border-red-500' : ''}
                  />
                  {validationErrors.fechaFin && (
                    <p className="text-sm text-red-600 flex items-center">
                      <AlertCircle className="w-4 h-4 mr-1" />
                      {validationErrors.fechaFin}
                    </p>
                  )}
                </div>
              </div>

              {/* Price Field */}
              <div className="space-y-2">
                <Label htmlFor="precioMensual" className="text-sm font-medium flex items-center">
                  <DollarSign className="w-4 h-4 mr-1" />
                  Precio Mensual Sugerido *
                </Label>
                <Input
                  id="precioMensual"
                  name="precioMensual"
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.precioMensual}
                  onChange={handleInputChange}
                  placeholder="0.00"
                  className={validationErrors.precioMensual ? 'border-red-500' : ''}
                />
                {validationErrors.precioMensual ? (
                  <p className="text-sm text-red-600 flex items-center">
                    <AlertCircle className="w-4 h-4 mr-1" />
                    {validationErrors.precioMensual}
                  </p>
                ) : (
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Monto sugerido para el aporte voluntario mensual
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Month Selection */}
          <div className="space-y-2">
            <MonthSelector
              selectedMonths={formData.mesesHabilitados}
              onMonthsChange={handleMonthsChange}
              disabled={loading}
            />
            {validationErrors.mesesHabilitados && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{validationErrors.mesesHabilitados}</AlertDescription>
              </Alert>
            )}
          </div>

          {/* Preview Section */}
          {formData.nombre && formData.fechaInicio && formData.fechaFin && formData.mesesHabilitados.length > 0 && (
            <Card className="border-green-200 bg-green-50 dark:bg-green-900/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-green-800 dark:text-green-200">
                  <Eye className="w-5 h-5" />
                  Vista Previa del Período
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                  <div>
                    <span className="font-medium text-green-800 dark:text-green-200">Nombre:</span>
                    <p className="text-green-700 dark:text-green-300">{formData.nombre}</p>
                  </div>
                  <div>
                    <span className="font-medium text-green-800 dark:text-green-200">Duración:</span>
                    <p className="text-green-700 dark:text-green-300">
                      {formData.fechaInicio} - {formData.fechaFin}
                    </p>
                  </div>
                  <div>
                    <span className="font-medium text-green-800 dark:text-green-200">Precio:</span>
                    <p className="text-green-700 dark:text-green-300">
                      ${parseFloat(formData.precioMensual || '0').toLocaleString()}/mes
                    </p>
                  </div>
                  <div>
                    <span className="font-medium text-green-800 dark:text-green-200">Meses activos:</span>
                    <p className="text-green-700 dark:text-green-300">
                      {formData.mesesHabilitados.length} meses
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Form Actions */}
          <div className="flex items-center justify-between pt-6 border-t border-gray-200 dark:border-gray-700">
            <Link href={`/dashboard/cursos/${cursoId}`}>
              <Button type="button" variant="outline" disabled={loading}>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Cancelar
              </Button>
            </Link>
            <Button 
              type="submit" 
              disabled={loading || Object.keys(validationErrors).some(key => validationErrors[key])}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 mr-2 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Creando...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Crear Período
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
