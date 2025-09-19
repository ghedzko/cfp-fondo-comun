'use client';

import { useState, useEffect, Suspense } from 'react';
import { useAuth } from '@/providers/auth-provider';
import { useSearchParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Loader2, 
  Save, 
  Plus, 
  Trash2, 
  Calculator,
  Search,
  Filter,
  Copy,
  DollarSign,
  Users,
  TrendingUp,
  Download,
  Upload,
  Eye,
  EyeOff,
  CheckCircle,
  XCircle,
  MoreHorizontal,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';

interface Curso {
  id: string;
  name: string;
  periods: CursoPeriodo[];
}

interface CursoPeriodo {
  id: string;
  name: string;
  enabledMonths: number[];
  year: number;
}

interface Estudiante {
  id: string;
  firstName: string;
  lastName: string;
  dni: string;
}

interface Aporte {
  id?: string;
  studentId: string;
  amount: number;
  month: number;
  year: number;
  student?: Estudiante;
}

interface EstadisticasAportes {
  totalContributions: number;
  totalCollected: number;
  totalEnrolled: number;
  participationPercentage: number;
}

const MESES = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
];

function AportesPageContent() {
  const { user } = useAuth();
  const searchParams = useSearchParams();
  const estudianteParam = searchParams.get('estudiante');
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

  // Advanced search and filtering
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'with-aporte' | 'without-aporte'>('all');
  const [sortBy, setSortBy] = useState<'name' | 'dni' | 'amount'>('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [viewMode, setViewMode] = useState<'table' | 'cards'>('table');
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);
  
  // Bulk actions
  const [selectedStudents, setSelectedStudents] = useState<Set<string>>(new Set());
  const [bulkAmount, setBulkAmount] = useState<string>('');
  const [showBulkActions, setShowBulkActions] = useState(false);
  
  // Auto-save and UX improvements
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [autoSaving, setAutoSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  
  // Quick amounts
  const quickAmounts = [3000, 5000, 7000, 10000, 15000];

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

  // Pre-seleccionar estudiante si viene del parámetro URL
  useEffect(() => {
    if (estudianteParam && estudiantes.length > 0) {
      const estudianteEncontrado = estudiantes.find(e => e.id === estudianteParam);
      if (estudianteEncontrado) {
        setSelectedStudents(new Set([estudianteParam]));
        setSearchTerm(`${estudianteEncontrado.lastName}, ${estudianteEncontrado.firstName}`);
      }
    }
  }, [estudianteParam, estudiantes]);

  const fetchCursos = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/cursos', {
        credentials: 'include',
      });

      if (!response.ok) throw new Error('Error al cargar cursos');

      const data = await response.json();
      setCursos(data.courses || []);
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
      const response = await fetch(`/api/cursos/${periodoSeleccionado}/matriculas`, {
        credentials: 'include',
      });

      if (!response.ok) throw new Error('Error al cargar estudiantes');

      const data = await response.json();
      setEstudiantes(data.map((enrollment: any) => enrollment.student) || []);
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
      setAportes(data.contributions || []);
      setEstadisticas(data.statistics || null);
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
    setError('');
    setSuccess('');
    setHasUnsavedChanges(false);
    setSelectedStudents(new Set());
  };

  const handlePeriodoChange = (periodoId: string) => {
    setPeriodoSeleccionado(periodoId);
    setAportes([]);
    setEstadisticas(null);
    setError('');
    setSuccess('');
    setHasUnsavedChanges(false);
    setSelectedStudents(new Set());
  };

  const handleMesChange = (mes: number) => {
    setMesSeleccionado(mes);
    setAportes([]);
    setEstadisticas(null);
    setError('');
    setSuccess('');
    setHasUnsavedChanges(false);
    setSelectedStudents(new Set());
  };

  const handleAnioChange = (anio: number) => {
    setAnioSeleccionado(anio);
    setAportes([]);
    setEstadisticas(null);
    setError('');
    setSuccess('');
    setHasUnsavedChanges(false);
    setSelectedStudents(new Set());
  };

  const getPeriodoActual = () => {
    const curso = cursos.find(c => c.id === cursoSeleccionado);
    return curso?.periods.find((p: CursoPeriodo) => p.id === periodoSeleccionado);
  };

  const isMesHabilitado = (mes: number) => {
    const periodo = getPeriodoActual();
    return periodo?.enabledMonths.includes(mes) || false;
  };

  const getMontoAporte = (estudianteId: string) => {
    const aporte = aportes.find(a => a.studentId === estudianteId);
    return aporte?.amount || 0;
  };

  const updateMontoAporte = (estudianteId: string, monto: number) => {
    setAportes(prev => {
      const existing = prev.find(a => a.studentId === estudianteId);
      if (existing) {
        return prev.map(a => 
          a.studentId === estudianteId ? { ...a, amount: monto } : a
        );
      } else {
        return [...prev, {
          studentId: estudianteId,
          amount: monto,
          month: mesSeleccionado,
          year: anioSeleccionado,
        }];
      }
    });
    setHasUnsavedChanges(true);
  };

  // Auto-save effect
  useEffect(() => {
    if (!hasUnsavedChanges || !periodoSeleccionado || saving) return;
    
    const autoSaveTimer = setTimeout(async () => {
      try {
        setAutoSaving(true);
        await guardarAportes(true); // true = silent save
        setHasUnsavedChanges(false);
        setLastSaved(new Date());
      } catch (error) {
        console.error('Auto-save failed:', error);
      } finally {
        setAutoSaving(false);
      }
    }, 3000);

    return () => clearTimeout(autoSaveTimer);
  }, [aportes, hasUnsavedChanges, periodoSeleccionado, saving]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl+A to select all students
      if (e.ctrlKey && e.key === 'a' && estudiantes.length > 0) {
        e.preventDefault();
        selectAllStudents();
      }
      
      // Escape to clear selection
      if (e.key === 'Escape') {
        setSelectedStudents(new Set());
      }
      
      // Ctrl+S to save manually
      if (e.ctrlKey && e.key === 's') {
        e.preventDefault();
        if (aportes.filter(a => a.amount > 0).length > 0) {
          handleSaveClick();
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [estudiantes, aportes]);

  // Quick amount functions
  const applyQuickAmount = (amount: number) => {
    if (selectedStudents.size === 0) {
      setError('Selecciona al menos un estudiante');
      return;
    }
    
    selectedStudents.forEach(studentId => {
      updateMontoAporte(studentId, amount);
    });
    setSelectedStudents(new Set());
  };

  const applyBulkAmount = () => {
    const amount = parseFloat(bulkAmount);
    if (isNaN(amount) || amount < 0) {
      setError('Ingresa un monto válido');
      return;
    }
    
    if (selectedStudents.size === 0) {
      setError('Selecciona al menos un estudiante');
      return;
    }
    
    selectedStudents.forEach(studentId => {
      updateMontoAporte(studentId, amount);
    });
    setBulkAmount('');
    setSelectedStudents(new Set());
  };

  const clearAllAmounts = () => {
    setAportes([]);
    setHasUnsavedChanges(true);
  };

  const selectAllStudents = () => {
    const allIds = new Set(estudiantes.map(e => e.id));
    setSelectedStudents(allIds);
  };

  const getPeriodMonthlyPrice = () => {
    // For now, return a default amount since monthlyPrice is not in the interface
    // This could be fetched from the course period API if needed
    return 7000; // Default monthly price
  };

  const handleSaveClick = () => {
    guardarAportes(false);
  };

  const guardarAportes = async (silent = false) => {
    if (!periodoSeleccionado || !isMesHabilitado(mesSeleccionado)) {
      if (!silent) setError('Mes no habilitado para aportes');
      return;
    }

    try {
      setSaving(true);
      if (!silent) {
        setError('');
        setSuccess('');
      }

      const aportesParaGuardar = aportes.filter(a => a.amount > 0);

      if (aportesParaGuardar.length === 0) {
        if (!silent) setError('No hay aportes para guardar');
        return;
      }

      const response = await fetch(
        `/api/cursos/${cursoSeleccionado}/periodos/${periodoSeleccionado}/aportes`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ 
            contributions: aportesParaGuardar.map(aporte => ({
              studentId: aporte.studentId,
              amount: aporte.amount,
              month: aporte.month,
              year: aporte.year,
            }))
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Error al guardar aportes');
      }

      const data = await response.json();
      if (!silent) {
        setSuccess(`${data.contributions.length} aportes guardados exitosamente`);
      }
      
      // Recargar aportes y estadísticas solo para el mes/año actual
      await fetchAportesExistentes();
      setHasUnsavedChanges(false);

    } catch (error: any) {
      console.error('Error:', error);
      if (!silent) {
        setError(error.message || 'Error al guardar aportes');
      }
    } finally {
      setSaving(false);
    }
  };

  const calcularTotalMes = () => {
    return aportes.reduce((total, aporte) => total + (aporte.amount || 0), 0);
  };

  // Advanced filtering and search functions
  const getFilteredStudents = () => {
    let filtered = [...estudiantes];

    // Search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(estudiante => 
        estudiante.firstName.toLowerCase().includes(term) ||
        estudiante.lastName.toLowerCase().includes(term) ||
        estudiante.dni.includes(term)
      );
    }

    // Status filter
    if (filterStatus !== 'all') {
      filtered = filtered.filter(estudiante => {
        const hasAporte = getMontoAporte(estudiante.id) > 0;
        return filterStatus === 'with-aporte' ? hasAporte : !hasAporte;
      });
    }

    // Sort
    filtered.sort((a, b) => {
      let aValue, bValue;
      
      switch (sortBy) {
        case 'name':
          aValue = `${a.lastName}, ${a.firstName}`.toLowerCase();
          bValue = `${b.lastName}, ${b.firstName}`.toLowerCase();
          break;
        case 'dni':
          aValue = a.dni;
          bValue = b.dni;
          break;
        case 'amount':
          aValue = getMontoAporte(a.id);
          bValue = getMontoAporte(b.id);
          break;
        default:
          return 0;
      }

      if (aValue < bValue) return sortOrder === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });

    return filtered;
  };

  const getPaginatedStudents = () => {
    const filtered = getFilteredStudents();
    const startIndex = (currentPage - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    return filtered.slice(startIndex, endIndex);
  };

  const getTotalPages = () => {
    return Math.ceil(getFilteredStudents().length / pageSize);
  };

  // Bulk actions
  const handleSelectAll = () => {
    const currentStudents = getPaginatedStudents();
    if (selectedStudents.size === currentStudents.length) {
      setSelectedStudents(new Set());
    } else {
      setSelectedStudents(new Set(currentStudents.map(s => s.id)));
    }
  };

  const handleStudentSelection = (studentId: string) => {
    const newSelected = new Set(selectedStudents);
    if (newSelected.has(studentId)) {
      newSelected.delete(studentId);
    } else {
      newSelected.add(studentId);
    }
    setSelectedStudents(newSelected);
  };

  const copyFromPreviousMonth = async () => {
    // This would require an API call to get previous month's data
    setError('Funcionalidad en desarrollo');
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

      {/* Alerta cuando se accede desde un estudiante específico */}
      {estudianteParam && estudiantes.length > 0 && (
        <Alert className="border-blue-200 bg-blue-50 dark:bg-blue-950">
          <DollarSign className="h-4 w-4 text-blue-600" />
          <AlertDescription className="text-blue-800 dark:text-blue-200">
            <strong>Gestión de aportes para estudiante específico:</strong>{' '}
            {(() => {
              const estudiante = estudiantes.find(e => e.id === estudianteParam);
              return estudiante ? `${estudiante.lastName}, ${estudiante.firstName}` : 'Estudiante seleccionado';
            })()}
            {' '}• El estudiante aparecerá pre-seleccionado en la lista
          </AlertDescription>
        </Alert>
      )}

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
                      {curso.name}
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
                    ?.periods.map((periodo: CursoPeriodo) => (
                      <SelectItem key={periodo.id} value={periodo.id}>
                        {periodo.name}
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
                onValueChange={(value) => handleMesChange(parseInt(value))}
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
                onValueChange={(value) => handleAnioChange(parseInt(value))}
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
                  <span className="font-medium">Período:</span> {periodo.name}
                </div>
                <div>
                  <span className="font-medium">Año:</span> {periodo.year}
                </div>
                <div>
                  <span className="font-medium">Meses habilitados:</span>{' '}
                  {periodo.enabledMonths.map((m: number) => MESES[m - 1]).join(', ')}
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

      {/* Advanced Search and Filters */}
      {periodoSeleccionado && isMesHabilitado(mesSeleccionado) && (
        <Card>
          <CardHeader>
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="w-5 h-5 text-green-600" />
                  Aportes - {MESES[mesSeleccionado - 1]} {anioSeleccionado}
                </CardTitle>
                <CardDescription>
                  Los aportes son <strong>voluntarios</strong> y contribuyen al fondo común del curso
                </CardDescription>
              </div>
              <div className="flex flex-col lg:flex-row items-start lg:items-center gap-4">
                {/* Status indicators */}
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="flex items-center gap-1">
                    <Calculator className="h-3 w-3" />
                    Total: ${calcularTotalMes().toLocaleString()}
                  </Badge>
                  {hasUnsavedChanges && (
                    <Badge variant="secondary" className="flex items-center gap-1">
                      <div className="w-2 h-2 bg-orange-500 rounded-full animate-pulse" />
                      Cambios sin guardar
                    </Badge>
                  )}
                  {autoSaving && (
                    <Badge variant="outline" className="flex items-center gap-1">
                      <Loader2 className="h-3 w-3 animate-spin" />
                      Guardando...
                    </Badge>
                  )}
                  {lastSaved && !hasUnsavedChanges && (
                    <Badge variant="outline" className="text-green-600">
                      ✓ Guardado {lastSaved.toLocaleTimeString()}
                    </Badge>
                  )}
                </div>

                {/* Quick amount buttons */}
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-sm font-medium">Montos rápidos:</span>
                  {quickAmounts.map(amount => (
                    <Button
                      key={amount}
                      size="sm"
                      variant="outline"
                      onClick={() => applyQuickAmount(amount)}
                      disabled={selectedStudents.size === 0}
                      className="h-8 px-3 text-xs"
                    >
                      ${amount.toLocaleString()}
                    </Button>
                  ))}
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => applyQuickAmount(getPeriodMonthlyPrice())}
                    disabled={selectedStudents.size === 0}
                    className="h-8 px-3 text-xs bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-100"
                  >
                    Precio período (${getPeriodMonthlyPrice().toLocaleString()})
                  </Button>
                </div>

                {/* Bulk actions */}
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1">
                    <Input
                      type="number"
                      placeholder="Monto"
                      value={bulkAmount}
                      onChange={(e) => setBulkAmount(e.target.value)}
                      className="w-24 h-8 text-xs"
                      min="0"
                    />
                    <Button
                      size="sm"
                      onClick={applyBulkAmount}
                      disabled={selectedStudents.size === 0 || !bulkAmount}
                      className="h-8 px-3 text-xs"
                    >
                      Aplicar
                    </Button>
                  </div>
                  
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={selectAllStudents}
                    className="h-8 px-3 text-xs"
                  >
                    Seleccionar todos
                  </Button>
                  
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={clearAllAmounts}
                    className="h-8 px-3 text-xs text-red-600 border-red-200 hover:bg-red-50"
                  >
                    Limpiar todo
                  </Button>

                  <Button 
                    onClick={handleSaveClick} 
                    disabled={saving || aportes.filter(a => a.amount > 0).length === 0}
                    className="flex items-center gap-2 h-8 px-4 text-xs"
                  >
                    {saving ? (
                      <Loader2 className="h-3 w-3 animate-spin" />
                    ) : (
                      <Save className="h-3 w-3" />
                    )}
                    Guardar manual
                  </Button>
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Search and Filter Controls */}
            <div className="space-y-4">
              {/* Search Bar */}
              <div className="flex flex-col lg:flex-row gap-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    type="text"
                    placeholder="Buscar por nombre, apellido o DNI..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                
                {/* Filters */}
                <div className="flex gap-2">
                  <Select value={filterStatus} onValueChange={(value: any) => setFilterStatus(value)}>
                    <SelectTrigger className="w-48">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos los estudiantes</SelectItem>
                      <SelectItem value="with-aporte">Con aporte</SelectItem>
                      <SelectItem value="without-aporte">Sin aporte</SelectItem>
                    </SelectContent>
                  </Select>
                  
                  <Select value={sortBy} onValueChange={(value: any) => setSortBy(value)}>
                    <SelectTrigger className="w-40">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="name">Ordenar por nombre</SelectItem>
                      <SelectItem value="dni">Ordenar por DNI</SelectItem>
                      <SelectItem value="amount">Ordenar por monto</SelectItem>
                    </SelectContent>
                  </Select>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                  >
                    {sortOrder === 'asc' ? '↑' : '↓'}
                  </Button>
                </div>
              </div>

              {/* Action Bar */}
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <div className="flex items-center gap-4">
                  <span className="text-sm text-gray-600 dark:text-gray-300">
                    {getFilteredStudents().length} estudiantes encontrados
                    {selectedStudents.size > 0 && ` • ${selectedStudents.size} seleccionados`}
                  </span>
                  
                  {selectedStudents.size > 0 && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setShowBulkActions(!showBulkActions)}
                    >
                      <MoreHorizontal className="w-4 h-4 mr-2" />
                      Acciones Masivas
                    </Button>
                  )}
                </div>
                
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={copyFromPreviousMonth}
                    disabled={loading}
                  >
                    <Copy className="w-4 h-4 mr-2" />
                    Copiar Mes Anterior
                  </Button>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={clearAllAmounts}
                    disabled={aportes.length === 0}
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Limpiar Todo
                  </Button>
                  
                  <Select value={pageSize.toString()} onValueChange={(value) => setPageSize(parseInt(value))}>
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="25">25 por página</SelectItem>
                      <SelectItem value="50">50 por página</SelectItem>
                      <SelectItem value="100">100 por página</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Bulk Actions Panel */}
              {showBulkActions && selectedStudents.size > 0 && (
                <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                  <div className="flex items-center gap-4">
                    <span className="text-sm font-medium text-blue-900 dark:text-blue-100">
                      Aplicar monto a {selectedStudents.size} estudiantes seleccionados:
                    </span>
                    <Input
                      type="number"
                      min="0"
                      step="0.01"
                      value={bulkAmount}
                      onChange={(e) => setBulkAmount(e.target.value)}
                      placeholder="0.00"
                      className="w-32"
                    />
                    <Button
                      size="sm"
                      onClick={applyBulkAmount}
                      disabled={!bulkAmount}
                    >
                      Aplicar
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setShowBulkActions(false)}
                    >
                      Cancelar
                    </Button>
                  </div>
                </div>
              )}
            </div>

            {/* Students Table/Cards */}
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
                <span className="ml-3 text-gray-600 dark:text-gray-300">Cargando estudiantes...</span>
              </div>
            ) : getFilteredStudents().length === 0 ? (
              <div className="text-center py-12">
                <Users className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  {searchTerm ? 'No se encontraron estudiantes' : 'No hay estudiantes matriculados'}
                </h3>
                <p className="text-gray-600 dark:text-gray-300">
                  {searchTerm 
                    ? 'Intenta con otros términos de búsqueda.'
                    : 'No hay estudiantes matriculados en este período.'
                  }
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Table Header */}
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
                      <tr>
                        <th className="w-12 px-4 py-3 text-left">
                          <input
                            type="checkbox"
                            checked={selectedStudents.size === getPaginatedStudents().length && getPaginatedStudents().length > 0}
                            onChange={handleSelectAll}
                            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                          />
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          Estudiante
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          DNI
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          Monto ($)
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          Estado
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
                      {getPaginatedStudents().map(estudiante => {
                        const montoActual = getMontoAporte(estudiante.id);
                        const tieneAporte = montoActual > 0;
                        const isSelected = selectedStudents.has(estudiante.id);

                        return (
                          <tr 
                            key={estudiante.id}
                            className={`hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors ${
                              isSelected ? 'bg-blue-50 dark:bg-blue-900/20' : ''
                            }`}
                          >
                            <td className="px-4 py-4">
                              <input
                                type="checkbox"
                                checked={isSelected}
                                onChange={() => handleStudentSelection(estudiante.id)}
                                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                              />
                            </td>
                            <td className="px-4 py-4">
                              <div className="flex items-center">
                                <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center mr-3">
                                  <Users className="w-4 h-4 text-white" />
                                </div>
                                <div>
                                  <div className="text-sm font-medium text-gray-900 dark:text-white">
                                    {estudiante.lastName}, {estudiante.firstName}
                                  </div>
                                </div>
                              </div>
                            </td>
                            <td className="px-4 py-4">
                              <Badge variant="outline" className="text-xs">
                                {estudiante.dni}
                              </Badge>
                            </td>
                            <td className="px-4 py-4">
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
                                className="w-32"
                              />
                            </td>
                            <td className="px-4 py-4">
                              {tieneAporte ? (
                                <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                                  <CheckCircle className="w-3 h-3 mr-1" />
                                  Con aporte
                                </Badge>
                              ) : (
                                <Badge variant="secondary">
                                  <XCircle className="w-3 h-3 mr-1" />
                                  Sin aporte
                                </Badge>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                {/* Pagination */}
                {getTotalPages() > 1 && (
                  <div className="flex items-center justify-between border-t border-gray-200 dark:border-gray-700 pt-4">
                    <div className="text-sm text-gray-600 dark:text-gray-300">
                      Mostrando {((currentPage - 1) * pageSize) + 1} - {Math.min(currentPage * pageSize, getFilteredStudents().length)} de {getFilteredStudents().length} estudiantes
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentPage(currentPage - 1)}
                        disabled={currentPage === 1}
                      >
                        <ChevronLeft className="w-4 h-4" />
                        Anterior
                      </Button>
                      
                      <div className="flex items-center space-x-1">
                        {Array.from({ length: Math.min(5, getTotalPages()) }, (_, i) => {
                          const pageNum = Math.max(1, Math.min(getTotalPages() - 4, currentPage - 2)) + i;
                          return (
                            <Button
                              key={pageNum}
                              variant={pageNum === currentPage ? "default" : "outline"}
                              size="sm"
                              onClick={() => setCurrentPage(pageNum)}
                              className="w-8 h-8 p-0"
                            >
                              {pageNum}
                            </Button>
                          );
                        })}
                      </div>
                      
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentPage(currentPage + 1)}
                        disabled={currentPage === getTotalPages()}
                      >
                        Siguiente
                        <ChevronRight className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                )}
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
                  {estadisticas.totalContributions}
                </div>
                <div className="text-sm text-muted-foreground">
                  Total Aportes
                </div>
              </div>
              <div className="text-center p-4 bg-muted rounded-lg">
                <div className="text-2xl font-bold text-green-600 dark:text-green-300">
                  ${estadisticas.totalCollected.toLocaleString()}
                </div>
                <div className="text-sm text-muted-foreground">
                  Total Recaudado
                </div>
              </div>
              <div className="text-center p-4 bg-muted rounded-lg">
                <div className="text-2xl font-bold text-blue-600 dark:text-blue-300">
                  {estadisticas.totalEnrolled}
                </div>
                <div className="text-sm text-muted-foreground">
                  Total Matriculados
                </div>
              </div>
              <div className="text-center p-4 bg-muted rounded-lg">
                <div className="text-2xl font-bold text-orange-600">
                  {estadisticas.participationPercentage}%
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
                  Meses habilitados: {periodo.enabledMonths.map((m: number) => MESES[m - 1]).join(', ')}
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

export default function AportesPage() {
  return (
    <Suspense fallback={
      <div className="container mx-auto p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Aportes Mensuales</h1>
            <p className="text-muted-foreground">
              Cargando...
            </p>
          </div>
        </div>
      </div>
    }>
      <AportesPageContent />
    </Suspense>
  );
}
