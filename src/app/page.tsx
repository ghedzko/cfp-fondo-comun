import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";
import Link from "next/link";

export default function Home() {
  return (
    <div className="home-page">
      <header className="home-header">
        <nav className="header-container" role="navigation" aria-label="Navegación principal">
          <h1 className="header-title">
            CFP Fondo Común - Lago Puelo
          </h1>
          <div className="header-actions">
            <ThemeToggle />
            <Link href="/login">
              <Button>Iniciar Sesión</Button>
            </Link>
          </div>
        </nav>
      </header>

      <main className="home-main" role="main">
        <div className="home-content">
          <section aria-labelledby="intro-heading">
            <Card>
              <CardHeader>
                <CardTitle id="intro-heading">Sistema de Gestión de Aportes Voluntarios</CardTitle>
                <CardDescription>
                  Bienvenido al sistema CFP Fondo Común. Esta plataforma permite gestionar 
                  estudiantes, cursos y aportes voluntarios de manera eficiente.
                </CardDescription>
              </CardHeader>
            </Card>
          </section>

          <section aria-labelledby="features-heading">
            <h2 id="features-heading" className="sr-only">Funcionalidades del sistema</h2>
            <div className="features-grid">
              <Card>
                <CardHeader>
                  <CardTitle>Estudiantes</CardTitle>
                  <CardDescription>
                    Gestión global de estudiantes por DNI
                  </CardDescription>
                </CardHeader>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Cursos</CardTitle>
                  <CardDescription>
                    Administración de cursos y períodos habilitados
                  </CardDescription>
                </CardHeader>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Aportes Voluntarios</CardTitle>
                  <CardDescription>
                    Registro y seguimiento de contribuciones mensuales
                  </CardDescription>
                </CardHeader>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Matrículas</CardTitle>
                  <CardDescription>
                    Inscripción de estudiantes a cursos
                  </CardDescription>
                </CardHeader>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Facturación</CardTitle>
                  <CardDescription>
                    Emisión de comprobantes mensuales por curso
                  </CardDescription>
                </CardHeader>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Reportes</CardTitle>
                  <CardDescription>
                    Análisis y exportación de datos
                  </CardDescription>
                </CardHeader>
              </Card>
            </div>
          </section>

          <section aria-labelledby="important-note">
            <Card className="info-card">
              <CardContent>
                <p>
                  <strong id="important-note">Nota importante:</strong> Este sistema gestiona{" "}
                  <span className="highlight">aportes voluntarios</span>. Todas las 
                  contribuciones son opcionales y no obligatorias.
                </p>
              </CardContent>
            </Card>
          </section>
        </div>
      </main>
    </div>
  );
}
