'use client';

import { useState, useCallback } from 'react';
import { useAuth } from '@/providers/auth-provider';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Breadcrumb } from '@/components/breadcrumb';
import {
  ArrowLeft,
  Upload,
  Download,
  FileText,
  Users,
  CheckCircle,
  AlertCircle,
  Info,
  Loader2
} from 'lucide-react';

interface CsvStudent {
  dni: string;
  firstName: string;
  lastName: string;
  email?: string;
  phone?: string;
  address?: string;
  birthDate?: string;
}

interface ImportResult {
  success: boolean;
  imported: number;
  skipped: number;
  errors: Array<{
    row: number;
    dni: string;
    error: string;
  }>;
  duplicates: Array<{
    row: number;
    dni: string;
    existingStudent: {
      id: string;
      firstName: string;
      lastName: string;
    };
  }>;
}

export default function ImportarEstudiantesPage() {
  const { user, isAdmin } = useAuth();
  const router = useRouter();
  
  const [csvData, setCsvData] = useState<CsvStudent[]>([]);
  const [dragActive, setDragActive] = useState(false);
  const [loading, setLoading] = useState(false);
  const [importing, setImporting] = useState(false);
  const [error, setError] = useState<string>('');
  const [importResult, setImportResult] = useState<ImportResult | null>(null);
  const [skipDuplicates, setSkipDuplicates] = useState(true);

  const downloadTemplate = async () => {
    try {
      const response = await fetch('/api/estudiantes/import', {
        credentials: 'include',
      });
      
      if (response.ok) {
        const data = await response.json();
        const csv = convertToCSV(data.template);
        downloadCSV(csv, 'plantilla_estudiantes.csv');
      }
    } catch (error) {
      console.error('Error downloading template:', error);
      setError('Error al descargar la plantilla');
    }
  };

  const convertToCSV = (data: any[]) => {
    if (data.length === 0) return '';
    
    const headers = Object.keys(data[0]);
    const csvContent = [
      headers.join(','),
      ...data.map(row => 
        headers.map(header => {
          const value = row[header] || '';
          // Escape commas and quotes
          return value.toString().includes(',') ? `"${value}"` : value;
        }).join(',')
      )
    ].join('\n');
    
    return csvContent;
  };

  const downloadCSV = (csv: string, filename: string) => {
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const parseCSV = (text: string): CsvStudent[] => {
    const lines = text.split('\n').filter(line => line.trim());
    if (lines.length < 2) return [];

    const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
    const data: CsvStudent[] = [];

    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(',').map(v => v.trim().replace(/"/g, ''));
      const student: any = {};
      
      headers.forEach((header, index) => {
        if (values[index]) {
          student[header] = values[index];
        }
      });

      if (student.dni && student.firstName && student.lastName) {
        data.push(student as CsvStudent);
      }
    }

    return data;
  };

  const handleFile = useCallback((file: File) => {
    if (!file.name.endsWith('.csv')) {
      setError('Solo se permiten archivos CSV');
      return;
    }

    setLoading(true);
    setError('');
    
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const text = e.target?.result as string;
        const parsed = parseCSV(text);
        
        if (parsed.length === 0) {
          setError('No se encontraron estudiantes válidos en el archivo');
        } else {
          setCsvData(parsed);
          setImportResult(null);
        }
      } catch (error) {
        setError('Error al procesar el archivo CSV');
      } finally {
        setLoading(false);
      }
    };
    
    reader.readAsText(file);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFile(files[0]);
    }
  }, [handleFile]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
  }, []);

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFile(files[0]);
    }
  };

  const handleImport = async () => {
    if (csvData.length === 0) return;

    setImporting(true);
    setError('');

    try {
      const response = await fetch('/api/estudiantes/import', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          csvData,
          skipDuplicates,
        }),
      });

      const result = await response.json();
      
      if (response.ok) {
        setImportResult(result);
        if (result.success && result.imported > 0) {
          // Clear CSV data after successful import
          setCsvData([]);
        }
      } else {
        setError(result.error || 'Error al importar estudiantes');
      }

    } catch (error) {
      console.error('Error:', error);
      setError('Error al importar estudiantes');
    } finally {
      setImporting(false);
    }
  };

  // Redirect if not admin
  if (user && !isAdmin) {
    router.push('/dashboard/estudiantes');
    return null;
  }

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
              Solo los administradores pueden importar estudiantes.
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
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <Breadcrumb items={[
            { label: 'Estudiantes', href: '/dashboard/estudiantes' },
            { label: 'Importar desde CSV' }
          ]} />
          <h1 className="text-3xl font-bold mt-2">Importar Estudiantes</h1>
          <p className="text-muted-foreground">
            Importa múltiples estudiantes desde un archivo CSV
          </p>
        </div>
        <Link href="/dashboard/estudiantes">
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

      {/* Instructions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Info className="w-5 h-5" />
            Instrucciones
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-semibold mb-2">Formato del archivo CSV:</h3>
              <ul className="text-sm space-y-1 text-gray-600 dark:text-gray-300">
                <li>• <strong>dni</strong>: DNI del estudiante (requerido)</li>
                <li>• <strong>firstName</strong>: Nombre (requerido)</li>
                <li>• <strong>lastName</strong>: Apellido (requerido)</li>
                <li>• <strong>email</strong>: Email (opcional)</li>
                <li>• <strong>phone</strong>: Teléfono (opcional)</li>
                <li>• <strong>address</strong>: Dirección (opcional)</li>
                <li>• <strong>birthDate</strong>: Fecha nacimiento YYYY-MM-DD (opcional)</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-2">Descargar plantilla:</h3>
              <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">
                Descarga un archivo CSV de ejemplo con el formato correcto.
              </p>
              <Button onClick={downloadTemplate} variant="outline" size="sm">
                <Download className="w-4 h-4 mr-2" />
                Descargar Plantilla
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* File Upload */}
      <Card>
        <CardHeader>
          <CardTitle>Subir Archivo CSV</CardTitle>
          <CardDescription>
            Arrastra y suelta tu archivo CSV o haz clic para seleccionarlo
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div
            className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
              dragActive
                ? 'border-blue-500 bg-blue-50 dark:bg-blue-950/20'
                : 'border-gray-300 dark:border-gray-600'
            }`}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
          >
            {loading ? (
              <div className="space-y-4">
                <Loader2 className="w-12 h-12 text-blue-500 mx-auto animate-spin" />
                <p className="text-gray-600 dark:text-gray-300">Procesando archivo...</p>
              </div>
            ) : (
              <div className="space-y-4">
                <FileText className="w-12 h-12 text-gray-400 mx-auto" />
                <div>
                  <p className="text-lg font-medium text-gray-900 dark:text-white">
                    Arrastra tu archivo CSV aquí
                  </p>
                  <p className="text-gray-600 dark:text-gray-300">
                    o haz clic para seleccionar
                  </p>
                </div>
                <input
                  type="file"
                  accept=".csv"
                  onChange={handleFileInput}
                  className="hidden"
                  id="csv-upload"
                />
                <label htmlFor="csv-upload">
                  <Button variant="outline" className="cursor-pointer">
                    <Upload className="w-4 h-4 mr-2" />
                    Seleccionar Archivo
                  </Button>
                </label>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Preview */}
      {csvData.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5" />
              Vista Previa ({csvData.length} estudiantes)
            </CardTitle>
            <CardDescription>
              Revisa los datos antes de importar
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Options */}
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="skipDuplicates"
                  checked={skipDuplicates}
                  onChange={(e) => setSkipDuplicates(e.target.checked)}
                  className="rounded"
                />
                <label htmlFor="skipDuplicates" className="text-sm">
                  Omitir estudiantes duplicados (por DNI)
                </label>
              </div>

              {/* Preview Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-2">DNI</th>
                      <th className="text-left p-2">Nombre</th>
                      <th className="text-left p-2">Apellido</th>
                      <th className="text-left p-2">Email</th>
                      <th className="text-left p-2">Teléfono</th>
                    </tr>
                  </thead>
                  <tbody>
                    {csvData.slice(0, 10).map((student, index) => (
                      <tr key={index} className="border-b">
                        <td className="p-2">{student.dni}</td>
                        <td className="p-2">{student.firstName}</td>
                        <td className="p-2">{student.lastName}</td>
                        <td className="p-2">{student.email || '-'}</td>
                        <td className="p-2">{student.phone || '-'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {csvData.length > 10 && (
                  <p className="text-sm text-gray-500 mt-2">
                    ... y {csvData.length - 10} estudiantes más
                  </p>
                )}
              </div>

              {/* Import Button */}
              <div className="flex justify-end">
                <Button 
                  onClick={handleImport} 
                  disabled={importing}
                  className="flex items-center gap-2"
                >
                  {importing ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Upload className="w-4 h-4" />
                  )}
                  {importing ? 'Importando...' : 'Importar Estudiantes'}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Import Results */}
      {importResult && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {importResult.success ? (
                <CheckCircle className="w-5 h-5 text-green-600" />
              ) : (
                <AlertCircle className="w-5 h-5 text-red-600" />
              )}
              Resultado de la Importación
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Summary */}
              <div className="grid grid-cols-3 gap-4 text-center">
                <div className="p-4 bg-green-50 dark:bg-green-950/20 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">{importResult.imported}</div>
                  <div className="text-sm text-green-700 dark:text-green-300">Importados</div>
                </div>
                <div className="p-4 bg-yellow-50 dark:bg-yellow-950/20 rounded-lg">
                  <div className="text-2xl font-bold text-yellow-600">{importResult.skipped}</div>
                  <div className="text-sm text-yellow-700 dark:text-yellow-300">Omitidos</div>
                </div>
                <div className="p-4 bg-red-50 dark:bg-red-950/20 rounded-lg">
                  <div className="text-2xl font-bold text-red-600">{importResult.errors.length}</div>
                  <div className="text-sm text-red-700 dark:text-red-300">Errores</div>
                </div>
              </div>

              {/* Duplicates */}
              {importResult.duplicates.length > 0 && (
                <div>
                  <h3 className="font-semibold mb-2">Estudiantes Duplicados:</h3>
                  <div className="space-y-1 text-sm">
                    {importResult.duplicates.slice(0, 5).map((dup, index) => (
                      <div key={index} className="text-yellow-700 dark:text-yellow-300">
                        Fila {dup.row}: {dup.dni} - Ya existe: {dup.existingStudent.firstName} {dup.existingStudent.lastName}
                      </div>
                    ))}
                    {importResult.duplicates.length > 5 && (
                      <div className="text-sm text-gray-500">
                        ... y {importResult.duplicates.length - 5} duplicados más
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Errors */}
              {importResult.errors.length > 0 && (
                <div>
                  <h3 className="font-semibold mb-2">Errores:</h3>
                  <div className="space-y-1 text-sm">
                    {importResult.errors.slice(0, 5).map((error, index) => (
                      <div key={index} className="text-red-700 dark:text-red-300">
                        Fila {error.row}: {error.dni} - {error.error}
                      </div>
                    ))}
                    {importResult.errors.length > 5 && (
                      <div className="text-sm text-gray-500">
                        ... y {importResult.errors.length - 5} errores más
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Success Actions */}
              {importResult.success && importResult.imported > 0 && (
                <div className="flex justify-end">
                  <Link href="/dashboard/estudiantes">
                    <Button>
                      <Users className="w-4 h-4 mr-2" />
                      Ver Estudiantes
                    </Button>
                  </Link>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
