'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  FileText, 
  Download, 
  Plus, 
  Search, 
  Filter,
  Calendar,
  DollarSign,
  Users,
  TrendingUp,
  Eye,
  Edit,
  Trash2
} from 'lucide-react';
import { useAuth } from '@/providers/auth-provider';

interface Invoice {
  id: string;
  month: number;
  year: number;
  totalAmount: number;
  dueDate: string;
  status: 'PENDING' | 'PAID' | 'OVERDUE' | 'CANCELLED';
  notes?: string;
  createdAt: string;
  coursePeriod: {
    id: string;
    name: string;
    monthlyPrice: number;
    course: {
      id: string;
      name: string;
    };
  };
  statistics: {
    enrolledStudents: number;
    contributingStudents: number;
    totalContributions: number;
    collectionRate: number;
  };
}

interface InvoicesResponse {
  invoices: Invoice[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

const MONTHS = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
];

const STATUS_COLORS = {
  PENDING: 'bg-yellow-100 text-yellow-800',
  PAID: 'bg-green-100 text-green-800',
  OVERDUE: 'bg-red-100 text-red-800',
  CANCELLED: 'bg-gray-100 text-gray-800'
};

const STATUS_LABELS = {
  PENDING: 'Pendiente',
  PAID: 'Pagada',
  OVERDUE: 'Vencida',
  CANCELLED: 'Cancelada'
};

export default function InvoicesPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    pages: 0
  });
  
  // Filters
  const [filters, setFilters] = useState({
    month: '',
    year: '',
    status: '',
    courseId: ''
  });

  // Check if user is admin
  useEffect(() => {
    if (user && user.role !== 'ADMIN') {
      router.push('/dashboard');
      return;
    }
  }, [user, router]);

  // Fetch invoices
  const fetchInvoices = async (page = 1) => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: page.toString(),
        limit: pagination.limit.toString(),
        ...Object.fromEntries(
          Object.entries(filters).filter(([_, value]) => value !== '')
        )
      });

      const response = await fetch(`/api/invoices?${params}`);
      if (!response.ok) {
        throw new Error('Failed to fetch invoices');
      }

      const data: InvoicesResponse = await response.json();
      setInvoices(data.invoices);
      setPagination(data.pagination);
    } catch (error) {
      console.error('Error fetching invoices:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.role === 'ADMIN') {
      fetchInvoices();
    }
  }, [user, filters]);

  // Handle filter changes
  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  // Clear filters
  const clearFilters = () => {
    setFilters({
      month: '',
      year: '',
      status: '',
      courseId: ''
    });
  };

  // Export to CSV
  const handleExportCSV = async (detailed = false) => {
    try {
      const params = new URLSearchParams({
        includeStudentDetails: detailed.toString(),
        ...Object.fromEntries(
          Object.entries(filters).filter(([_, value]) => value !== '')
        )
      });

      const response = await fetch(`/api/invoices/export/csv?${params}`);
      if (!response.ok) {
        throw new Error('Failed to export CSV');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = response.headers.get('Content-Disposition')?.split('filename=')[1]?.replace(/"/g, '') || 'facturas.csv';
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Error exporting CSV:', error);
    }
  };

  // Navigate to invoice detail
  const viewInvoice = (invoiceId: string) => {
    router.push(`/dashboard/invoices/${invoiceId}`);
  };

  // Calculate summary statistics
  const summaryStats = invoices.reduce(
    (acc, invoice) => ({
      totalAmount: acc.totalAmount + Number(invoice.totalAmount),
      totalStudents: acc.totalStudents + invoice.statistics.enrolledStudents,
      totalContributions: acc.totalContributions + invoice.statistics.totalContributions,
      totalInvoices: acc.totalInvoices + 1
    }),
    { totalAmount: 0, totalStudents: 0, totalContributions: 0, totalInvoices: 0 }
  );

  if (user?.role !== 'ADMIN') {
    return null; // Will redirect in useEffect
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Gestión de Facturas</h1>
          <p className="text-gray-600">Sistema de facturación mensual por curso</p>
        </div>
        <div className="flex gap-2">
          <Button 
            onClick={() => router.push('/dashboard/invoices/generate')}
            className="flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Generar Facturas
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Facturas</p>
                <p className="text-2xl font-bold">{summaryStats.totalInvoices}</p>
              </div>
              <FileText className="w-8 h-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Monto Total</p>
                <p className="text-2xl font-bold">${summaryStats.totalAmount.toLocaleString()}</p>
              </div>
              <DollarSign className="w-8 h-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Estudiantes</p>
                <p className="text-2xl font-bold">{summaryStats.totalStudents}</p>
              </div>
              <Users className="w-8 h-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Recaudado</p>
                <p className="text-2xl font-bold">${summaryStats.totalContributions.toLocaleString()}</p>
              </div>
              <TrendingUp className="w-8 h-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="w-5 h-5" />
            Filtros
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Mes</label>
              <select
                value={filters.month}
                onChange={(e) => handleFilterChange('month', e.target.value)}
                className="w-full p-2 border rounded-md"
              >
                <option value="">Todos los meses</option>
                {MONTHS.map((month, index) => (
                  <option key={index + 1} value={index + 1}>
                    {month}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Año</label>
              <select
                value={filters.year}
                onChange={(e) => handleFilterChange('year', e.target.value)}
                className="w-full p-2 border rounded-md"
              >
                <option value="">Todos los años</option>
                {[2024, 2025, 2026].map(year => (
                  <option key={year} value={year}>
                    {year}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Estado</label>
              <select
                value={filters.status}
                onChange={(e) => handleFilterChange('status', e.target.value)}
                className="w-full p-2 border rounded-md"
              >
                <option value="">Todos los estados</option>
                <option value="PENDING">Pendiente</option>
                <option value="PAID">Pagada</option>
                <option value="OVERDUE">Vencida</option>
                <option value="CANCELLED">Cancelada</option>
              </select>
            </div>

            <div className="flex items-end">
              <Button 
                onClick={clearFilters}
                variant="outline"
                className="w-full"
              >
                Limpiar Filtros
              </Button>
            </div>

            <div className="flex items-end gap-2">
              <Button 
                onClick={() => handleExportCSV(false)}
                variant="outline"
                size="sm"
                className="flex items-center gap-1"
              >
                <Download className="w-4 h-4" />
                CSV Resumen
              </Button>
              <Button 
                onClick={() => handleExportCSV(true)}
                variant="outline"
                size="sm"
                className="flex items-center gap-1"
              >
                <Download className="w-4 h-4" />
                CSV Detallado
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Invoices List */}
      <Card>
        <CardHeader>
          <CardTitle>Facturas</CardTitle>
          <CardDescription>
            Lista de facturas generadas ({pagination.total} total)
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-2 text-gray-600">Cargando facturas...</p>
            </div>
          ) : invoices.length === 0 ? (
            <div className="text-center py-8">
              <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">No se encontraron facturas</p>
            </div>
          ) : (
            <div className="space-y-4">
              {invoices.map((invoice) => (
                <div
                  key={invoice.id}
                  className="border rounded-lg p-4 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-semibold text-lg">
                          {invoice.coursePeriod.course.name}
                        </h3>
                        <Badge className={STATUS_COLORS[invoice.status]}>
                          {STATUS_LABELS[invoice.status]}
                        </Badge>
                      </div>
                      
                      <p className="text-gray-600 mb-2">
                        {invoice.coursePeriod.name} - {MONTHS[invoice.month - 1]} {invoice.year}
                      </p>
                      
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <span className="text-gray-500">Monto:</span>
                          <span className="font-medium ml-1">
                            ${Number(invoice.totalAmount).toLocaleString()}
                          </span>
                        </div>
                        <div>
                          <span className="text-gray-500">Estudiantes:</span>
                          <span className="font-medium ml-1">
                            {invoice.statistics.enrolledStudents}
                          </span>
                        </div>
                        <div>
                          <span className="text-gray-500">Recaudación:</span>
                          <span className="font-medium ml-1">
                            {Math.round(invoice.statistics.collectionRate)}%
                          </span>
                        </div>
                        <div>
                          <span className="text-gray-500">Vencimiento:</span>
                          <span className="font-medium ml-1">
                            {new Date(invoice.dueDate).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex gap-2 ml-4">
                      <Button
                        onClick={() => viewInvoice(invoice.id)}
                        size="sm"
                        variant="outline"
                        className="flex items-center gap-1"
                      >
                        <Eye className="w-4 h-4" />
                        Ver
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Pagination */}
          {pagination.pages > 1 && (
            <div className="flex justify-center items-center gap-2 mt-6">
              <Button
                onClick={() => fetchInvoices(pagination.page - 1)}
                disabled={pagination.page === 1}
                variant="outline"
                size="sm"
              >
                Anterior
              </Button>
              
              <span className="text-sm text-gray-600">
                Página {pagination.page} de {pagination.pages}
              </span>
              
              <Button
                onClick={() => fetchInvoices(pagination.page + 1)}
                disabled={pagination.page === pagination.pages}
                variant="outline"
                size="sm"
              >
                Siguiente
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
