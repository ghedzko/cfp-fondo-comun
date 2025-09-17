'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
// Removed UI component imports - using SCSS classes instead
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
    <div className="facturas-page">
      {/* Header */}
      <div className="facturas-page__header">
        <div className="facturas-page__title-group">
          <h1 className="facturas-page__title">Gestión de Facturas</h1>
          <p className="facturas-page__subtitle">Sistema de facturación mensual por curso</p>
        </div>
        <div className="facturas-page__actions">
          <button 
            onClick={() => router.push('/dashboard/invoices/generate')}
            className="btn btn--primary btn--md"
          >
            <Plus className="w-4 h-4" />
            Generar Facturas
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="facturas-page__summary">
        <div className="facturas-page__summary-card">
          <div className="facturas-page__summary-card-content">
            <div className="facturas-page__summary-card-info">
              <p className="facturas-page__summary-card-label">Total Facturas</p>
              <p className="facturas-page__summary-card-value">{summaryStats.totalInvoices}</p>
            </div>
            <div className="facturas-page__summary-card-icon facturas-page__summary-card-icon--blue">
              <FileText />
            </div>
          </div>
        </div>

        <div className="facturas-page__summary-card">
          <div className="facturas-page__summary-card-content">
            <div className="facturas-page__summary-card-info">
              <p className="facturas-page__summary-card-label">Monto Total</p>
              <p className="facturas-page__summary-card-value">${summaryStats.totalAmount.toLocaleString()}</p>
            </div>
            <div className="facturas-page__summary-card-icon facturas-page__summary-card-icon--green">
              <DollarSign />
            </div>
          </div>
        </div>

        <div className="facturas-page__summary-card">
          <div className="facturas-page__summary-card-content">
            <div className="facturas-page__summary-card-info">
              <p className="facturas-page__summary-card-label">Estudiantes</p>
              <p className="facturas-page__summary-card-value">{summaryStats.totalStudents}</p>
            </div>
            <div className="facturas-page__summary-card-icon facturas-page__summary-card-icon--purple">
              <Users />
            </div>
          </div>
        </div>

        <div className="facturas-page__summary-card">
          <div className="facturas-page__summary-card-content">
            <div className="facturas-page__summary-card-info">
              <p className="facturas-page__summary-card-label">Recaudado</p>
              <p className="facturas-page__summary-card-value">${summaryStats.totalContributions.toLocaleString()}</p>
            </div>
            <div className="facturas-page__summary-card-icon facturas-page__summary-card-icon--orange">
              <TrendingUp />
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="facturas-page__filters">
        <div className="facturas-page__filters-header">
          <h3>
            <Filter />
            Filtros
          </h3>
        </div>
        <div className="facturas-page__filters-content">
          <div className="facturas-page__filters-grid">
            <div className="facturas-page__filters-group">
              <label>Mes</label>
              <select
                value={filters.month}
                onChange={(e) => handleFilterChange('month', e.target.value)}
              >
                <option value="">Todos los meses</option>
                {MONTHS.map((month, index) => (
                  <option key={index + 1} value={index + 1}>
                    {month}
                  </option>
                ))}
              </select>
            </div>

            <div className="facturas-page__filters-group">
              <label>Año</label>
              <select
                value={filters.year}
                onChange={(e) => handleFilterChange('year', e.target.value)}
              >
                <option value="">Todos los años</option>
                {[2024, 2025, 2026].map(year => (
                  <option key={year} value={year}>
                    {year}
                  </option>
                ))}
              </select>
            </div>

            <div className="facturas-page__filters-group">
              <label>Estado</label>
              <select
                value={filters.status}
                onChange={(e) => handleFilterChange('status', e.target.value)}
              >
                <option value="">Todos los estados</option>
                <option value="PENDING">Pendiente</option>
                <option value="PAID">Pagada</option>
                <option value="OVERDUE">Vencida</option>
                <option value="CANCELLED">Cancelada</option>
              </select>
            </div>

          </div>
          <div className="facturas-page__filters-actions">
            <button 
              onClick={clearFilters}
              className="btn btn--secondary btn--md"
            >
              Limpiar Filtros
            </button>
            <button 
              onClick={() => handleExportCSV(false)}
              className="btn btn--outline btn--sm"
            >
              <Download />
              CSV Resumen
            </button>
            <button 
              onClick={() => handleExportCSV(true)}
              className="btn btn--outline btn--sm"
            >
              <Download />
              CSV Detallado
            </button>
          </div>
        </div>
      </div>

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
