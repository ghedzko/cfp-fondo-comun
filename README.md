# CFP Fondo Común - Sistema de Gestión Escolar

Sistema web para la gestión de aportes voluntarios del fondo común del **Centro de Formación Profesional (CFP) Lago Puelo**.

## 🎯 Estado del Proyecto

**FASE 1 COMPLETADA** ✅ (15/09/2025)
**ACCESIBILIDAD IMPLEMENTADA** ✅ (15/09/2025)

### ✅ Tecnologías Implementadas
- **Frontend**: Next.js 15.5.3 + TypeScript + App Router
- **Styling**: SASS/SCSS + shadcn/ui components (migrado desde Tailwind)
- **State Management**: TanStack Query + Axios
- **Database**: Prisma ORM + PostgreSQL (Railway)
- **Authentication**: JWT + HTTP-only cookies + RBAC
- **Theme**: next-themes (light/dark mode)
- **Development**: ESLint + Prettier + Husky

### 🎨 Migración de Estilos
- ✅ Migración completa de Tailwind CSS a SASS/SCSS
- ✅ Arquitectura SASS profesional (variables, mixins, componentes)
- ✅ Estilos personalizados para login, dashboard y componentes
- ✅ Sistema de temas light/dark completamente funcional

### ✅ Funcionalidades Implementadas
- 🏠 Página principal moderna con theme toggle y navegación
- 🔐 Sistema de autenticación completo (JWT + RBAC)
- 👤 Login/logout funcional con redirección automática
- 📊 Dashboard administrativo con información del usuario
- 🎨 Sistema de temas dark/light completamente funcional
- 📱 Diseño responsive con arquitectura SASS profesional
- 🔍 Health check API (`/api/health`)
- 🗄️ Base de datos PostgreSQL conectada y funcionando
- ♿ **Accesibilidad WCAG 2.1 completa** (landmarks, ARIA, headings)
- 🔧 **Eliminación completa de Tailwind CSS** - Solo SASS
- 👥 **RBAC mejorado**: Admin tiene acceso a funciones de preceptor

### 🔧 Resoluciones Técnicas
- ✅ Errores de hidratación de Next.js resueltos
- ✅ Configuración de cookies de autenticación corregida
- ✅ Middleware de protección de rutas funcionando
- ✅ Migración completa de Tailwind a SASS sin conflictos
- ✅ Build de producción funcionando sin errores
- ✅ Accesibilidad WCAG 2.1 implementada completamente
- ✅ RBAC actualizado: Admin accede a funciones de preceptor

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

## 👥 Control de Acceso (RBAC)

### Credenciales de Prueba
```
Administrador:
- Email: admin@cfp.edu.ar
- Password: admin123
- Acceso: TODAS las funciones (admin + preceptor)

Preceptor:
- Email: preceptor@cfp.edu.ar  
- Password: preceptor123
- Acceso: Solo funciones de secretaría
```

## 📋 Roadmap

### ✅ FASE 1 - Autenticación & Usuarios (COMPLETADA)
- [x] JWT authentication con RBAC
- [x] Modelos User + RefreshToken
- [x] API routes de autenticación
- [x] Página de login
- [x] Roles: ADMIN (secretaría) y PRECEPTOR
- [x] RBAC mejorado: Admin accede a funciones de preceptor

### ✅ FASE 2 - Modelado de Dominio (COMPLETADA)
- [x] Modelo Estudiante (DNI como ID)
- [x] Modelo Curso y CursoPeriodo
- [x] Modelo Matricula y Aporte
- [x] Modelo FacturaCurso
- [x] Prisma schema con relaciones y constraints
- [x] Datos de prueba seeded en la base de datos

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

Este proyecto es privado y está destinado exclusivamente para el CFP Lago Puelo.
