import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";
import { DatabaseStatus } from "@/components/database-status";
import Link from "next/link";
import {
  Users,
  BookOpen,
  DollarSign,
  FileText,
  UserCheck,
  BarChart3,
  GraduationCap,
  ArrowRight,
  Sparkles
} from 'lucide-react';

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-gray-100 dark:from-gray-900 dark:to-slate-900">
      {/* Header */}
      <header className="sticky top-0 z-50 backdrop-blur-md bg-white/80 dark:bg-gray-900/80 border-b border-gray-200 dark:border-gray-800">
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8" role="navigation" aria-label="Navegación principal">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                <GraduationCap className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                CFP Fondo Común - Lago Puelo
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              <ThemeToggle />
              <Link href="/login">
                <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white border-0">
                  <ArrowRight className="w-4 h-4 mr-2" />
                  Iniciar Sesión
                </Button>
              </Link>
            </div>
          </div>
        </nav>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12" role="main">
        {/* Hero Section */}
        <section aria-labelledby="intro-heading" className="text-center mb-16">
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 to-purple-600/20 rounded-3xl blur-3xl"></div>
            <Card className="relative border-0 shadow-2xl bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900">
              <CardContent className="p-12">
                <div className="flex items-center justify-center mb-6">
                  <div className="w-20 h-20 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center">
                    <Sparkles className="w-10 h-10 text-white" />
                  </div>
                </div>
                <h1 id="intro-heading" className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  Sistema de Gestión de Aportes Voluntarios
                </h1>
                <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto leading-relaxed">
                  Bienvenido al sistema CFP Fondo Común. Esta plataforma permite gestionar 
                  estudiantes, cursos y aportes voluntarios de manera eficiente y transparente.
                </p>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Features Grid */}
        <section aria-labelledby="features-heading" className="mb-16">
          <h2 id="features-heading" className="text-3xl font-bold text-center mb-12 text-gray-900 dark:text-white">
            Funcionalidades del Sistema
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Estudiantes */}
            <Card className="group hover:shadow-xl transition-all duration-300 hover:-translate-y-2 border-0 shadow-lg bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20">
              <CardContent className="p-8">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-500 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Users className="w-6 h-6 text-white" />
                  </div>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Estudiantes</h3>
                <p className="text-gray-600 dark:text-gray-300 mb-4">Gestión global de estudiantes por DNI</p>
              </CardContent>
            </Card>

            {/* Cursos */}
            <Card className="group hover:shadow-xl transition-all duration-300 hover:-translate-y-2 border-0 shadow-lg bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20">
              <CardContent className="p-8">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                    <BookOpen className="w-6 h-6 text-white" />
                  </div>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Cursos</h3>
                <p className="text-gray-600 dark:text-gray-300 mb-4">Administración de cursos y períodos habilitados</p>
              </CardContent>
            </Card>

            {/* Aportes Voluntarios */}
            <Card className="group hover:shadow-xl transition-all duration-300 hover:-translate-y-2 border-0 shadow-lg bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20">
              <CardContent className="p-8">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                    <DollarSign className="w-6 h-6 text-white" />
                  </div>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Aportes Voluntarios</h3>
                <p className="text-gray-600 dark:text-gray-300 mb-4">Registro y seguimiento de contribuciones mensuales</p>
              </CardContent>
            </Card>

            {/* Matrículas */}
            <Card className="group hover:shadow-xl transition-all duration-300 hover:-translate-y-2 border-0 shadow-lg bg-gradient-to-br from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20">
              <CardContent className="p-8">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-red-500 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                    <UserCheck className="w-6 h-6 text-white" />
                  </div>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Matrículas</h3>
                <p className="text-gray-600 dark:text-gray-300 mb-4">Inscripción de estudiantes a cursos</p>
              </CardContent>
            </Card>

            {/* Facturación */}
            <Card className="group hover:shadow-xl transition-all duration-300 hover:-translate-y-2 border-0 shadow-lg bg-gradient-to-br from-indigo-50 to-blue-50 dark:from-indigo-900/20 dark:to-blue-900/20">
              <CardContent className="p-8">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-gradient-to-r from-indigo-500 to-blue-500 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                    <FileText className="w-6 h-6 text-white" />
                  </div>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Facturación</h3>
                <p className="text-gray-600 dark:text-gray-300 mb-4">Emisión de comprobantes mensuales por curso</p>
              </CardContent>
            </Card>

            {/* Reportes */}
            <Card className="group hover:shadow-xl transition-all duration-300 hover:-translate-y-2 border-0 shadow-lg bg-gradient-to-br from-teal-50 to-cyan-50 dark:from-teal-900/20 dark:to-cyan-900/20">
              <CardContent className="p-8">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-gradient-to-r from-teal-500 to-cyan-500 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                    <BarChart3 className="w-6 h-6 text-white" />
                  </div>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Reportes</h3>
                <p className="text-gray-600 dark:text-gray-300 mb-4">Análisis y exportación de datos</p>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Important Notice */}
        <div className="pt-16 pb-12">
          <section aria-labelledby="important-note">
            <Card className="border-0 shadow-lg bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 border-l-4 border-l-amber-400">
              <CardContent className="p-8">
                <div className="flex items-start space-x-4">
                  <div className="w-10 h-10 bg-gradient-to-r from-amber-500 to-orange-500 rounded-lg flex items-center justify-center flex-shrink-0">
                    <span className="text-white text-lg">💡</span>
                  </div>
                  <div>
                    <h3 id="important-note" className="text-lg font-semibold text-amber-800 dark:text-amber-200 mb-2">
                      Nota importante
                    </h3>
                    <p className="text-amber-700 dark:text-amber-300 leading-relaxed">
                      Este sistema gestiona <strong>aportes voluntarios</strong>. Todas las 
                      contribuciones son opcionales y no obligatorias. El sistema permite un 
                      seguimiento transparente y eficiente de las donaciones realizadas por los 
                      estudiantes y sus familias para el fondo común del CFP.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </section>
        </div>

        {/* Database Status Indicator */}
        <section aria-labelledby="system-status" className="text-center">
          <h2 id="system-status" className="text-2xl font-bold mb-8 text-gray-900 dark:text-white">
            Estado del Sistema
          </h2>
          <div className="flex justify-center">
            <DatabaseStatus />
          </div>
        </section>
      </main>
    </div>
  );
}
