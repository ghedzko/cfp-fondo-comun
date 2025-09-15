import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";
import Link from "next/link";

export default function Home() {
  return (
    <div className="home-page">
      <header className="home-header">
        <div className="header-container">
          <h1 className="header-title">
            CFP Fondo Común - Lago Puelo
          </h1>
          <div className="header-actions">
            <ThemeToggle />
            <Link href="/login">
              <Button>Iniciar Sesión</Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="home-main">
        <div className="home-content">
          <Card>
            <CardHeader>
              <CardTitle>Sistema de Gestión de Aportes Voluntarios</CardTitle>
              <CardDescription>
                Bienvenido al sistema CFP Fondo Común. Esta plataforma permite gestionar 
                estudiantes, cursos y aportes voluntarios de manera eficiente.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="features-grid">
                <Card className="feature-card">
                  <CardHeader className="feature-header">
                    <CardTitle className="feature-title">Estudiantes</CardTitle>
                    <CardDescription className="feature-description">
                      Gestión global de estudiantes por DNI
                    </CardDescription>
                  </CardHeader>
                </Card>

                <Card className="feature-card">
                  <CardHeader className="feature-header">
                    <CardTitle className="feature-title">Cursos</CardTitle>
                    <CardDescription className="feature-description">
                      Administración de cursos y períodos habilitados
                    </CardDescription>
                  </CardHeader>
                </Card>

                <Card className="feature-card">
                  <CardHeader className="feature-header">
                    <CardTitle className="feature-title">Aportes Voluntarios</CardTitle>
                    <CardDescription className="feature-description">
                      Registro y seguimiento de contribuciones mensuales
                    </CardDescription>
                  </CardHeader>
                </Card>

                <Card className="feature-card">
                  <CardHeader className="feature-header">
                    <CardTitle className="feature-title">Matrículas</CardTitle>
                    <CardDescription className="feature-description">
                      Inscripción de estudiantes a cursos
                    </CardDescription>
                  </CardHeader>
                </Card>

                <Card className="feature-card">
                  <CardHeader className="feature-header">
                    <CardTitle className="feature-title">Facturación</CardTitle>
                    <CardDescription className="feature-description">
                      Emisión de comprobantes mensuales por curso
                    </CardDescription>
                  </CardHeader>
                </Card>

                <Card className="feature-card">
                  <CardHeader className="feature-header">
                    <CardTitle className="feature-title">Reportes</CardTitle>
                    <CardDescription className="feature-description">
                      Análisis y exportación de datos
                    </CardDescription>
                  </CardHeader>
                </Card>
              </div>

              <div className="info-banner">
                <p className="info-text">
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
