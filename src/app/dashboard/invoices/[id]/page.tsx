'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  ArrowLeft,
  Download,
  FileText,
  Users,
  DollarSign,
  Calendar,
  CheckCircle,
  XCircle,
  Clock,
  AlertCircle
} from 'lucide-react';
import { useAuth } from '@/providers/auth-provider';

interface Student {
  id: string;
  dni: string;
  firstName: string;
  lastName: string;
  email?: string;
  phone?: string;
  enrollmentId: string;
  enrollmentDate: string;
  contribution?: {
    amount: number;
    paymentDate: string;
    paymentMethod: string;
    receipt?: string;
  };
  hasContributed: boolean;
}

interface InvoiceDetail {
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
    startDate: string;
    endDate: string;
    monthlyPrice: number;
    course: {
      id: string;
      name: string;
      description?: string;
    };
  };
  statistics: {
    enrolledStudents: number;
    contributingStudents: number;
    totalContributions: number;
    collectionRate: number;
    expectedAmount: number;
    collectionDeficit: number;
  };
  studentsWithContributions: Student[];
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

const PAYMENT_METHOD_LABELS = {
  CASH: 'Efectivo',
  TRANSFER: 'Transferencia',
  CARD: 'Tarjeta',
  OTHER: 'Otro'
};

export default function InvoiceDetailPage() {
  const { user } = useAuth();
  const router = useRouter();
  const params = useParams();
  const invoiceId = params.id as string;
  
  const [invoice, setInvoice] = useState<InvoiceDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Check if user is admin
  useEffect(() => {
    if (user && user.role !== 'ADMIN') {
      router.push('/dashboard');
      return;
    }
  }, [user, router]);

  // Fetch invoice details
  useEffect(() => {
    const fetchInvoice = async () => {
      if (!invoiceId || user?.role !== 'ADMIN') return;

      try {
        setLoading(true);
        const response = await fetch(`/api/invoices/${invoiceId}`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch invoice details');
        }

        const data = await response.json();
        setInvoice(data.invoice);
      } catch (error) {
        console.error('Error fetching invoice:', error);
        setError('Error al cargar los detalles de la factura');
      } finally {
        setLoading(false);
      }
    };

    fetchInvoice();
  }, [invoiceId, user]);

  // Generate PDF
  const handleGeneratePDF = async () => {
    try {
      const response = await fetch(`/api/invoices/${invoiceId}/pdf`);
      if (!response.ok) {
        throw new Error('Failed to generate PDF');
      }

      const data = await response.json();
      // Here you would implement client-side PDF generation using jsPDF
      console.log('PDF data:', data);
      alert('Funcionalidad de PDF en desarrollo');
    } catch (error) {
      console.error('Error generating PDF:', error);
    }
  };

  // Update invoice status
  const handleStatusUpdate = async (newStatus: string) => {
    try {
      const response = await fetch(`/api/invoices/${invoiceId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!response.ok) {
        throw new Error('Failed to update invoice status');
      }

      const data = await response.json();
      setInvoice(prev => prev ? { ...prev, status: newStatus as any } : null);
    } catch (error) {
      console.error('Error updating invoice status:', error);
    }
  };

  if (user?.role !== 'ADMIN') {
    return null; // Will redirect in useEffect
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-96">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error || !invoice) {
    return (
      <div className="text-center py-8">
        <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
        <p className="text-red-600">{error || 'Factura no encontrada'}</p>
        <Button onClick={() => router.back()} className="mt-4">
          Volver
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
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
            <h1 className="text-3xl font-bold">Detalle de Factura</h1>
            <p className="text-gray-600">
              {invoice.coursePeriod.course.name} - {MONTHS[invoice.month - 1]} {invoice.year}
            </p>
          </div>
        </div>
        
        <div className="flex gap-2">
          <Button
            onClick={handleGeneratePDF}
            variant="outline"
            className="flex items-center gap-2"
          >
            <Download className="w-4 h-4" />
            Descargar PDF
          </Button>
        </div>
      </div>

      {/* Invoice Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="w-5 h-5" />
                    Información de la Factura
                  </CardTitle>
                  <CardDescription>
                    ID: {invoice.id}
                  </CardDescription>
                </div>
                <Badge className={STATUS_COLORS[invoice.status]}>
                  {STATUS_LABELS[invoice.status]}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-600">Curso</label>
                  <p className="font-semibold">{invoice.coursePeriod.course.name}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Período</label>
                  <p className="font-semibold">{invoice.coursePeriod.name}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Mes/Año</label>
                  <p className="font-semibold">{MONTHS[invoice.month - 1]} {invoice.year}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Fecha de Vencimiento</label>
                  <p className="font-semibold">{new Date(invoice.dueDate).toLocaleDateString()}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Monto Total</label>
                  <p className="font-semibold text-lg text-green-600">
                    ${Number(invoice.totalAmount).toLocaleString()}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Precio Mensual</label>
                  <p className="font-semibold">
                    ${Number(invoice.coursePeriod.monthlyPrice).toLocaleString()}
                  </p>
                </div>
              </div>
              
              {invoice.notes && (
                <div>
                  <label className="text-sm font-medium text-gray-600">Notas</label>
                  <p className="text-gray-800">{invoice.notes}</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Statistics */}
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5" />
                Estadísticas
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between">
                <span className="text-gray-600">Estudiantes Matriculados:</span>
                <span className="font-semibold">{invoice.statistics.enrolledStudents}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Estudiantes que Aportaron:</span>
                <span className="font-semibold">{invoice.statistics.contributingStudents}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Tasa de Recaudación:</span>
                <span className="font-semibold">
                  {Math.round(invoice.statistics.collectionRate)}%
                </span>
              </div>
              <hr />
              <div className="flex justify-between">
                <span className="text-gray-600">Monto Esperado:</span>
                <span className="font-semibold">
                  ${invoice.statistics.expectedAmount.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Monto Recaudado:</span>
                <span className="font-semibold text-green-600">
                  ${invoice.statistics.totalContributions.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Déficit:</span>
                <span className={`font-semibold ${
                  invoice.statistics.collectionDeficit > 0 ? 'text-red-600' : 'text-green-600'
                }`}>
                  ${invoice.statistics.collectionDeficit.toLocaleString()}
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Status Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Acciones</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {invoice.status === 'PENDING' && (
                <>
                  <Button
                    onClick={() => handleStatusUpdate('PAID')}
                    className="w-full flex items-center gap-2"
                    variant="default"
                  >
                    <CheckCircle className="w-4 h-4" />
                    Marcar como Pagada
                  </Button>
                  <Button
                    onClick={() => handleStatusUpdate('OVERDUE')}
                    className="w-full flex items-center gap-2"
                    variant="outline"
                  >
                    <Clock className="w-4 h-4" />
                    Marcar como Vencida
                  </Button>
                </>
              )}
              {invoice.status !== 'CANCELLED' && (
                <Button
                  onClick={() => handleStatusUpdate('CANCELLED')}
                  className="w-full flex items-center gap-2"
                  variant="destructive"
                >
                  <XCircle className="w-4 h-4" />
                  Cancelar Factura
                </Button>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Students List */}
      <Card>
        <CardHeader>
          <CardTitle>Detalle de Estudiantes</CardTitle>
          <CardDescription>
            Lista de estudiantes matriculados y sus aportes
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-2">DNI</th>
                  <th className="text-left p-2">Estudiante</th>
                  <th className="text-left p-2">Email</th>
                  <th className="text-left p-2">Estado</th>
                  <th className="text-right p-2">Aporte</th>
                  <th className="text-left p-2">Fecha Pago</th>
                  <th className="text-left p-2">Método</th>
                </tr>
              </thead>
              <tbody>
                {invoice.studentsWithContributions.map((student) => (
                  <tr key={student.id} className="border-b hover:bg-gray-50">
                    <td className="p-2 font-mono text-sm">{student.dni}</td>
                    <td className="p-2">
                      <div>
                        <p className="font-medium">{student.firstName} {student.lastName}</p>
                      </div>
                    </td>
                    <td className="p-2 text-sm text-gray-600">{student.email || '-'}</td>
                    <td className="p-2">
                      {student.hasContributed ? (
                        <Badge className="bg-green-100 text-green-800">
                          <CheckCircle className="w-3 h-3 mr-1" />
                          Aportó
                        </Badge>
                      ) : (
                        <Badge className="bg-red-100 text-red-800">
                          <XCircle className="w-3 h-3 mr-1" />
                          Sin aporte
                        </Badge>
                      )}
                    </td>
                    <td className="p-2 text-right font-medium">
                      {student.contribution 
                        ? `$${Number(student.contribution.amount).toLocaleString()}`
                        : '-'
                      }
                    </td>
                    <td className="p-2 text-sm">
                      {student.contribution 
                        ? new Date(student.contribution.paymentDate).toLocaleDateString()
                        : '-'
                      }
                    </td>
                    <td className="p-2 text-sm">
                      {student.contribution 
                        ? PAYMENT_METHOD_LABELS[student.contribution.paymentMethod as keyof typeof PAYMENT_METHOD_LABELS]
                        : '-'
                      }
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
