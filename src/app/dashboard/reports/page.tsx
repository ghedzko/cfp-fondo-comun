'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/providers/auth-provider';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  BarChart3, 
  TrendingUp, 
  DollarSign, 
  Users, 
  FileText,
  Download,
  Calendar,
  BookOpen,
  Activity,
  ArrowUp,
  ArrowDown
} from 'lucide-react';
import Link from 'next/link';
import { formatCurrency, formatNumber, formatDate } from '@/lib/format';

interface Stats {
  overview: {
    totalStudents: number;
    totalCourses: number;
    totalEnrollments: number;
    totalContributions: number;
    totalAmount: number;
    totalInvoices: number;
    activeCoursePeriods: number;
    contributionRate: number;
  };
  trends: {
    monthly: Array<{
      month: number;
      year: number;
      amount: number;
      count: number;
      label: string;
    }>;
  };
  topCourses: Array<{
    coursePeriodId: number;
    courseName: string;
    periodName: string;
    totalAmount: number;
    contributionCount: number;
  }>;
  recentActivity: Array<{
    id: number;
    studentName: string;
    courseName: string;
    amount: number;
    month: number;
    year: number;
    paymentDate: string;
  }>;
}

export default function ReportsPage() {
  const { user } = useAuth();
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/reports/stats');
      if (!response.ok) {
        throw new Error('Failed to fetch statistics');
      }
      const data = await response.json();
      setStats(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error loading statistics');
    } finally {
      setLoading(false);
    }
  };


  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Cargando reportes...</h1>
          <p className="text-gray-600 dark:text-gray-300">Obteniendo estadísticas del sistema...</p>
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
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Error al cargar reportes</h2>
            <p className="text-gray-600 dark:text-gray-300 mb-4">{error}</p>
            <Button onClick={fetchStats}>Reintentar</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!stats) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Header */}
      <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-700 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link href="/dashboard">
                <Button variant="outline" size="sm">
                  ← Volver al Dashboard
                </Button>
              </Link>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  Reportes y Análisis
                </h1>
                <p className="text-gray-600 dark:text-gray-300">
                  Estadísticas y tendencias del sistema de aportes voluntarios
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Button variant="outline" size="sm">
                <Download className="w-4 h-4 mr-2" />
                Exportar PDF
              </Button>
              <Button variant="outline" size="sm">
                <FileText className="w-4 h-4 mr-2" />
                Exportar CSV
              </Button>
            </div>
          </div>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8" role="main">
        {/* Overview Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="border-0 shadow-lg bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-green-600 dark:text-green-400">Total Estudiantes</p>
                  <p className="text-3xl font-bold text-green-700 dark:text-green-300">{formatNumber(stats.overview.totalStudents)}</p>
                </div>
                <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-500 rounded-lg flex items-center justify-center">
                  <Users className="w-6 h-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-blue-600 dark:text-blue-400">Total Recaudado</p>
                  <p className="text-3xl font-bold text-blue-700 dark:text-blue-300">
                    {formatCurrency(stats.overview.totalAmount)}
                  </p>
                </div>
                <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center">
                  <DollarSign className="w-6 h-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-purple-600 dark:text-purple-400">Tasa de Aportes</p>
                  <p className="text-3xl font-bold text-purple-700 dark:text-purple-300">
                    {stats.overview.contributionRate}%
                  </p>
                </div>
                <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-gradient-to-br from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-orange-600 dark:text-orange-400">Cursos Activos</p>
                  <p className="text-3xl font-bold text-orange-700 dark:text-orange-300">
                    {formatNumber(stats.overview.activeCoursePeriods)}
                  </p>
                </div>
                <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-red-500 rounded-lg flex items-center justify-center">
                  <BookOpen className="w-6 h-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Charts and Analysis */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Monthly Trends */}
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <BarChart3 className="w-5 h-5" />
                <span>Tendencias Mensuales</span>
              </CardTitle>
              <CardDescription>
                Evolución de aportes en los últimos 6 meses
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {(() => {
                  // Fix: Use the sliced array for correct trend comparison
                  const monthlyTrends = stats.trends.monthly.slice(-6);
                  return monthlyTrends.map((trend, index) => (
                    <div key={`${trend.year}-${trend.month}`} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                          <Calendar className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">{trend.label}</p>
                          <p className="text-sm text-gray-500">{trend.count} aportes</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-gray-900 dark:text-white">{formatCurrency(trend.amount)}</p>
                        <div className="flex items-center text-sm">
                          {index > 0 && monthlyTrends[index - 1] && (
                            trend.amount > monthlyTrends[index - 1].amount ? (
                              <ArrowUp className="w-3 h-3 text-green-500 mr-1" />
                            ) : trend.amount < monthlyTrends[index - 1].amount ? (
                              <ArrowDown className="w-3 h-3 text-red-500 mr-1" />
                            ) : (
                              <span className="w-3 h-3 text-gray-400 mr-1">−</span>
                            )
                          )}
                        </div>
                      </div>
                    </div>
                  ));
                })()}
              </div>
            </CardContent>
          </Card>

          {/* Top Courses */}
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <BookOpen className="w-5 h-5" />
                <span>Cursos con Más Aportes</span>
              </CardTitle>
              <CardDescription>
                Ranking de cursos por total recaudado
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {stats.topCourses.slice(0, 5).map((course, index) => (
                  <div key={course.coursePeriodId} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
                        {index + 1}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">{course.courseName}</p>
                        <p className="text-sm text-gray-500">{course.periodName}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-gray-900 dark:text-white">{formatCurrency(course.totalAmount)}</p>
                      <p className="text-sm text-gray-500">{course.contributionCount} aportes</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Activity */}
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Activity className="w-5 h-5" />
              <span>Actividad Reciente</span>
            </CardTitle>
            <CardDescription>
              Últimos aportes registrados en el sistema
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {stats.recentActivity.map((activity) => (
                <div key={activity.id} className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                  <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center">
                      <DollarSign className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">{activity.studentName}</p>
                      <p className="text-sm text-gray-500">{activity.courseName}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-gray-900 dark:text-white">{formatCurrency(activity.amount)}</p>
                    <p className="text-sm text-gray-500">
                      {activity.month}/{activity.year} - {formatDate(activity.paymentDate)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <div className="mt-8 flex justify-center space-x-4">
          <Link href="/dashboard/reports/monthly">
            <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white">
              <Calendar className="w-4 h-4 mr-2" />
              Ver Reportes Mensuales
            </Button>
          </Link>
          <Button variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Exportar Datos Completos
          </Button>
        </div>
      </main>
    </div>
  );
}
