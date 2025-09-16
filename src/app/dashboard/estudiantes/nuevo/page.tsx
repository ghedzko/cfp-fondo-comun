'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/providers/auth-provider';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Save, User } from 'lucide-react';
import Link from 'next/link';

interface EstudianteForm {
  dni: string;
  nombre: string;
  apellido: string;
  email: string;
  telefono: string;
  direccion: string;
  fechaNacimiento: string;
}

export default function NuevoEstudiantePage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState<EstudianteForm>({
    dni: '',
    nombre: '',
    apellido: '',
    email: '',
    telefono: '',
    direccion: '',
    fechaNacimiento: '',
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/estudiantes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        const estudiante = await response.json();
        router.push(`/dashboard/estudiantes/${estudiante.id}`);
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Error al crear el estudiante');
      }
    } catch (error) {
      setError('Error de conexión. Intenta nuevamente.');
    } finally {
      setLoading(false);
    }
  };

  if (isLoading) {
    return (
      <main role="main" className="nuevo-estudiante-page">
        <div className="container">
          <div className="loading">Cargando...</div>
        </div>
      </main>
    );
  }

  return (
    <main role="main" className="nuevo-estudiante-page">
      <div className="container">
        <header className="page-header">
          <div className="header-content">
            <div className="breadcrumb">
              <Link href="/dashboard/estudiantes" className="breadcrumb-link">
                <ArrowLeft size={20} />
                Volver a Estudiantes
              </Link>
            </div>
            <h1>Nuevo Estudiante</h1>
            <p className="subtitle">
              Registra un nuevo estudiante en el sistema
            </p>
          </div>
        </header>

        <section className="form-section" aria-label="Formulario de nuevo estudiante">
          <Card>
            <CardHeader>
              <CardTitle className="form-title">
                <User size={24} />
                Información del Estudiante
              </CardTitle>
              <CardDescription>
                Completa los datos del estudiante. Los campos marcados con * son obligatorios.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {error && (
                <div className="error-message" role="alert" aria-live="polite">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="student-form">
                <div className="form-grid">
                  <div className="form-group">
                    <label htmlFor="dni" className="form-label">
                      DNI *
                    </label>
                    <Input
                      id="dni"
                      name="dni"
                      type="text"
                      value={formData.dni}
                      onChange={handleInputChange}
                      placeholder="12345678"
                      required
                      aria-required="true"
                      aria-describedby="dni-help"
                      maxLength={8}
                    />
                    <small id="dni-help" className="form-help">
                      Ingresa el DNI sin puntos ni espacios
                    </small>
                  </div>

                  <div className="form-group">
                    <label htmlFor="nombre" className="form-label">
                      Nombre *
                    </label>
                    <Input
                      id="nombre"
                      name="nombre"
                      type="text"
                      value={formData.nombre}
                      onChange={handleInputChange}
                      placeholder="Juan"
                      required
                      aria-required="true"
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="apellido" className="form-label">
                      Apellido *
                    </label>
                    <Input
                      id="apellido"
                      name="apellido"
                      type="text"
                      value={formData.apellido}
                      onChange={handleInputChange}
                      placeholder="Pérez"
                      required
                      aria-required="true"
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="email" className="form-label">
                      Email
                    </label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      placeholder="juan.perez@email.com"
                      aria-describedby="email-help"
                    />
                    <small id="email-help" className="form-help">
                      Opcional - para comunicaciones importantes
                    </small>
                  </div>

                  <div className="form-group">
                    <label htmlFor="telefono" className="form-label">
                      Teléfono
                    </label>
                    <Input
                      id="telefono"
                      name="telefono"
                      type="tel"
                      value={formData.telefono}
                      onChange={handleInputChange}
                      placeholder="+54 9 11 1234-5678"
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="fechaNacimiento" className="form-label">
                      Fecha de Nacimiento
                    </label>
                    <Input
                      id="fechaNacimiento"
                      name="fechaNacimiento"
                      type="date"
                      value={formData.fechaNacimiento}
                      onChange={handleInputChange}
                    />
                  </div>

                  <div className="form-group full-width">
                    <label htmlFor="direccion" className="form-label">
                      Dirección
                    </label>
                    <Input
                      id="direccion"
                      name="direccion"
                      type="text"
                      value={formData.direccion}
                      onChange={handleInputChange}
                      placeholder="Av. San Martín 123, Lago Puelo"
                    />
                  </div>
                </div>

                <div className="form-actions">
                  <Link href="/dashboard/estudiantes">
                    <Button type="button" variant="outline" disabled={loading}>
                      Cancelar
                    </Button>
                  </Link>
                  <Button 
                    type="submit" 
                    className="btn-primary" 
                    disabled={loading}
                    aria-label="Guardar nuevo estudiante"
                  >
                    <Save size={20} />
                    {loading ? 'Guardando...' : 'Guardar Estudiante'}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </section>
      </div>
    </main>
  );
}
