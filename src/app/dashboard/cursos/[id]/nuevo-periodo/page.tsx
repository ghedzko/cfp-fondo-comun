'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAuth } from '@/providers/auth-provider';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { MonthSelector } from '@/components/ui/month-selector';
import { ArrowLeft, Save, Calendar, DollarSign } from 'lucide-react';
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
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const params = useParams();
  const cursoId = params.id as string;
  
  const [curso, setCurso] = useState<Curso | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState<PeriodoForm>({
    nombre: '',
    fechaInicio: '',
    fechaFin: '',
    precioMensual: '',
    mesesHabilitados: [],
  });

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
  };

  const handleMonthsChange = (months: number[]) => {
    setFormData(prev => ({
      ...prev,
      mesesHabilitados: months,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Validate form
    if (!formData.nombre || !formData.fechaInicio || !formData.fechaFin || !formData.precioMensual) {
      setError('Todos los campos obligatorios deben estar completos');
      setLoading(false);
      return;
    }

    if (formData.mesesHabilitados.length === 0) {
      setError('Debe seleccionar al menos un mes habilitado');
      setLoading(false);
      return;
    }

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
        router.push(`/dashboard/cursos/${cursoId}`);
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
      <main role="main" className="nuevo-periodo-page">
        <div className="container">
          <div className="loading">Cargando...</div>
        </div>
      </main>
    );
  }

  return (
    <main role="main" className="nuevo-periodo-page">
      <div className="container">
        <header className="page-header">
          <div className="header-content">
            <div className="breadcrumb">
              <Link href={`/dashboard/cursos/${cursoId}`} className="breadcrumb-link">
                <ArrowLeft size={20} />
                Volver a {curso.nombre}
              </Link>
            </div>
            <h1>Nuevo Período de Curso</h1>
            <p className="subtitle">
              Crear un nuevo período para {curso.nombre}
            </p>
          </div>
        </header>

        <section className="form-section" aria-label="Formulario de nuevo período">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar size={24} />
                  Información Básica
                </CardTitle>
                <CardDescription>
                  Configura los datos principales del período de curso
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {error && (
                  <div className="error-message" role="alert" aria-live="polite">
                    {error}
                  </div>
                )}

                <div className="form-group">
                  <label htmlFor="nombre" className="form-label">
                    Nombre del Período *
                  </label>
                  <Input
                    id="nombre"
                    name="nombre"
                    type="text"
                    value={formData.nombre}
                    onChange={handleInputChange}
                    placeholder="Ej: Curso Básico - Marzo 2025"
                    required
                    aria-required="true"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="form-group">
                    <label htmlFor="fechaInicio" className="form-label">
                      Fecha de Inicio *
                    </label>
                    <Input
                      id="fechaInicio"
                      name="fechaInicio"
                      type="date"
                      value={formData.fechaInicio}
                      onChange={handleInputChange}
                      required
                      aria-required="true"
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="fechaFin" className="form-label">
                      Fecha de Fin *
                    </label>
                    <Input
                      id="fechaFin"
                      name="fechaFin"
                      type="date"
                      value={formData.fechaFin}
                      onChange={handleInputChange}
                      required
                      aria-required="true"
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="precioMensual" className="form-label">
                    <DollarSign size={16} className="inline mr-1" />
                    Precio Mensual *
                  </label>
                  <Input
                    id="precioMensual"
                    name="precioMensual"
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.precioMensual}
                    onChange={handleInputChange}
                    placeholder="0.00"
                    required
                    aria-required="true"
                    aria-describedby="precio-help"
                  />
                  <small id="precio-help" className="form-help">
                    Monto sugerido para el aporte voluntario mensual
                  </small>
                </div>
              </CardContent>
            </Card>

            {/* Month Selection */}
            <MonthSelector
              selectedMonths={formData.mesesHabilitados}
              onMonthsChange={handleMonthsChange}
              disabled={loading}
            />

            {/* Form Actions */}
            <div className="form-actions">
              <Link href={`/dashboard/cursos/${cursoId}`}>
                <Button type="button" variant="outline" disabled={loading}>
                  Cancelar
                </Button>
              </Link>
              <Button 
                type="submit" 
                className="btn-primary" 
                disabled={loading}
                aria-label="Crear nuevo período de curso"
              >
                <Save size={20} />
                {loading ? 'Creando...' : 'Crear Período'}
              </Button>
            </div>
          </form>
        </section>
      </div>
    </main>
  );
}
