import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ThemeToggle } from "@/components/theme-toggle";

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-foreground">
            CFP Fondo Común - Lagopuelo
          </h1>
          <ThemeToggle />
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <Card>
            <CardHeader>
              <CardTitle>Sistema de Gestión de Aportes Voluntarios</CardTitle>
              <CardDescription>
                Bienvenido al sistema CFP Fondo Común. Esta plataforma permite gestionar 
                estudiantes, cursos y aportes voluntarios de manera eficiente.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Estudiantes</CardTitle>
                    <CardDescription>
                      Gestión global de estudiantes por DNI
                    </CardDescription>
                  </CardHeader>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Cursos</CardTitle>
                    <CardDescription>
                      Administración de cursos y períodos habilitados
                    </CardDescription>
                  </CardHeader>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Aportes Voluntarios</CardTitle>
                    <CardDescription>
                      Registro y seguimiento de contribuciones mensuales
                    </CardDescription>
                  </CardHeader>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Matrículas</CardTitle>
                    <CardDescription>
                      Inscripción de estudiantes a cursos
                    </CardDescription>
                  </CardHeader>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Facturación</CardTitle>
                    <CardDescription>
                      Emisión de comprobantes mensuales por curso
                    </CardDescription>
                  </CardHeader>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Reportes</CardTitle>
                    <CardDescription>
                      Análisis y exportación de datos
                    </CardDescription>
                  </CardHeader>
                </Card>
              </div>

              <div className="mt-8 p-4 bg-muted rounded-lg">
                <p className="text-sm text-muted-foreground">
                  <strong>Nota importante:</strong> Este sistema gestiona <em>aportes voluntarios</em>. 
                  Todas las contribuciones son opcionales y no obligatorias.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
