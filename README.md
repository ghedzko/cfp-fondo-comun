# CFP Fondo Común - Sistema de Gestión Escolar

Sistema web para la gestión de aportes voluntarios del fondo común del **Centro de Formación Profesional (CFP) Lagopuelo**.

## 🎯 Estado del Proyecto

**FASE 0 COMPLETADA** ✅ (14/09/2025)

### ✅ Tecnologías Implementadas
- **Frontend**: Next.js 15.5.3 + TypeScript + App Router
- **Styling**: Tailwind CSS 4.0 + shadcn/ui components
- **State Management**: TanStack Query + Axios
- **Database**: Prisma ORM + PostgreSQL (Railway)
- **UI/UX**: Dark/Light theme toggle (next-themes)
- **Development**: ESLint + Prettier + Husky

### ✅ Funcionalidades Base
- 🏠 Página principal moderna con theme toggle
- 🔍 Health check API (`/api/health`)
- 🗄️ Base de datos PostgreSQL conectada
- 🎨 Sistema de temas dark/light funcional
- 📱 Diseño responsive con Tailwind CSS

## 🚀 Instalación y Desarrollo

### Prerrequisitos
- Node.js 18+
- npm o yarn
- PostgreSQL (local o Railway)

### Setup Local

1. **Clonar el repositorio**
```bash
git clone https://github.com/ghedzko/cfp-fondo-comun.git
cd cfp-fondo-comun
```

2. **Instalar dependencias**
```bash
npm install
```

3. **Configurar variables de entorno**
```bash
cp env.example .env
# Editar .env con tus credenciales
```

4. **Configurar base de datos**
```bash
# Generar Prisma Client
npx prisma generate

# Sincronizar schema (desarrollo)
npx prisma db push
```

5. **Ejecutar en desarrollo**
```bash
npm run dev
```

Abrir [http://localhost:3000](http://localhost:3000) en tu navegador.

## 🗄️ Base de Datos

### Railway PostgreSQL (Producción)
- Base de datos hosteada en Railway
- Conexión automática via `DATABASE_URL`
- Migraciones con `prisma db push`

### PostgreSQL Local (Desarrollo - Opcional)
```bash
# Docker Compose incluido
docker-compose up -d
```

## 🔐 Seguridad

⚠️ **IMPORTANTE**: 
- Nunca commitear credenciales en `env.example`
- Usar solo variables de ejemplo en archivos públicos
- Las credenciales reales van únicamente en `.env` (gitignored)

## 📋 Roadmap

### 🔄 FASE 1 - Autenticación & Usuarios (Próximo)
- [ ] JWT authentication con RBAC
- [ ] Modelos User + RefreshToken
- [ ] API routes de autenticación
- [ ] Página de login
- [ ] Roles: ADMIN (secretaría) y PRECEPTOR

### 📊 FASE 2 - Modelado de Dominio
- [ ] Modelo Estudiante (DNI como ID)
- [ ] Modelo Curso y CursoPeriodo
- [ ] Modelo Matricula y Aporte
- [ ] Modelo FacturaCurso

### 👥 FASE 3 - Gestión de Estudiantes
- [ ] CRUD de estudiantes
- [ ] Sistema de matrículas
- [ ] Gestión global por DNI

### 📅 FASE 4 - Cursos y Períodos
- [ ] Creación de cursos
- [ ] Selección de meses habilitados
- [ ] Gestión de períodos

### 💰 FASE 5 - Aportes Mensuales
- [ ] Carga de aportes voluntarios
- [ ] Operaciones masivas
- [ ] Validaciones de negocio

### 📄 FASE 6 - Facturación
- [ ] Generación de PDFs mensuales
- [ ] Exportación CSV
- [ ] Sistema de reportes

### 🔒 FASE 7-9 - Finalización
- [ ] Reportes y accesibilidad
- [ ] Seguridad OWASP
- [ ] Deploy y CI/CD

## 🛠️ Scripts Disponibles

```bash
npm run dev          # Desarrollo
npm run build        # Build producción
npm run start        # Servidor producción
npm run lint         # ESLint
npm run lint:fix     # Fix automático
```

## 🏗️ Arquitectura

```
src/
├── app/                 # App Router (Next.js 15)
│   ├── api/            # API Routes
│   ├── globals.css     # Estilos globales
│   ├── layout.tsx      # Layout principal
│   └── page.tsx        # Página home
├── components/         # Componentes React
│   └── ui/            # shadcn/ui components
├── lib/               # Utilidades
│   ├── axios.ts       # Cliente HTTP
│   ├── db.ts          # Prisma client
│   └── utils.ts       # Helpers
└── providers/         # Context providers
    ├── query-provider.tsx
    └── theme-provider.tsx
```

## 📝 Documentación Adicional

- [PLAN_GENERAL.md](./PLAN_GENERAL.md) - Plan completo del proyecto
- [README_FASE_0.md](./README_FASE_0.md) - Detalles de la Fase 0

## 🤝 Contribución

1. Fork del proyecto
2. Crear feature branch (`git checkout -b feature/nueva-funcionalidad`)
3. Commit cambios (`git commit -m 'feat: nueva funcionalidad'`)
4. Push branch (`git push origin feature/nueva-funcionalidad`)
5. Crear Pull Request

## 📄 Licencia

Este proyecto es privado y está destinado exclusivamente para el CFP Lagopuelo.
