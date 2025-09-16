'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/providers/auth-provider';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Save, Plus, Trash2, Calculator } from 'lucide-react';

interface Curso {
  id: string;
  nombre: string;
  periodos: CursoPeriodo[];
}

interface CursoPeriodo {
  id: string;
  nombre: string;
  mesesHabilitados: number[];
  anio: number;
}

interface Estudiante {
  id: string;
  nombre: string;
  apellido: string;
  dni: string;
}

interface Aporte {
  id?: string;
  estudianteId: string;
  monto: number;
  mes: number;
  anio: number;
  estudiante?: Estudiante;
}

interface EstadisticasAportes {
  totalAportes: number;
  totalRecaudado: number;
  totalMatriculados: number;
  porcentajeParticipacion: number;
}

const MESES = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
];

export default function AportesPage() {
  const { user } = useAuth();
  const [cursos, setCursos] = useState<Curso[]>([]);
  const [cursoSeleccionado, setCursoSeleccionado] = useState<string>('');
  const [periodoSeleccionado, setPeriodoSeleccionado] = useState<string>('');
  const [mesSeleccionado, setMesSeleccionado] = useState<number>(new Date().getMonth() + 1);
  const [anioSeleccionado, setAnioSeleccionado] = useState<number>(new Date().getFullYear());
  const [estudiantes, setEstudiantes] = useState<Estudiante[]>([]);
  const [aportes, setAportes] = useState<Aporte[]>([]);
  const [estadisticas, setEstadisticas] = useState<EstadisticasAportes | null>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');

  // Cargar cursos al montar el componente
  useEffect(() => {
    fetchCursos();
  }, []);

  // Cargar estudiantes matriculados cuando se selecciona un período
  useEffect(() => {
    if (periodoSeleccionado) {
      fetchEstudiantesMatriculados();
      fetchAportesExistentes();
    }
  }, [periodoSeleccionado, mesSeleccionado, anioSeleccionado]);

  const fetchCursos = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/cursos', {
        credentials: 'include',
      });

      if (!response.ok) throw new Error('Error al cargar cursos');

      const data = await response.json();
      setCursos(data.cursos || []);
    } catch (error) {
      console.error('Error:', error);
      setError('Error al cargar los cursos');
    } finally {
      setLoading(false);
    }
  };

  const fetchEstudiantesMatriculados = async () => {
    if (!periodoSeleccionado) return;

    try {
      setLoading(true);
      const response = await fetch(`/api/cursos/${cursoSeleccionado}/matriculas?periodoId=${periodoSeleccionado}`, {
        credentials: 'include',
      });

      if (!response.ok) throw new Error('Error al cargar estudiantes');

      const data = await response.json();
      setEstudiantes(data.matriculas?.map((m: any) => m.estudiante) || []);
    } catch (error) {
      console.error('Error:', error);
      setError('Error al cargar estudiantes matriculados');
    } finally {
      setLoading(false);
    }
  };

  const fetchAportesExistentes = async () => {
    if (!periodoSeleccionado) return;

    try {
      const response = await fetch(
        `/api/cursos/${cursoSeleccionado}/periodos/${periodoSeleccionado}/aportes?mes=${mesSeleccionado}&anio=${anioSeleccionado}`,
        { credentials: 'include' }
      );

      if (!response.ok) throw new Error('Error al cargar aportes');

      const data = await response.json();
      setAportes(data.aportes || []);
      setEstadisticas(data.estadisticas || null);
    } catch (error) {
      console.error('Error:', error);
      setError('Error al cargar aportes existentes');
    }
  };

  const handleCursoChange = (cursoId: string) => {
    setCursoSeleccionado(cursoId);
    setPeriodoSeleccionado('');
    setEstudiantes([]);
    setAportes([]);
    setEstadisticas(null);
  };

  const handlePeriodoChange = (periodoId: string) => {
    setPeriodoSeleccionado(periodoId);
    setAportes([]);
    setEstadisticas(null);
  };

  const getPeriodoActual = () => {
    const curso = cursos.find(c => c.id === cursoSeleccionado);
    return curso?.periodos.find(p => p.id === periodoSeleccionado);
  };

  const isMesHabilitado = (mes: number) => {
    const periodo = getPeriodoActual();
    return periodo?.mesesHabilitados.includes(mes) || false;
  };

  const getMontoAporte = (estudianteId: string) => {
    const aporte = aportes.find(a => a.estudianteId === estudianteId);
    return aporte?.monto || 0;
  };

  const updateMontoAporte = (estudianteId: string, monto: number) => {
    setAportes(prev => {
      const existing = prev.find(a => a.estudianteId === estudianteId);
      if (existing) {
        return prev.map(a => 
          a.estudianteId === estudianteId ? { ...a, monto } : a
        );
      } else {
        return [...prev, {
          estudianteId,
          monto,
          mes: mesSeleccionado,
          anio: anioSeleccionado,
        }];
      }
    });
  };

  const guardarAportes = async () => {
    if (!periodoSeleccionado || !isMesHabilitado(mesSeleccionado)) {
      setError('Mes no habilitado para aportes');
      return;
    }

    try {
      setSaving(true);
      setError('');
      setSuccess('');

      const aportesParaGuardar = aportes.filter(a => a.monto > 0);

      if (aportesParaGuardar.length === 0) {
        setError('No hay aportes para guardar');
        return;
      }

      const response = await fetch(
        `/api/cursos/${cursoSeleccionado}/periodos/${periodoSeleccionado}/aportes`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ aportes: aportesParaGuardar }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Error al guardar aportes');
      }

      const data = await response.json();
      setSuccess(`${data.aportes.length} aportes guardados exitosamente`);
      
      // Recargar aportes y estadísticas
      await fetchAportesExistentes();

    } catch (error: any) {
      console.error('Error:', error);
      setError(error.message || 'Error al guardar aportes');
    } finally {
      setSaving(false);
    }
  };

  const calcularTotalMes = () => {
    return aportes.reduce((total, aporte) => total + (aporte.monto || 0), 0);
  };

  const periodo = getPeriodoActual();

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Aportes Mensuales</h1>
          <p className="text-muted-foreground">
            Gestión de aportes voluntarios por curso y período
          </p>
        </div>
      </div>

      {/* Selectores */}
      <Card>
        <CardHeader>
          <h2 className="text-xl font-semibold">Seleccionar Curso y Período</h2>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Selector de Curso */}
            <div className="space-y-2">
              <Label htmlFor="curso">Curso</Label>
              <Select value={cursoSeleccionado} onValueChange={handleCursoChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar curso" />
                </SelectTrigger>
                <SelectContent>
                  {cursos.map(curso => (
                    <SelectItem key={curso.id} value={curso.id}>
                      {curso.nombre}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Selector de Período */}
            <div className="space-y-2">
              <Label htmlFor="periodo">Período</Label>
              <Select 
                value={periodoSeleccionado} 
                onValueChange={handlePeriodoChange}
                disabled={!cursoSeleccionado}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar período" />
                </SelectTrigger>
                <SelectContent>
                  {cursos
                    .find(c => c.id === cursoSeleccionado)
                    ?.periodos.map(periodo => (
                      <SelectItem key={periodo.id} value={periodo.id}>
                        {periodo.nombre}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>

            {/* Selector de Mes */}
            <div className="space-y-2">
              <Label htmlFor="mes">Mes</Label>
              <Select 
                value={mesSeleccionado.toString()} 
                onValueChange={(value) => setMesSeleccionado(parseInt(value))}
                disabled={!periodoSeleccionado}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {MESES.map((mes, index) => (
                    <SelectItem 
                      key={index + 1} 
                      value={(index + 1).toString()}
                      disabled={!isMesHabilitado(index + 1)}
                    >
                      <div className="flex items-center gap-2">
                        {mes}
                        {!isMesHabilitado(index + 1) && (
                          <Badge variant="secondary" className="text-xs">
                            No habilitado
                          </Badge>
                        )}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Selector de Año */}
            <div className="space-y-2">
              <Label htmlFor="anio">Año</Label>
              <Select 
                value={anioSeleccionado.toString()} 
                onValueChange={(value) => setAnioSeleccionado(parseInt(value))}
                disabled={!periodoSeleccionado}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {[2024, 2025, 2026].map(anio => (
                    <SelectItem key={anio} value={anio.toString()}>
                      {anio}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Información del período seleccionado */}
          {periodo && (
            <div className="mt-4 p-4 bg-muted rounded-lg">
              <h3 className="font-medium mb-2">Información del Período</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div>
                  <span className="font-medium">Período:</span> {periodo.nombre}
                </div>
                <div>
                  <span className="font-medium">Año:</span> {periodo.anio}
                </div>
                <div>
                  <span className="font-medium">Meses habilitados:</span>{' '}
                  {periodo.mesesHabilitados.map(m => MESES[m - 1]).join(', ')}
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Alertas */}
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {success && (
        <Alert>
          <AlertDescription>{success}</AlertDescription>
        </Alert>
      )}

      {/* Tabla de Aportes */}
      {periodoSeleccionado && isMesHabilitado(mesSeleccionado) && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold">
                  Aportes - {MESES[mesSeleccionado - 1]} {anioSeleccionado}
                </h2>
                <p className="text-sm text-muted-foreground">
                  Los aportes son <strong>voluntarios</strong> y contribuyen al fondo común del curso
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="flex items-center gap-1">
                  <Calculator className="h-3 w-3" />
                  Total: ${calcularTotalMes().toLocaleString()}
                </Badge>
                <Button 
                  onClick={guardarAportes} 
                  disabled={saving || aportes.filter(a => a.monto > 0).length === 0}
                  className="flex items-center gap-2"
                >
                  {saving ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Save className="h-4 w-4" />
                  )}
                  Guardar Aportes
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin" />
                <span className="ml-2">Cargando estudiantes...</span>
              </div>
            ) : estudiantes.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No hay estudiantes matriculados en este período
              </div>
            ) : (
              <div className="space-y-2">
                {/* Encabezados */}
                <div className="grid grid-cols-4 gap-4 p-3 bg-muted rounded-lg font-medium text-sm">
                  <div>Estudiante</div>
                  <div>DNI</div>
                  <div>Monto ($)</div>
                  <div>Estado</div>
                </div>

                {/* Filas de estudiantes */}
                {estudiantes.map(estudiante => {
                  const montoActual = getMontoAporte(estudiante.id);
                  const tieneAporte = montoActual > 0;

                  return (
                    <div 
                      key={estudiante.id} 
                      className="grid grid-cols-4 gap-4 p-3 border rounded-lg hover:bg-muted/50"
                    >
                      <div className="font-medium">
                        {estudiante.apellido}, {estudiante.nombre}
                      </div>
                      <div className="text-muted-foreground">
                        {estudiante.dni}
                      </div>
                      <div>
                        <Input
                          type="number"
                          min="0"
                          step="0.01"
                          value={montoActual || ''}
                          onChange={(e) => {
                            const valor = parseFloat(e.target.value) || 0;
                            updateMontoAporte(estudiante.id, valor);
                          }}
                          placeholder="0.00"
                          className="w-full"
                        />
                      </div>
                      <div>
                        {tieneAporte ? (
                          <Badge variant="default">Con aporte</Badge>
                        ) : (
                          <Badge variant="secondary">Sin aporte</Badge>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Estadísticas */}
      {estadisticas && (
        <Card>
          <CardHeader>
            <h2 className="text-xl font-semibold">Estadísticas del Período</h2>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="text-center p-4 bg-muted rounded-lg">
                <div className="text-2xl font-bold text-primary">
                  {estadisticas.totalAportes}
                </div>
                <div className="text-sm text-muted-foreground">
                  Total Aportes
                </div>
              </div>
              <div className="text-center p-4 bg-muted rounded-lg">
                <div className="text-2xl font-bold text-green-600">
                  ${estadisticas.totalRecaudado.toLocaleString()}
                </div>
                <div className="text-sm text-muted-foreground">
                  Total Recaudado
                </div>
              </div>
              <div className="text-center p-4 bg-muted rounded-lg">
                <div className="text-2xl font-bold text-blue-600">
                  {estadisticas.totalMatriculados}
                </div>
                <div className="text-sm text-muted-foreground">
                  Total Matriculados
                </div>
              </div>
              <div className="text-center p-4 bg-muted rounded-lg">
                <div className="text-2xl font-bold text-orange-600">
                  {estadisticas.porcentajeParticipacion}%
                </div>
                <div className="text-sm text-muted-foreground">
                  Participación
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Mensaje cuando el mes no está habilitado */}
      {periodoSeleccionado && !isMesHabilitado(mesSeleccionado) && (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-8">
              <h3 className="text-lg font-medium mb-2">
                Mes no habilitado para aportes
              </h3>
              <p className="text-muted-foreground mb-4">
                El mes de {MESES[mesSeleccionado - 1]} no está habilitado para recibir aportes en este período.
              </p>
              {periodo && (
                <p className="text-sm text-muted-foreground">
                  Meses habilitados: {periodo.mesesHabilitados.map(m => MESES[m - 1]).join(', ')}
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
