# Plan General CFP Fondo Común - MVP Escalable

## 📋 Estado General del Proyecto

**Proyecto**: CFP Fondo Común – Lagopuelo (MVP escalable)  
**Tech Stack**: Next.js (App Router) + TypeScript + Prisma + PostgreSQL + TanStack Query + Axios + shadcn/ui + next-themes  
**Fecha de inicio**: 14 de septiembre de 2025  
**Estado actual**: FASE 1 completada ✅

---

## 🎯 Fases del Proyecto

### ✅ FASE 0 — Bootstrap & Infra (COMPLETADA)
**Objetivo**: Repo inicial listo para iterar  
**Estado**: ✅ **COMPLETADO**  
**Fecha**: 14/09/2025

#### ✅ Tareas Completadas:
- [x] Next.js con App Router + TypeScript configurado
- [x] ESLint, Prettier configurados
- [x] Tailwind CSS + shadcn/ui (Button, Input, Table, Card) instalado
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
**Fecha**: 14/09/2025

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

#### ✅ Criterios de Aceptación Cumplidos:
- [x] RBAC implementado (ADMIN/PRECEPTOR roles)
- [x] Refresh token rotation funciona
- [x] bcrypt para password hashing (seguro)
- [x] Middleware protege rutas /dashboard/**
- [x] HTTP-only cookies para seguridad XSS
- [x] AuthProvider maneja estado de autenticación
- [x] Sistema de login/logout completo

---

### 🔄 FASE 2 — Modelado de Dominio y Migraciones
**Objetivo**: Esquema de datos y seeds  
**Estado**: 🔄 **PENDIENTE**

#### 📋 Tareas Planificadas:
- [ ] Modelos Prisma: Estudiante, Curso, CursoPeriodo, Matricula, Aporte, FacturaCurso
- [ ] Constraints y validaciones (UNIQUE, índices)
- [ ] Seeds: 1 ADMIN, 1 PRECEPTOR, 2 cursos, 3 meses, 3 estudiantes
- [ ] Zod schemas para validaciones
- [ ] TypeScript types

#### 🎯 Criterios de Aceptación:
- [ ] `prisma migrate dev` crea todas las tablas
- [ ] Seeds funcionan correctamente
- [ ] Constraints UNIQUE respetados
- [ ] Validaciones Zod implementadas

---

### 🔄 FASE 3 — Gestión de Estudiantes y Matrículas
**Objetivo**: Estudiantes globales (reutilizables por DNI) y matrícula a cursos  
**Estado**: 🔄 **PENDIENTE**

#### 📋 Tareas Planificadas:
- [ ] API: /estudiantes (upsert por DNI), /cursos/:id/matriculas
- [ ] UI: gestión de estudiantes, matriculación batch
- [ ] Búsqueda por apellido/DNI
- [ ] Componentes: EstudianteForm, MatriculasManager

#### 🎯 Criterios de Aceptación:
- [ ] Reutilización de Estudiante por DNI
- [ ] UNIQUE(cursoId, dni) respetado
- [ ] Búsqueda funcional

---

### 🔄 FASE 4 — Cursos y Meses Habilitados
**Objetivo**: Crear cursos y seleccionar meses (con cortes)  
**Estado**: 🔄 **PENDIENTE**

#### 📋 Tareas Planificadas:
- [ ] API: /cursos, /cursos/:id/periodos
- [ ] Editor visual de meses (chips Ene-Dic)
- [ ] Botones rápidos: "Mar-Jun", "Ago-Nov"
- [ ] Validaciones: solo meses habilitados

#### 🎯 Criterios de Aceptación:
- [ ] Editor de meses funcional
- [ ] Solo meses habilitados en selectores
- [ ] No aportes en meses no habilitados

---

### 🔄 FASE 5 — Aportes Mensuales (Preceptoras)
**Objetivo**: Carga masiva y validaciones  
**Estado**: 🔄 **PENDIENTE**

#### 📋 Tareas Planificadas:
- [ ] API: /cursos/:id/aportes (batch)
- [ ] Tabla editable por curso/mes
- [ ] Resumen: total, #aportantes/#matriculados
- [ ] Validaciones: duplicados, monto ≥ 0

#### 🎯 Criterios de Aceptación:
- [ ] Tabla editable funcional
- [ ] Duplicados bloqueados
- [ ] Texto "aporte voluntario" destacado

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

**Completado**: 2/9 fases (22%)  
**En progreso**: 0/9 fases  
**Pendiente**: 7/9 fases  

### Próximo Milestone:
🎯 **FASE 2 - Modelado de Dominio**

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
├── tailwind.config.ts ✅
└── README_FASE_0.md ✅
```

---

**Última actualización**: 14 de septiembre de 2025, 21:28  
**Siguiente acción**: Iniciar FASE 2 - Modelado de Dominio

### 🎉 FASE 1 Completada - Sistema de Autenticación Operativo
- **Test Users**: admin@cfp.edu.ar/admin123, preceptor@cfp.edu.ar/preceptor123
- **Dev Server**: http://localhost:3001
- **Features**: Login, Dashboard, Role-based UI, JWT tokens, Route protection
