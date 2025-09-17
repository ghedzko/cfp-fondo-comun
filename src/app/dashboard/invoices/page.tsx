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
  PENDING: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/40 dark:text-yellow-200',
  PAID: 'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-200',
  OVERDUE: 'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-200',
  CANCELLED: 'bg-muted text-muted-foreground dark:bg-muted/60'
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
      <div className="facturas-page__list">
        <div className="facturas-page__list-header">
          <h3>Facturas</h3>
          <p className="description">
            Lista de facturas generadas ({pagination.total} total)
          </p>
        </div>
        <div className="facturas-page__list-content">
          {loading ? (
            <div className="facturas-page__loading">
              <div className="facturas-page__loading-spinner"></div>
              <p className="facturas-page__loading-text">Cargando facturas...</p>
            </div>
          ) : invoices.length === 0 ? (
            <div className="facturas-page__empty">
              <FileText className="facturas-page__empty-icon" />
              <p className="facturas-page__empty-text">No se encontraron facturas</p>
            </div>
          ) : (
            <div>
              {invoices.map((invoice) => (
                <div
                  key={invoice.id}
                  className="facturas-page__invoice-item"
                >
                  <div className="facturas-page__invoice-item-header">
                    <div>
                      <div className="facturas-page__invoice-item-title">
                        <h3>{invoice.coursePeriod.course.name}</h3>
                        <span className={`badge badge--${invoice.status.toLowerCase()}`}>
                          {STATUS_LABELS[invoice.status]}
                        </span>
                      </div>
                      
                      <p className="facturas-page__invoice-item-subtitle">
                        {invoice.coursePeriod.name} - {MONTHS[invoice.month - 1]} {invoice.year}
                      </p>
                    </div>
                    
                    <div className="facturas-page__invoice-item-actions">
                      <button
                        onClick={() => viewInvoice(invoice.id)}
                        className="btn btn--outline btn--sm"
                      >
                        <Eye />
                        Ver
                      </button>
                    </div>
                  </div>
                  
                  <div className="facturas-page__invoice-item-stats">
                    <div className="facturas-page__invoice-item-stat">
                      <p className="facturas-page__invoice-item-stat-label">Monto:</p>
                      <p className="facturas-page__invoice-item-stat-value">
                        ${Number(invoice.totalAmount).toLocaleString()}
                      </p>
                    </div>
                    <div className="facturas-page__invoice-item-stat">
                      <p className="facturas-page__invoice-item-stat-label">Estudiantes:</p>
                      <p className="facturas-page__invoice-item-stat-value">
                        {invoice.statistics.enrolledStudents}
                      </p>
                    </div>
                    <div className="facturas-page__invoice-item-stat">
                      <p className="facturas-page__invoice-item-stat-label">Recaudación:</p>
                      <p className="facturas-page__invoice-item-stat-value">
                        {Math.round(invoice.statistics.collectionRate)}%
                      </p>
                    </div>
                    <div className="facturas-page__invoice-item-stat">
                      <p className="facturas-page__invoice-item-stat-label">Vencimiento:</p>
                      <p className="facturas-page__invoice-item-stat-value">
                        {new Date(invoice.dueDate).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Pagination */}
          {pagination.pages > 1 && (
            <div className="facturas-page__pagination">
              <button
                onClick={() => fetchInvoices(pagination.page - 1)}
                disabled={pagination.page === 1}
                className="btn btn--outline btn--sm"
              >
                Anterior
              </button>
              
              <span className="facturas-page__pagination-info">
                Página {pagination.page} de {pagination.pages}
              </span>
              
              <button
                onClick={() => fetchInvoices(pagination.page + 1)}
                disabled={pagination.page === pagination.pages}
                className="btn btn--outline btn--sm"
              >
                Siguiente
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
