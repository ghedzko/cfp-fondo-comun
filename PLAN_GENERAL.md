# Plan General CFP Fondo Común - MVP Escalable

## 📋 Estado General del Proyecto

**Proyecto**: CFP Fondo Común – Lago Puelo (MVP escalable)  
**Tech Stack**: Next.js (App Router) + TypeScript + Prisma + PostgreSQL + TanStack Query + Axios + shadcn/ui + SASS/SCSS + next-themes  
**Fecha de inicio**: 14 de septiembre de 2025  
**Estado actual**: FASE 4 en progreso 🔄 (16/09/2025)

---

## 🎯 Fases del Proyecto

### ✅ FASE 0 — Bootstrap & Infra (COMPLETADA)
**Objetivo**: Repo inicial listo para iterar  
**Estado**: ✅ **COMPLETADO**  
**Fecha**: 14/09/2025

#### ✅ Tareas Completadas:
- [x] Next.js con App Router + TypeScript configurado
- [x] ESLint, Prettier configurados
- [x] SASS/SCSS + shadcn/ui (Button, Input, Table, Card) instalado (migrado desde Tailwind)
- [x] next-themes (dark/light) funcional
- [x] TanStack Query provider configurado
- [x] Axios instancia con baseURL:'/api' e interceptores
- [x] Variables de entorno configuradas (env.example)
- [x] Prisma instalado y cliente generado
- [x] docker-compose.yml con PostgreSQL local
- [x] Health check en /api/health implementado
- [x] Página principal con UI moderna y theme toggle

#### ✅ Criterios de Aceptación Cumplidos:
- [x] App corre (`npm run dev`)
- [x] Toggle dark/light funciona
- [x] `/api/health` responde 200
- [x] Lint + prettier configurados
- [x] PostgreSQL local disponible

---

### ✅ FASE 1 — Autenticación & Usuarios (RBAC + JWT)
**Objetivo**: Login seguro con RBAC y CRUD de usuarios por ADMIN  
**Estado**: ✅ **COMPLETADO**  
**Fecha**: 15/09/2025

#### ✅ Tareas Completadas:
- [x] Modelo Prisma: User + RefreshToken con UserRole enum
- [x] JWT utilities (lib/auth.ts) con bcrypt para passwords
- [x] API Routes: /api/auth/login, /api/auth/refresh, /api/auth/logout, /api/auth/me
- [x] Página /login con shadcn/ui y validación Zod
- [x] Auth guard en middleware.ts protegiendo /dashboard/**
- [x] AuthProvider context con hooks useAuth, isAdmin, isPreceptor
- [x] Middleware de autenticación con verificación JWT
- [x] Dashboard page con UI role-based
- [x] Test users creados (admin@cfp.edu.ar, preceptor@cfp.edu.ar)
- [x] Migración completa de Tailwind CSS a SASS/SCSS
- [x] Arquitectura SASS profesional con variables y mixins
- [x] Resolución de errores de hidratación de Next.js
- [x] Sistema de autenticación completamente funcional
- [x] Corrección de nombre: "Lagopuelo" → "Lago Puelo"
- [x] Accesibilidad WCAG 2.1 implementada completamente
- [x] RBAC mejorado: Admin accede a funciones de preceptor
- [x] Build de producción funcionando sin errores

#### ✅ Criterios de Aceptación Cumplidos:
- [x] RBAC implementado (ADMIN/PRECEPTOR roles)
- [x] Refresh token rotation funciona
- [x] bcrypt para password hashing (seguro)
- [x] Middleware protege rutas /dashboard/**
- [x] HTTP-only cookies para seguridad XSS
- [x] AuthProvider maneja estado de autenticación
- [x] Sistema de login/logout completo

---

### ✅ FASE 2 — Modelado de Dominio y Migraciones
**Objetivo**: Esquema de datos y seeds  
**Estado**: ✅ **COMPLETADO**  
**Fecha**: 15/09/2025

#### ✅ Tareas Completadas:
- [x] Modelos Prisma: Estudiante, Curso, CursoPeriodo, Matricula, Aporte, FacturaCurso
- [x] Constraints y validaciones (UNIQUE, índices)
- [x] Seeds: 2 usuarios, 2 cursos, 2 períodos, 3 estudiantes, 3 matrículas, 3 aportes, 3 facturas
- [x] Enums: EstadoMatricula, MetodoPago, EstadoFactura
- [x] Relaciones completas entre entidades
- [x] Migración aplicada exitosamente
- [x] Script de seed con datos de prueba completos

#### ✅ Criterios de Aceptación Cumplidos:
- [x] `prisma migrate dev` crea todas las tablas
- [x] Seeds funcionan correctamente
- [x] Constraints UNIQUE respetados
- [x] Relaciones FK implementadas
- [x] Datos de prueba completos creados
- [x] Sistema de autenticación funciona con nuevos datos

---

### ✅ FASE 3 — Gestión de Estudiantes y Matrículas
**Objetivo**: Estudiantes globales (reutilizables por DNI) y matrícula a cursos  
**Estado**: ✅ **COMPLETADA**  
**Fecha**: 16/09/2025

#### ✅ Tareas Completadas:
- [x] API: /estudiantes (upsert por DNI), /cursos/:id/matriculas
- [x] UI: gestión de estudiantes, matriculación batch
- [x] Búsqueda por apellido/DNI
- [x] Componentes: EstudianteForm, MatriculasManager

#### ✅ Criterios de Aceptación Cumplidos:
- [x] Reutilización de Estudiante por DNI
- [x] UNIQUE(cursoId, dni) respetado
- [x] Búsqueda funcional

---

### ✅ FASE 4 — Cursos y Meses Habilitados
**Objetivo**: Crear cursos y seleccionar meses (con cortes)  
**Estado**: ✅ **COMPLETADA**  
**Fecha**: 16/09/2025

#### ✅ Tareas Completadas:
- [x] API: /cursos, /cursos/:id/periodos, /cursos/:id
- [x] Editor visual de meses (chips Ene-Dic)
- [x] Botones rápidos: "Mar-Jun", "Ago-Nov", "Año Completo", "Semestres"
- [x] Validaciones: solo meses habilitados
- [x] MonthSelector component con funcionalidad completa
- [x] Páginas de gestión de períodos de curso
- [x] Navegación integrada desde dashboard
- [x] Pruebas con Puppeteer exitosas
- [x] Build de producción funcionando

#### ✅ Criterios de Aceptación Cumplidos:
- [x] Editor de meses funcional
- [x] Solo meses habilitados en selectores
- [x] No aportes en meses no habilitados
- [x] Selección rápida de rangos de meses
- [x] Validación de al menos un mes seleccionado

---

### ✅ FASE 5 — Aportes Mensuales (Preceptoras)
**Objetivo**: Carga masiva y validaciones  
**Estado**: ✅ **COMPLETADA**  
**Fecha**: 16/09/2025

#### ✅ Tareas Completadas:
- [x] API: /cursos/:id/aportes (batch), /cursos/:id/periodos/:periodoId/aportes
- [x] Tabla editable por curso/mes con estudiantes matriculados
- [x] Resumen: total recaudado, #aportantes/#matriculados
- [x] Validaciones: duplicados, monto ≥ 0, solo meses habilitados
- [x] UI para seleccionar curso/período/mes
- [x] Formulario de carga masiva de aportes
- [x] Indicadores visuales de estado de aportes
- [x] **REFACTOR CRÍTICO**: Migración completa de campos de español a inglés
- [x] Actualización de todos los modelos Prisma a nomenclatura en inglés
- [x] Corrección de todos los endpoints API para usar nombres en inglés
- [x] Regeneración completa del cliente Prisma
- [x] Actualización de scripts de seed y datos de prueba

#### ✅ Criterios de Aceptación Cumplidos:
- [x] Tabla editable funcional con estudiantes matriculados
- [x] Duplicados bloqueados por (estudiante, curso, período, mes)
- [x] Texto "aporte voluntario" destacado
- [x] Solo meses habilitados permiten aportes
- [x] Resumen estadístico en tiempo real
- [x] Validación de montos y datos
- [x] **CRÍTICO**: Nomenclatura en inglés implementada según mejores prácticas
- [x] Build compilando exitosamente con nueva estructura

---

### 🔄 FASE 6 — Facturación Mensual por Curso (Secretaría)
**Objetivo**: Consolidar y emitir comprobante mensual  
**Estado**: 🔄 **PENDIENTE**

#### 📋 Tareas Planificadas:
- [ ] API: /cursos/:id/facturas, /export/csv
- [ ] PDF generation (html-to-pdf)
- [ ] UI: selector curso/mes, previsualización
- [ ] Export CSV detallado

#### 🎯 Criterios de Aceptación:
- [ ] Una factura por (curso, mes)
- [ ] PDF generado correctamente
- [ ] CSV export funcional

---

### 🔄 FASE 7 — Reportes, Auditoría y Accesibilidad
**Objetivo**: Transparencia básica y A11y razonable  
**Estado**: 🔄 **PENDIENTE**

#### 📋 Tareas Planificadas:
- [ ] Reporte mensual por curso
- [ ] Audit trail simple
- [ ] Etiquetas ARIA/roles
- [ ] Navegación por teclado

#### 🎯 Criterios de Aceptación:
- [ ] Export PDF/CSV funcionan
- [ ] Navegación por teclado en formularios

---

### 🔄 FASE 8 — Seguridad y Endurecimiento
**Objetivo**: Buenas prácticas OWASP mínimas  
**Estado**: 🔄 **PENDIENTE**

#### 📋 Tareas Planificadas:
- [ ] JWT: iss/aud/exp verificados
- [ ] Rate limiting en /auth/*
- [ ] CORS cerrado, Helmet headers
- [ ] Logging con correlación

#### 🎯 Criterios de Aceptación:
- [ ] Tests de seguridad pasan
- [ ] Límite de intentos de login

---

### 🔄 FASE 9 — Entorno & Deploy
**Objetivo**: Deploy reproducible y DX  
**Estado**: 🔄 **PENDIENTE**

#### 📋 Tareas Planificadas:
- [ ] Scripts dev, build, migrate
- [ ] Deploy (Vercel + PostgreSQL gestionado)
- [ ] CI/CD con migraciones automáticas

#### 🎯 Criterios de Aceptación:
- [ ] Deploy en entorno de prueba
- [ ] Smoke test OK

---

## 🎯 Definition of Done (MVP)

### Criterios Mínimos para MVP:
- [x] **FASE 0**: Bootstrap completado ✅
- [x] **FASE 1**: Autenticación completada ✅
- [ ] **FASES 2-6**: Core del sistema implementado
- [ ] Tests y linters en verde
- [ ] Facturación PDF/CSV operativa
- [ ] Dark/light theme estable
- [ ] RBAC aplicado correctamente
- [ ] Tokens JWT seguros
- [ ] Documentación de cada fase

---

## 📊 Progreso General

**Completado**: 5/9 fases (56%)  
**En progreso**: 0/9 fases  
**Pendiente**: 4/9 fases  

### Próximo Milestone:
🎯 **FASE 6 - Facturación Mensual por Curso (Secretaría)**

---

## 📁 Estructura Actual del Proyecto

```
cfp-fondo-comun/
├── 📁 src/
│   ├── 📁 app/
│   │   ├── 📁 api/
│   │   │   ├── 📁 auth/ ✅ (login, logout, refresh, me)
│   │   │   └── 📁 health/ ✅
│   │   ├── 📁 dashboard/ ✅ (protected page)
│   │   ├── 📁 login/ ✅ (auth page)
│   │   ├── globals.css ✅
│   │   ├── layout.tsx ✅ (with AuthProvider)
│   │   └── page.tsx ✅
│   ├── 📁 components/
│   │   ├── 📁 ui/ ✅ (Button, Card, Input, Table, Form)
│   │   └── theme-toggle.tsx ✅
│   ├── 📁 lib/
│   │   ├── auth.ts ✅ (JWT utilities)
│   │   ├── axios.ts ✅
│   │   ├── db.ts ✅
│   │   └── utils.ts ✅
│   └── 📁 providers/ ✅ (auth, query, theme)
├── 📁 prisma/ ✅ (User + RefreshToken models)
├── 📁 scripts/ ✅ (create-test-user.js)
├── middleware.ts ✅ (route protection)
├── docker-compose.yml ✅
├── env.example ✅
├── components.json ✅
├── src/styles/ ✅ (SASS architecture - migrado desde Tailwind)
└── README_FASE_0.md ✅
```

---

**Última actualización**: 15 de septiembre de 2025, 16:18  
**Siguiente acción**: Iniciar FASE 2 - Modelado de Dominio

### 🎉 FASE 1 Completada - Sistema de Autenticación Operativo
- **Test Users**: admin@cfp.edu.ar/admin123, preceptor@cfp.edu.ar/preceptor123
- **Dev Server**: http://localhost:3001
- **Features**: Login, Dashboard, Role-based UI, JWT tokens, Route protection
