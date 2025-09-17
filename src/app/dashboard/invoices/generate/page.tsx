'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  ArrowLeft,
  Calendar,
  FileText,
  Users,
  DollarSign,
  AlertCircle,
  CheckCircle,
  Eye
} from 'lucide-react';
import { useAuth } from '@/providers/auth-provider';

interface Course {
  id: string;
  name: string;
  description?: string;
}

interface PreviewItem {
  coursePeriodId: string;
  courseName: string;
  periodName: string;
  enrolledStudents: number;
  monthlyPrice: number;
  totalAmount: number;
  month: number;
  year: number;
}

interface GenerationSummary {
  eligiblePeriods: number;
  periodsWithExistingInvoices: number;
  periodsToProcess: number;
  estimatedTotalAmount: number;
  month: number;
  year: number;
}

interface ExistingInvoice {
  coursePeriodId: string;
  courseName: string;
  periodName: string;
  invoiceId: string;
  status: string;
  totalAmount: number;
}

const MONTHS = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
];

export default function GenerateInvoicesPage() {
  const { user } = useAuth();
  const router = useRouter();
  
  const [courses, setCourses] = useState<Course[]>([]);
  const [selectedCourses, setSelectedCourses] = useState<string[]>([]);
  const [month, setMonth] = useState<number>(new Date().getMonth() + 1);
  const [year, setYear] = useState<number>(new Date().getFullYear());
  const [dueDate, setDueDate] = useState<string>('');
  const [notes, setNotes] = useState<string>('');
  
  const [preview, setPreview] = useState<PreviewItem[]>([]);
  const [summary, setSummary] = useState<GenerationSummary | null>(null);
  const [existingInvoices, setExistingInvoices] = useState<ExistingInvoice[]>([]);
  
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Check if user is admin
  useEffect(() => {
    if (user && user.role !== 'ADMIN') {
      router.push('/dashboard');
      return;
    }
  }, [user, router]);

  // Set default due date (end of current month)
  useEffect(() => {
    const today = new Date();
    const lastDayOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);
    setDueDate(lastDayOfMonth.toISOString().split('T')[0]);
  }, []);

  // Fetch courses
  useEffect(() => {
    const fetchCourses = async () => {
      if (user?.role !== 'ADMIN') return;

      try {
        const response = await fetch('/api/cursos');
        if (!response.ok) throw new Error('Failed to fetch courses');
        
        const data = await response.json();
        setCourses(data.courses || []);
      } catch (error) {
        console.error('Error fetching courses:', error);
        setError('Error al cargar los cursos');
      }
    };

    fetchCourses();
  }, [user]);

  // Generate preview
  const generatePreview = async () => {
    if (!month || !year) {
      setError('Mes y año son requeridos');
      return;
    }

    try {
      setPreviewLoading(true);
      setError(null);
      
      const params = new URLSearchParams({
        month: month.toString(),
        year: year.toString(),
        ...(selectedCourses.length > 0 && { courseIds: selectedCourses.join(',') })
      });

      const response = await fetch(`/api/invoices/generate?${params}`);
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to generate preview');
      }

      const data = await response.json();
      setPreview(data.preview || []);
      setSummary(data.summary);
      setExistingInvoices(data.existingInvoices || []);
    } catch (error) {
      console.error('Error generating preview:', error);
      setError(error instanceof Error ? error.message : 'Error al generar vista previa');
    } finally {
      setPreviewLoading(false);
    }
  };

  // Generate invoices
  const generateInvoices = async () => {
    if (!month || !year || !dueDate) {
      setError('Todos los campos son requeridos');
      return;
    }

    if (preview.length === 0) {
      setError('No hay facturas para generar');
      return;
    }

    try {
      setGenerating(true);
      setError(null);
      setSuccess(null);

      const requestData = {
        month,
        year,
        dueDate,
        notes: notes.trim() || undefined,
        ...(selectedCourses.length > 0 && { courseIds: selectedCourses })
      };

      const response = await fetch('/api/invoices/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to generate invoices');
      }

      const data = await response.json();
      setSuccess(`✅ Se generaron ${data.summary.totalInvoicesCreated} facturas exitosamente por un total de $${data.summary.totalAmount.toLocaleString()}`);
      
      // Clear form and preview
      setPreview([]);
      setSummary(null);
      setExistingInvoices([]);
      setNotes('');
      
    } catch (error) {
      console.error('Error generating invoices:', error);
      setError(error instanceof Error ? error.message : 'Error al generar facturas');
    } finally {
      setGenerating(false);
    }
  };

  // Handle course selection
  const handleCourseToggle = (courseId: string) => {
    setSelectedCourses(prev => 
      prev.includes(courseId) 
        ? prev.filter(id => id !== courseId)
        : [...prev, courseId]
    );
  };

  if (user?.role !== 'ADMIN') {
    return null; // Will redirect in useEffect
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button
          onClick={() => router.back()}
          variant="outline"
          size="sm"
          className="flex items-center gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          Volver
        </Button>
        <div>
          <h1 className="text-3xl font-bold">Generar Facturas</h1>
          <p className="text-muted-foreground">Generación masiva de facturas mensuales por curso</p>
        </div>
      </div>

      {/* Error/Success Messages */}
      {error && (
        <Card className="border-red-200 bg-red-50 dark:border-red-500 dark:bg-red-900/30">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-red-800 dark:text-red-200">
              <AlertCircle className="w-5 h-5" />
              <p>{error}</p>
            </div>
          </CardContent>
        </Card>
      )}

      {success && (
        <Card className="border-green-200 bg-green-50 dark:border-green-500 dark:bg-green-900/20">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-green-800 dark:text-green-200">
              <CheckCircle className="w-5 h-5" />
              <p>{success}</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Generation Form */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              Configuración de Generación
            </CardTitle>
            <CardDescription>
              Configure los parámetros para generar las facturas
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Mes</label>
                <select
                  value={month}
                  onChange={(e) => setMonth(parseInt(e.target.value))}
                  className="w-full p-2 border rounded-md"
                  disabled={generating}
                >
                  {MONTHS.map((monthName, index) => (
                    <option key={index + 1} value={index + 1}>
                      {monthName}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Año</label>
                <select
                  value={year}
                  onChange={(e) => setYear(parseInt(e.target.value))}
                  className="w-full p-2 border rounded-md"
                  disabled={generating}
                >
                  {[2024, 2025, 2026].map(yearOption => (
                    <option key={yearOption} value={yearOption}>
                      {yearOption}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Fecha de Vencimiento</label>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full p-2 border rounded-md"
                disabled={generating}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Notas (Opcional)</label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Notas adicionales para las facturas..."
                className="w-full p-2 border rounded-md h-20 resize-none"
                disabled={generating}
              />
            </div>

            <div className="flex gap-2">
              <Button
                onClick={generatePreview}
                disabled={previewLoading || generating}
                className="flex items-center gap-2"
              >
                <Eye className="w-4 h-4" />
                {previewLoading ? 'Generando Vista Previa...' : 'Vista Previa'}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Course Selection */}
        <Card>
          <CardHeader>
            <CardTitle>Selección de Cursos</CardTitle>
            <CardDescription>
              Seleccione cursos específicos o deje vacío para todos los cursos activos
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              <div className="flex items-center gap-2 p-2 border rounded">
                <input
                  type="checkbox"
                  id="all-courses"
                  checked={selectedCourses.length === 0}
                  onChange={() => setSelectedCourses([])}
                  disabled={generating}
                />
                <label htmlFor="all-courses" className="font-medium">
                  Todos los cursos activos
                </label>
              </div>
              
              {courses.map((course) => (
                <div key={course.id} className="flex items-center gap-2 p-2 border rounded">
                  <input
                    type="checkbox"
                    id={`course-${course.id}`}
                    checked={selectedCourses.includes(course.id)}
                    onChange={() => handleCourseToggle(course.id)}
                    disabled={generating}
                  />
                  <label htmlFor={`course-${course.id}`} className="flex-1">
                    <div className="font-medium">{course.name}</div>
                    {course.description && (
                      <div className="text-sm text-muted-foreground">{course.description}</div>
                    )}
                  </label>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Preview Results */}
      {summary && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5" />
              Vista Previa - {MONTHS[month - 1]} {year}
            </CardTitle>
            <CardDescription>
              Resumen de facturas que se generarán
            </CardDescription>
          </CardHeader>
          <CardContent>
            {/* Summary Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              <div className="bg-blue-50 dark:bg-blue-900/30 p-4 rounded-lg">
                <div className="flex items-center gap-2">
                  <FileText className="w-5 h-5 text-blue-600 dark:text-blue-200" />
                  <div>
                    <p className="text-sm text-blue-600 dark:text-blue-200">Períodos Elegibles</p>
                    <p className="text-xl font-bold text-blue-800 dark:text-blue-100">{summary.eligiblePeriods}</p>
                  </div>
                </div>
              </div>

              <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-200" />
                  <div>
                    <p className="text-sm text-green-600 dark:text-green-200">A Procesar</p>
                    <p className="text-xl font-bold text-green-800 dark:text-green-100">{summary.periodsToProcess}</p>
                  </div>
                </div>
              </div>

              <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg">
                <div className="flex items-center gap-2">
                  <AlertCircle className="w-5 h-5 text-yellow-600 dark:text-yellow-200" />
                  <div>
                    <p className="text-sm text-yellow-600 dark:text-yellow-200">Ya Facturados</p>
                    <p className="text-xl font-bold text-yellow-800 dark:text-yellow-100">{summary.periodsWithExistingInvoices}</p>
                  </div>
                </div>
              </div>

              <div className="bg-purple-50 dark:bg-purple-900/25 p-4 rounded-lg">
                <div className="flex items-center gap-2">
                  <DollarSign className="w-5 h-5 text-purple-600 dark:text-purple-200" />
                  <div>
                    <p className="text-sm text-purple-600 dark:text-purple-200">Monto Total</p>
                    <p className="text-xl font-bold text-purple-800 dark:text-purple-100">
                      ${summary.estimatedTotalAmount.toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Preview Table */}
            {preview.length > 0 && (
              <div className="space-y-4">
                <h3 className="font-semibold text-lg">Facturas a Generar ({preview.length})</h3>
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse border">
                    <thead>
                      <tr className="bg-muted">
                        <th className="border p-2 text-left">Curso</th>
                        <th className="border p-2 text-left">Período</th>
                        <th className="border p-2 text-center">Estudiantes</th>
                        <th className="border p-2 text-right">Precio Mensual</th>
                        <th className="border p-2 text-right">Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      {preview.map((item, index) => (
                        <tr key={index} className="hover:bg-muted/50">
                          <td className="border p-2 font-medium">{item.courseName}</td>
                          <td className="border p-2">{item.periodName}</td>
                          <td className="border p-2 text-center">{item.enrolledStudents}</td>
                          <td className="border p-2 text-right">
                            ${item.monthlyPrice.toLocaleString()}
                          </td>
                          <td className="border p-2 text-right font-semibold">
                            ${item.totalAmount.toLocaleString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="flex justify-end">
                  <Button
                    onClick={generateInvoices}
                    disabled={generating || preview.length === 0}
                    className="flex items-center gap-2"
                    size="lg"
                  >
                    <FileText className="w-5 h-5" />
                    {generating ? 'Generando Facturas...' : `Generar ${preview.length} Facturas`}
                  </Button>
                </div>
              </div>
            )}

            {/* Existing Invoices */}
            {existingInvoices.length > 0 && (
              <div className="mt-6 space-y-4">
                <h3 className="font-semibold text-lg text-yellow-800 dark:text-yellow-200">
                  Facturas Ya Existentes ({existingInvoices.length})
                </h3>
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse border">
                    <thead>
                      <tr className="bg-yellow-50 dark:bg-yellow-900/20">
                        <th className="border p-2 text-left">Curso</th>
                        <th className="border p-2 text-left">Período</th>
                        <th className="border p-2 text-center">Estado</th>
                        <th className="border p-2 text-right">Monto</th>
                        <th className="border p-2 text-center">Acciones</th>
                      </tr>
                    </thead>
                    <tbody>
                      {existingInvoices.map((invoice, index) => (
                        <tr key={index} className="hover:bg-yellow-100/40 dark:hover:bg-yellow-900/30">
                          <td className="border p-2">{invoice.courseName}</td>
                          <td className="border p-2">{invoice.periodName}</td>
                          <td className="border p-2 text-center">
                            <span className={`px-2 py-1 rounded text-xs ${
                              invoice.status === 'PAID'
                                ? 'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-200'
                                : invoice.status === 'PENDING'
                                  ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/40 dark:text-yellow-200'
                                  : invoice.status === 'OVERDUE'
                                    ? 'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-200'
                                    : 'bg-muted text-muted-foreground dark:bg-muted/60'
                            }`}>
                              {invoice.status === 'PAID' ? 'Pagada' :
                               invoice.status === 'PENDING' ? 'Pendiente' :
                               invoice.status === 'OVERDUE' ? 'Vencida' : 'Cancelada'}
                            </span>
                          </td>
                          <td className="border p-2 text-right">
                            ${invoice.totalAmount.toLocaleString()}
                          </td>
                          <td className="border p-2 text-center">
                            <Button
                              onClick={() => router.push(`/dashboard/invoices/${invoice.invoiceId}`)}
                              size="sm"
                              variant="outline"
                              className="text-xs"
                            >
                              Ver
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {preview.length === 0 && summary && summary.periodsToProcess === 0 && (
              <div className="text-center py-8">
                <AlertCircle className="w-12 h-12 text-yellow-500 dark:text-yellow-300 mx-auto mb-4" />
                <p className="text-muted-foreground">
                  No hay períodos de curso elegibles para generar facturas en {MONTHS[month - 1]} {year}
                </p>
                <p className="text-sm text-muted-foreground mt-2">
                  Esto puede deberse a que ya existen facturas para este período o no hay cursos activos con este mes habilitado.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
