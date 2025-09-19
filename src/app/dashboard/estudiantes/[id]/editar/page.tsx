'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/providers/auth-provider';
import { useParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AccessibleInput } from '@/components/accessible-form';
import { Breadcrumb } from '@/components/breadcrumb';
import { 
  ArrowLeft, 
  User, 
  Save,
  AlertCircle,
  CheckCircle,
  Loader2
} from 'lucide-react';
import Link from 'next/link';
import { formatDate } from '@/lib/format';

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
}

interface StudentFormData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  birthDate: string;
  isActive: boolean;
}

export default function EditStudentPage() {
  const { user, isLoading } = useAuth();
  const params = useParams();
  const router = useRouter();
  const studentId = params.id as string;
  
  const [student, setStudent] = useState<Student | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  const [formData, setFormData] = useState<StudentFormData>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    birthDate: '',
    isActive: true
  });

  const [formErrors, setFormErrors] = useState<Partial<StudentFormData>>({});

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
        
        // Populate form with current data
        setFormData({
          firstName: studentData.firstName || '',
          lastName: studentData.lastName || '',
          email: studentData.email || '',
          phone: studentData.phone || '',
          address: studentData.address || '',
          birthDate: studentData.birthDate ? studentData.birthDate.split('T')[0] : '',
          isActive: studentData.isActive
        });
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

  const validateForm = (): boolean => {
    const errors: Partial<StudentFormData> = {};
    
    if (!formData.firstName.trim()) {
      errors.firstName = 'El nombre es requerido';
    } else if (formData.firstName.trim().length < 2) {
      errors.firstName = 'El nombre debe tener al menos 2 caracteres';
    }
    
    if (!formData.lastName.trim()) {
      errors.lastName = 'El apellido es requerido';
    } else if (formData.lastName.trim().length < 2) {
      errors.lastName = 'El apellido debe tener al menos 2 caracteres';
    }
    
    if (formData.email && formData.email.trim()) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email.trim())) {
        errors.email = 'Email inválido';
      }
    }
    
    if (formData.birthDate) {
      const birthDate = new Date(formData.birthDate);
      const today = new Date();
      const minDate = new Date();
      minDate.setFullYear(today.getFullYear() - 100);
      
      if (birthDate > today) {
        errors.birthDate = 'La fecha de nacimiento no puede ser futura';
      } else if (birthDate < minDate) {
        errors.birthDate = 'La fecha de nacimiento no puede ser tan antigua';
      }
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleInputChange = (field: keyof StudentFormData, value: string | boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Clear error for this field when user starts typing
    if (formErrors[field]) {
      setFormErrors(prev => ({
        ...prev,
        [field]: undefined
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setSaving(true);
    setError('');
    setSuccess('');
    
    try {
      const updateData = {
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        email: formData.email.trim() || null,
        phone: formData.phone.trim() || null,
        address: formData.address.trim() || null,
        birthDate: formData.birthDate || null,
        isActive: formData.isActive
      };
      
      const response = await fetch(`/api/estudiantes/${studentId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(updateData),
      });
      
      const data = await response.json();
      
      if (response.ok) {
        setSuccess('Estudiante actualizado exitosamente');
        setStudent(data);
        
        // Redirect to student detail page after a delay
        setTimeout(() => {
          router.push(`/dashboard/estudiantes/${studentId}`);
        }, 2000);
      } else {
        setError(data.error || 'Error al actualizar el estudiante');
      }
      
    } catch (err) {
      setError('Error de conexión');
    } finally {
      setSaving(false);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
        <Card className="max-w-md">
          <CardContent className="p-6 text-center">
            <User className="w-16 h-16 text-blue-500 mx-auto mb-4 animate-pulse" />
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
            <Loader2 className="w-16 h-16 text-blue-500 mx-auto mb-4 animate-spin" />
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              Cargando estudiante...
            </h2>
            <p className="text-gray-600 dark:text-gray-300">
              Obteniendo información para editar
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error && !student) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
        <Card className="max-w-md">
          <CardContent className="p-6 text-center">
            <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              Error
            </h2>
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              {error}
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
              { label: student ? `${student.firstName} ${student.lastName}` : 'Estudiante', href: `/dashboard/estudiantes/${studentId}` },
              { label: 'Editar' }
            ]} />
            
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <Link href={`/dashboard/estudiantes/${studentId}`}>
                  <Button variant="ghost" size="sm" className="text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white">
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Volver al Perfil
                  </Button>
                </Link>
                <div className="h-6 w-px bg-gray-300 dark:bg-gray-600" />
                <div>
                  <h1 className="text-xl font-bold text-gray-900 dark:text-white flex items-center">
                    <User className="w-6 h-6 mr-2 text-blue-600" />
                    Editar Estudiante
                  </h1>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    {student ? `${student.firstName} ${student.lastName} - DNI: ${student.dni}` : 'Cargando...'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto p-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="w-5 h-5 text-blue-600" />
              Información del Estudiante
            </CardTitle>
            <CardDescription>
              Modifica la información personal del estudiante. Los campos marcados son obligatorios.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {/* Success Message */}
            {success && (
              <Alert className="mb-6 border-green-200 bg-green-50 dark:bg-green-900/20">
                <CheckCircle className="w-4 h-4 text-green-600" />
                <AlertDescription className="text-green-800 dark:text-green-200">
                  {success}
                </AlertDescription>
              </Alert>
            )}

            {/* Error Message */}
            {error && (
              <Alert className="mb-6 border-red-200 bg-red-50 dark:bg-red-900/20">
                <AlertCircle className="w-4 h-4 text-red-600" />
                <AlertDescription className="text-red-800 dark:text-red-200">
                  {error}
                </AlertDescription>
              </Alert>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Basic Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <AccessibleInput
                  id="firstName"
                  label="Nombre *"
                  type="text"
                  value={formData.firstName}
                  onChange={(e) => handleInputChange('firstName', e.target.value)}
                  required
                  disabled={saving}
                  error={formErrors.firstName}
                  placeholder="Ej: Juan"
                />

                <AccessibleInput
                  id="lastName"
                  label="Apellido *"
                  type="text"
                  value={formData.lastName}
                  onChange={(e) => handleInputChange('lastName', e.target.value)}
                  required
                  disabled={saving}
                  error={formErrors.lastName}
                  placeholder="Ej: Pérez"
                />
              </div>

              {/* Contact Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <AccessibleInput
                  id="email"
                  label="Email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  disabled={saving}
                  error={formErrors.email}
                  placeholder="usuario@ejemplo.com"
                />

                <AccessibleInput
                  id="phone"
                  label="Teléfono"
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  disabled={saving}
                  placeholder="Ej: +54 9 11 1234-5678"
                />
              </div>

              {/* Additional Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <AccessibleInput
                  id="address"
                  label="Dirección"
                  type="text"
                  value={formData.address}
                  onChange={(e) => handleInputChange('address', e.target.value)}
                  disabled={saving}
                  placeholder="Ej: Av. San Martín 123, Lago Puelo"
                />

                <AccessibleInput
                  id="birthDate"
                  label="Fecha de Nacimiento"
                  type="date"
                  value={formData.birthDate}
                  onChange={(e) => handleInputChange('birthDate', e.target.value)}
                  disabled={saving}
                  error={formErrors.birthDate}
                />
              </div>

              {/* Status */}
              <div className="flex items-center space-x-2">
                <input
                  id="isActive"
                  type="checkbox"
                  checked={formData.isActive}
                  onChange={(e) => handleInputChange('isActive', e.target.checked)}
                  disabled={saving}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <label htmlFor="isActive" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Estudiante activo
                </label>
              </div>

              {/* Student Info (Read-only) */}
              {student && (
                <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                  <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                    Información del Sistema
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                    <div>
                      <span className="text-gray-500 dark:text-gray-400">DNI:</span>
                      <p className="text-gray-900 dark:text-white font-medium">{student.dni}</p>
                    </div>
                    <div>
                      <span className="text-gray-500 dark:text-gray-400">Registrado:</span>
                      <p className="text-gray-900 dark:text-white">{formatDate(student.createdAt)}</p>
                    </div>
                    <div>
                      <span className="text-gray-500 dark:text-gray-400">Última actualización:</span>
                      <p className="text-gray-900 dark:text-white">{formatDate(student.updatedAt)}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200 dark:border-gray-700">
                <Link href={`/dashboard/estudiantes/${studentId}`}>
                  <Button variant="outline" disabled={saving}>
                    Cancelar
                  </Button>
                </Link>
                <Button 
                  type="submit" 
                  disabled={saving}
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  {saving ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Guardando...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4 mr-2" />
                      Guardar Cambios
                    </>
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
