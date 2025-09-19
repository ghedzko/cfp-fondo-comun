'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/providers/auth-provider';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Calendar, 
  BookOpen, 
  DollarSign, 
  Users,
  Download,
  Filter,
  FileText,
  TrendingUp,
  BarChart3
} from 'lucide-react';
import Link from 'next/link';
import { formatCurrency, formatNumber, formatDate } from '@/lib/format';

interface MonthlyReport {
  filters: {
    courseId: number | null;
    month: number | null;
    year: number | null;
    monthName: string | null;
  };
  data: Array<{
    coursePeriod: {
      id: number;
      name: string;
      course: {
        id: number;
        name: string;
      };
    };
    contributions: Array<{
      id: number;
      amount: number;
      month: number;
      year: number;
      paymentDate: string;
      student: {
        firstName: string;
        lastName: string;
        dni: string;
      };
    }>;
    summary: {
      totalAmount: number;
      contributionCount: number;
      enrollmentCount: number;
      contributionRate: number;
      averageAmount: number;
    };
  }>;
  metadata: {
    availableCourses: Array<{
      id: number;
      name: string;
      periodsCount: number;
    }>;
    availablePeriods: Array<{
      month: number;
      year: number;
      label: string;
    }>;
  };
  summary: {
    totalCourses: number;
    totalContributions: number;
    totalAmount: number;
    averageContribution: number;
  };
}

export default function MonthlyReportsPage() {
  const { user } = useAuth();
  const [report, setReport] = useState<MonthlyReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Filters
  const [selectedCourse, setSelectedCourse] = useState<string>('');
  const [selectedMonth, setSelectedMonth] = useState<string>('');
  const [selectedYear, setSelectedYear] = useState<string>(new Date().getFullYear().toString());

  const monthNames = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ];

  useEffect(() => {
    fetchReport();
  }, [selectedCourse, selectedMonth, selectedYear]);

  const fetchReport = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      
      if (selectedCourse) params.append('courseId', selectedCourse);
      if (selectedMonth) params.append('month', selectedMonth);
      if (selectedYear) params.append('year', selectedYear);

      const response = await fetch(`/api/reports/monthly?${params.toString()}`);
      if (!response.ok) {
        throw new Error('Failed to fetch monthly report');
      }
      const data = await response.json();
      setReport(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error loading report');
    } finally {
      setLoading(false);
    }
  };


  const exportToPDF = async () => {
    if (!report) return;

    try {
      // Dynamic import to avoid SSR issues
      const jsPDF = (await import('jspdf')).default;
      const autoTable = (await import('jspdf-autotable')).default;

      const doc = new jsPDF();
      
      // Header
      doc.setFontSize(20);
      doc.setTextColor(40, 40, 40);
      doc.text('CFP Fondo Común - Lago Puelo', 20, 25);
      
      doc.setFontSize(16);
      doc.text('Reporte Mensual de Aportes', 20, 35);
      
      // Filters info
      doc.setFontSize(12);
      doc.setTextColor(100, 100, 100);
      let filterText = 'Filtros aplicados: ';
      if (report.filters.monthName) {
        filterText += `${report.filters.monthName} ${report.filters.year || ''}`;
      } else {
        filterText += `Año ${report.filters.year || new Date().getFullYear()}`;
      }
      if (selectedCourse && report.metadata.availableCourses.find(c => c.id.toString() === selectedCourse)) {
        const courseName = report.metadata.availableCourses.find(c => c.id.toString() === selectedCourse)?.name;
        filterText += ` - Curso: ${courseName}`;
      }
      doc.text(filterText, 20, 45);
      
      // Summary section
      doc.setFontSize(14);
      doc.setTextColor(40, 40, 40);
      doc.text('Resumen General', 20, 60);
      
      const summaryData = [
        ['Total de Cursos', report.summary.totalCourses.toString()],
        ['Total de Aportes', report.summary.totalContributions.toString()],
        ['Monto Total Recaudado', formatCurrency(report.summary.totalAmount)],
        ['Promedio por Aporte', formatCurrency(report.summary.averageContribution)]
      ];
      
      autoTable(doc, {
        startY: 65,
        head: [['Concepto', 'Valor']],
        body: summaryData,
        theme: 'grid',
        headStyles: { fillColor: [59, 130, 246] },
        styles: { fontSize: 10 },
        margin: { left: 20, right: 20 }
      });
      
      // Detail by course
      let currentY = (doc as any).lastAutoTable.finalY + 20;
      
      if (report.data.length > 0) {
        doc.setFontSize(14);
        doc.text('Detalle por Curso y Período', 20, currentY);
        currentY += 10;
        
        report.data.forEach((courseData, index) => {
          // Course header
          doc.setFontSize(12);
          doc.setTextColor(40, 40, 40);
          doc.text(`${courseData.coursePeriod.course.name} - ${courseData.coursePeriod.name}`, 20, currentY);
          currentY += 5;
          
          // Course summary
          const courseSummaryData = [
            ['Estudiantes Matriculados', courseData.summary.enrollmentCount.toString()],
            ['Aportes Recibidos', courseData.summary.contributionCount.toString()],
            ['Tasa de Aporte', `${(courseData.summary.contributionRate * 100).toFixed(1)}%`],
            ['Monto Total', formatCurrency(courseData.summary.totalAmount)],
            ['Promedio por Aporte', formatCurrency(courseData.summary.averageAmount)]
          ];
          
          autoTable(doc, {
            startY: currentY,
            head: [['Concepto', 'Valor']],
            body: courseSummaryData,
            theme: 'striped',
            headStyles: { fillColor: [34, 197, 94] },
            styles: { fontSize: 9 },
            margin: { left: 25, right: 20 }
          });
          
          currentY = (doc as any).lastAutoTable.finalY + 5;
          
          // Student contributions
          if (courseData.contributions.length > 0) {
            const contributionsData = courseData.contributions.map(contrib => [
              `${contrib.student.lastName}, ${contrib.student.firstName}`,
              contrib.student.dni,
              formatCurrency(contrib.amount),
              formatDate(contrib.paymentDate)
            ]);
            
            autoTable(doc, {
              startY: currentY,
              head: [['Estudiante', 'DNI', 'Monto', 'Fecha de Pago']],
              body: contributionsData,
              theme: 'plain',
              headStyles: { fillColor: [156, 163, 175], textColor: [255, 255, 255] },
              styles: { fontSize: 8 },
              margin: { left: 30, right: 20 }
            });
            
            currentY = (doc as any).lastAutoTable.finalY + 15;
          } else {
            doc.setFontSize(10);
            doc.setTextColor(150, 150, 150);
            doc.text('No hay aportes registrados para este período', 30, currentY);
            currentY += 15;
          }
          
          // Add new page if needed
          if (currentY > 250 && index < report.data.length - 1) {
            doc.addPage();
            currentY = 20;
          }
        });
      }
      
      // Footer
      const pageCount = doc.getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.setTextColor(150, 150, 150);
        doc.text(
          `Generado el ${formatDate(new Date().toISOString())} - Página ${i} de ${pageCount}`,
          20,
          doc.internal.pageSize.height - 10
        );
      }
      
      // Generate filename
      const dateStr = new Date().toISOString().split('T')[0];
      let filename = `reporte-mensual-${dateStr}`;
      if (report.filters.monthName) {
        filename += `-${report.filters.monthName.toLowerCase()}-${report.filters.year}`;
      }
      if (selectedCourse) {
        const courseName = report.metadata.availableCourses.find(c => c.id.toString() === selectedCourse)?.name;
        if (courseName) {
          filename += `-${courseName.toLowerCase().replace(/\s+/g, '-')}`;
        }
      }
      filename += '.pdf';
      
      // Save the PDF
      doc.save(filename);
      
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Error al generar el PDF. Por favor, intenta nuevamente.');
    }
  };

  const exportToCSV = async () => {
    if (!report) return;

    const csvData = [];
    
    // Headers
    csvData.push([
      'Curso',
      'Período',
      'Estudiante',
      'DNI',
      'Monto',
      'Mes',
      'Año',
      'Fecha de Pago'
    ]);

    // Data rows
    report.data.forEach(courseData => {
      courseData.contributions.forEach(contribution => {
        csvData.push([
          courseData.coursePeriod.course.name,
          courseData.coursePeriod.name,
          `${contribution.student.firstName} ${contribution.student.lastName}`,
          contribution.student.dni,
          contribution.amount,
          contribution.month,
          contribution.year,
          formatDate(contribution.paymentDate)
        ]);
      });
    });

    // Convert to CSV string
    const csvContent = csvData.map(row => row.join(',')).join('\n');
    
    // Download
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `reporte-mensual-${selectedYear}-${selectedMonth || 'todos'}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Generando reporte...</h1>
          <p className="text-gray-600 dark:text-gray-300">Procesando datos mensuales...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
        <Card className="max-w-md">
          <CardContent className="p-6 text-center">
            <div className="text-red-500 mb-4">
              <FileText className="w-12 h-12 mx-auto" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Error al generar reporte</h2>
            <p className="text-gray-600 dark:text-gray-300 mb-4">{error}</p>
            <Button onClick={fetchReport}>Reintentar</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!report) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Header */}
      <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-700 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link href="/dashboard/reports">
                <Button variant="outline" size="sm">
                  ← Volver a Reportes
                </Button>
              </Link>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  Reportes Mensuales
                </h1>
                <p className="text-gray-600 dark:text-gray-300">
                  Análisis detallado de aportes por período
                  {report.filters.monthName && report.filters.year && (
                    <span className="font-medium"> - {report.filters.monthName} {report.filters.year}</span>
                  )}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Button variant="outline" size="sm" onClick={exportToPDF}>
                <Download className="w-4 h-4 mr-2" />
                PDF
              </Button>
              <Button variant="outline" size="sm" onClick={exportToCSV}>
                <FileText className="w-4 h-4 mr-2" />
                CSV
              </Button>
            </div>
          </div>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8" role="main">
        {/* Filters */}
        <Card className="border-0 shadow-lg mb-8">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Filter className="w-5 h-5" />
              <span>Filtros de Búsqueda</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Curso
                </label>
                <select
                  value={selectedCourse}
                  onChange={(e) => setSelectedCourse(e.target.value)}
                  className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                >
                  <option value="">Todos los cursos</option>
                  {report.metadata.availableCourses.map(course => (
                    <option key={course.id} value={course.id}>
                      {course.name} ({course.periodsCount} períodos)
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Mes
                </label>
                <select
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(e.target.value)}
                  className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                >
                  <option value="">Todos los meses</option>
                  {monthNames.map((month, index) => (
                    <option key={index + 1} value={index + 1}>
                      {month}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Año
                </label>
                <select
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(e.target.value)}
                  className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                >
                  {Array.from(new Set(report.metadata.availablePeriods.map(p => p.year)))
                    .sort((a, b) => b - a)
                    .map(year => (
                      <option key={year} value={year}>
                        {year}
                      </option>
                    ))}
                </select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-blue-600 dark:text-blue-400">Cursos</p>
                  <p className="text-3xl font-bold text-blue-700 dark:text-blue-300">{formatNumber(report.summary.totalCourses)}</p>
                </div>
                <BookOpen className="w-8 h-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-green-600 dark:text-green-400">Aportes</p>
                  <p className="text-3xl font-bold text-green-700 dark:text-green-300">{formatNumber(report.summary.totalContributions)}</p>
                </div>
                <Users className="w-8 h-8 text-green-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-purple-600 dark:text-purple-400">Total</p>
                  <p className="text-2xl font-bold text-purple-700 dark:text-purple-300">
                    {formatCurrency(report.summary.totalAmount)}
                  </p>
                </div>
                <DollarSign className="w-8 h-8 text-purple-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-gradient-to-br from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-orange-600 dark:text-orange-400">Promedio</p>
                  <p className="text-2xl font-bold text-orange-700 dark:text-orange-300">
                    {formatCurrency(report.summary.averageContribution)}
                  </p>
                </div>
                <TrendingUp className="w-8 h-8 text-orange-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Course Reports */}
        <div className="space-y-6">
          {report.data.map((courseData) => (
            <Card key={courseData.coursePeriod.id} className="border-0 shadow-lg">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-xl">{courseData.coursePeriod.course.name}</CardTitle>
                    <CardDescription>{courseData.coursePeriod.name}</CardDescription>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                      {formatCurrency(courseData.summary.totalAmount)}
                    </p>
                    <p className="text-sm text-gray-500">
                      {courseData.summary.contributionRate}% de participación
                    </p>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {/* Course Summary */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <div className="text-center">
                    <p className="text-sm text-gray-600 dark:text-gray-400">Matriculados</p>
                    <p className="text-xl font-bold text-gray-900 dark:text-white">{courseData.summary.enrollmentCount}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm text-gray-600 dark:text-gray-400">Aportantes</p>
                    <p className="text-xl font-bold text-gray-900 dark:text-white">{courseData.summary.contributionCount}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm text-gray-600 dark:text-gray-400">Promedio</p>
                    <p className="text-xl font-bold text-gray-900 dark:text-white">{formatCurrency(courseData.summary.averageAmount)}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm text-gray-600 dark:text-gray-400">Participación</p>
                    <p className="text-xl font-bold text-gray-900 dark:text-white">{courseData.summary.contributionRate}%</p>
                  </div>
                </div>

                {/* Contributions List */}
                <div className="space-y-2">
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-3">
                    Aportes Registrados ({courseData.contributions.length})
                  </h4>
                  {courseData.contributions.length > 0 ? (
                    <div className="grid gap-2">
                      {courseData.contributions.map((contribution) => (
                        <div key={contribution.id} className="flex items-center justify-between p-3 border border-gray-200 dark:border-gray-700 rounded-lg">
                          <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center">
                              <DollarSign className="w-4 h-4 text-green-600 dark:text-green-400" />
                            </div>
                            <div>
                              <p className="font-medium text-gray-900 dark:text-white">
                                {contribution.student.firstName} {contribution.student.lastName}
                              </p>
                              <p className="text-sm text-gray-500">DNI: {contribution.student.dni}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="font-bold text-gray-900 dark:text-white">{formatCurrency(contribution.amount)}</p>
                            <p className="text-sm text-gray-500">
                              {contribution.month}/{contribution.year} - {formatDate(contribution.paymentDate)}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      <BarChart3 className="w-12 h-12 mx-auto mb-4 opacity-50" />
                      <p>No hay aportes registrados para este período</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {report.data.length === 0 && (
          <Card className="border-0 shadow-lg">
            <CardContent className="p-12 text-center">
              <Calendar className="w-16 h-16 mx-auto mb-4 text-gray-400" />
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                No hay datos para mostrar
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                No se encontraron aportes para los filtros seleccionados.
                Intenta ajustar los criterios de búsqueda.
              </p>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
}
