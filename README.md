# 🏗️ Pablo Cabello - Web Aparejador Especialista en Retail

> **Landing page profesional bilingüe** para Pablo Cabello, Arquitecto Técnico Colegiado especializado en aperturas retail y franquicias.

[![Versión](https://img.shields.io/badge/Versión-4.0-blue)](https://github.com/CabhuDev/landingPabloCabello)
[![Bilingüe](https://img.shields.io/badge/Idiomas-ES%20%7C%20EN-success)](https://pablocabello.com)
[![SEO](https://img.shields.io/badge/SEO-Structured%20Data-brightgreen)](https://developers.google.com/search/docs/appearance/structured-data)
[![Analytics](https://img.shields.io/badge/Analytics-GA4%20Implementado-orange)](https://analytics.google.com)
[![PWA](https://img.shields.io/badge/PWA-Service%20Worker-purple)](https://web.dev/progressive-web-apps/)

## 🎯 **Estado Actual del Proyecto**

### **✅ Características Implementadas**

| **Funcionalidad** | **Estado** | **Descripción** |
|------------------|------------|-----------------|
| **🌍 Web Bilingüe** | ✅ Completo | Español/Inglés con switch automático |
| **📊 SEO Avanzado** | ✅ Completo | Structured Data JSON-LD actualizado |
| **⚡ PWA/Service Worker** | ✅ Completo | Cache inteligente + funcionalidad offline |
| **📈 Google Analytics 4** | ✅ Configurado | Tracking de conversiones implementado |
| **🎨 Diseño Responsive** | ✅ Completo | Móvil, tablet y desktop optimizado |
| **📝 Casos Reales** | ✅ Completo | LlaoLlao, Clínica Baviera, etc. |
| **🔧 Docker Ready** | ✅ Completo | Contenedores para desarrollo y producción |

---

## 🏗️ **Stack Tecnológico Actual**

### **Frontend Optimizado:**
- **HTML5 Semántico** → SEO + Structured Data (JSON-LD) completamente actualizado
- **CSS3 Avanzado** → Variables CSS + Grid Layout + Flexbox + Animaciones suaves
- **JavaScript Modular** → 6 módulos especializados (analytics, form-handler, eventos, etc.)
- **Service Worker** → Cache inteligente + offline-first + clear cache functionality
- **Diseño Bilingüe** → Switch ES/EN automático con localStorage

### **Backend Robusto:**
- **FastAPI** → API REST con validación Pydantic + CORS configurado
- **Python 3.9+** → Lógica de negocio + Email automation con Gmail API
- **Async/Await** → Performance optimizada para formularios
- **Testing** → Tests automatizados con pytest

### **DevOps & Deployment:**
- **Docker** → Contenedores multi-stage optimizados
- **Nginx** → Reverse proxy + SSL ready
- **Supervisord** → Gestión de procesos
- **Scripts automatizados** → PowerShell + Bash para desarrollo y deploy

---

## 📁 **Estructura del Proyecto Actual**

```
📦 WebPabloAparejador/
├── 📄 README.md                    # Documentación principal
├── 📄 CLAUDE.md                    # Contexto de desarrollo + instrucciones
├── 📄 GEMINI.md                    # Instrucciones para Gemini AI
├── 🐳 Dockerfile                   # Imagen Docker multi-stage optimizada
├── 🐳 docker-compose.yml           # Orquestación de contenedores
├── 📄 eslint.config.js            # Configuración ESLint
├── 📄 package.json                 # Dependencias Node.js + scripts
├── 📄 start.ps1                    # Script de inicio rápido
│
├── 📁 docs/                        # 📚 Documentación técnica
│   ├── 📄 DEPLOY-HOSTINGER-VPS.md  # Despliegue específico Hostinger
│   ├── 📄 DOCKER-STATUS.md         # Estado actual Docker
│   ├── 📄 ESTADO_NGINX_VPS.md      # Configuración Nginx actual
│   ├── 📄 GUIA-ACTUALIZACION-VPS.md # Guía actualización VPS
│   ├── 📄 METRICAS-IMPLEMENTACION.md # Métricas y analytics
│   ├── 📄 README-Docker.md         # Docker completo
│   ├── 📄 guiaEstilos.md           # Guía diseño actualizada
│   ├── 📄 pablocabello.md          # Plan técnico original
│   └── 📁 deployment/
│       └── 📄 DEPLOY-VPS.md        # Guía despliegue VPS
│
├── 📁 scripts/                     # 🔧 Automatización
│   ├── 📄 deploy-production.ps1    # Deploy producción Windows
│   ├── 📄 dev-server.ps1           # Desarrollo local Windows
│   ├── 📄 docker-local.ps1         # Docker local Windows
│   ├── 📄 utilities.ps1            # Utilidades Windows
│   ├── 📄 build.sh                 # Build Linux
│   ├── 📄 deploy.sh                # Deploy Linux
│   ├── 📄 docker-build.sh          # Build Docker
│   ├── 📄 docker-deploy.sh         # Deploy Docker
│   ├── 📄 start.sh                 # Start contenedor
│   └── 📄 vps-setup.sh             # Setup inicial VPS
│
├── 📁 docker/                      # 🐳 Configuración Docker
│   ├── 📄 nginx.conf              # Nginx para contenedor
│   ├── 📄 start.sh                # Script inicio contenedor
│   └── 📄 supervisord.conf        # Gestión procesos
│
├── 🎨 frontend/                    # Frontend bilingüe optimizado
│   ├── 📄 index.html              # Landing page bilingüe + SEO
│   ├── 📄 sw.js                   # Service Worker avanzado
│   ├── 📄 clear-sw.html           # Utilidad limpiar cache
│   │
│   └── 📁 assets/
│       ├── 🎨 css/
│       │   └── 📄 style.css       # CSS completo responsive
│       │
│       ├── ⚡ js/
│       │   ├── 📄 events.js               # Eventos UI
│       │   ├── 📄 form-handler.js         # Formulario contacto
│       │   ├── 📄 analytics-tracker.js    # GA4 tracking
│       │   ├── 📄 performance-optimizer.js # Performance
│       │   ├── 📄 ab-testing.js          # A/B testing (deshabilitado)
│       │   └── 📄 language-switcher.js   # Switch idioma
│       │
│       └── 🖼️ images/                     # Imágenes optimizadas
│           ├── 📷 baviera-velez.jpg      # Casos reales
│           ├── 📷 llaollao-granada.jpg   # Proyectos documentados
│           ├── 📷 basic-fit-*.jpg        # Portfolio completo
│           └── ... (12+ imágenes)
│
├── 🔧 backend/                     # API FastAPI
│   ├── 📁 app/
│   │   ├── 📄 main.py              # API endpoints + CORS
│   │   ├── 📄 models.py            # Modelos Pydantic
│   │   └── 📁 core/
│   │       └── 📄 mailer.py        # Email automation
│   │
│   ├── 📁 tests/
│   │   └── 📄 test_main.py         # Tests unitarios
│   │
│   ├── 📄 credentials.json         # Credenciales Gmail API
│   ├── 📄 credentials.json.example # Template credenciales
│   ├── 📄 requirements.txt         # Dependencies lockfile
│   └── 📄 requirements.in          # Dependencies source
│
├── 📁 logs/                        # 📋 Logs del sistema
│   ├── 📄 fastapi.log             # Logs API
│   ├── 📄 nginx_access.log        # Logs acceso
│   └── ... (logs automatizados)
│
└── 📁 node_modules/               # 📦 Dependencies Node.js
```

---

## 🚀 **Características Principales Implementadas**

### **🌍 Web Bilingüe Avanzada**
- **Switch automático ES/EN**: Detecta idioma navegador + localStorage
- **Contenido completamente traducido**: Cada texto, botón y sección
- **URLs amigables**: Misma URL para ambos idiomas
- **SEO bilingüe**: Meta tags y structured data en ambos idiomas

### **📊 SEO y Performance Optimizados**
- **Structured Data JSON-LD**: Schema.org completo y actualizado
- **Service Worker avanzado**: Cache inteligente + funcionalidad offline
- **Core Web Vitals**: Optimización LCP, FID, CLS
- **Google Analytics 4**: Tracking completo configurado (G-KE03XZJNV6)

### **🎨 Diseño Profesional Responsive**
- **Mobile-first**: Optimizado para todos los dispositivos
- **CSS Variables**: Sistema de colores y tipografías coherente
- **Animaciones suaves**: Micro-interacciones premium
- **Glassmorphism effects**: Elementos modernos y elegantes

### **📝 Casos de Estudio Reales**
- **LlaoLlao Granada**: Apertura con exigencias sanitarias
- **Clínica Baviera Vélez-Málaga**: Desarrollo integral médico
- **Basic Fit**: Múltiples localizaciones (Sestao, Ciudad Real)
- **Ktuin**: Proyectos Elche y Lugo
- **Perry**: Desarrollo Ajax
- **Sprinter**: Expansión internacional (Ceuta, Venlo, Zuidplein)

### **🔧 Backend Robusto**
- **FastAPI**: API moderna con validación Pydantic
- **Email automation**: Sistema de envío con Gmail API
- **Tests automatizados**: Cobertura de endpoints críticos
- **CORS configurado**: Ready para producción

---

## 📊 **Analytics y Tracking Implementado**

### **🔍 Google Analytics 4 Configurado:**
- **Tracking ID**: G-KE03XZJNV6 (configurado y activo)
- **Eventos personalizados**: Formulario, clicks CTA, scroll depth
- **Conversiones**: Tracking de leads y micro-conversiones
- **Enhanced ecommerce**: Preparado para futuras integraciones

### **⚡ Performance Monitoring:**
- **Core Web Vitals**: Monitoreo automático implementado
- **Service Worker**: Cache strategy para mejorar velocidad
- **Image optimization**: Lazy loading en todas las imágenes
- **CSS/JS optimization**: Minificado y modular

### **🧪 A/B Testing Framework:**
- **Estado actual**: Deshabilitado en producción
- **Infraestructura**: Lista para activar cuando sea necesario
- **Variantes preparadas**: Headlines, CTAs, formularios
- **Analytics integration**: Eventos A/B tracked en GA4

### **📱 PWA Features:**
- **Service Worker**: Funcionalidad offline básica
- **Cache management**: Sistema inteligente de caché
- **Clear cache utility**: Página para limpiar cache (/clear-sw.html)
- **Performance**: Optimizado para velocidad de carga

---

## 🎨 **Diseño Premium**

### **🎨 Paleta de Colores Refinada:**
```css
--color-primary: #001B2E         /* Azul marino profundo */
--color-secondary-cta: #D4A574   /* Oro elegante (vs mostaza) */
--color-accent: #38A169          /* Verde confianza */
--color-neutral-100: #F8FAFC     /* Blanco cálido */
--color-neutral-600: #4A5568     /* Texto secundario */
```

### **✨ Tipografía Premium:**
- **Inter** → Modernidad y legibilidad superior
- **Montserrat** → Headlines con carácter
- **Weights estratégicos**: 300, 400, 500, 600, 700

### **🎭 Micro-interacciones:**
- **Hover effects**: Transform + sombras dinámicas
- **Loading states**: Blur-to-focus en imágenes
- **Scroll animations**: Elementos que aparecen suavemente
- **Focus states**: Accesibilidad premium

---

## 🛠️ **Guía de Desarrollo**

### **🚀 Inicio Rápido:**

#### **Opción 1: Script automatizado (recomendado)**
```powershell
# Windows - Inicio completo
.\start.ps1

# Windows - Solo desarrollo 
.\scripts\dev-server.ps1

# Windows - Docker local
.\scripts\docker-local.ps1
```

#### **Opción 2: NPM Scripts**
```bash
# Frontend solo
npm run dev

# Backend solo  
npm run dev:backend

# Ambos (PowerShell)
npm run dev:full
```

#### **Opción 3: Manual**
```bash
# Terminal 1 - Backend
cd backend
python -m uvicorn app.main:app --reload --host 127.0.0.1 --port 8000

# Terminal 2 - Frontend
cd frontend  
npx http-server . --cors --port 3000
```

### **🐳 Docker Development**

```bash
# Desarrollo completo
docker-compose up -d

# Build personalizado
docker build -t pablocabello-web .

# Deploy a producción
.\scripts\docker-deploy.sh
```

### **🔧 Herramientas de Desarrollo**

```bash
# Linting JavaScript
npm run lint:js

# Formatear código
npm run format:js

# Validar HTML
npm run validate:html

# Auditoría dependencias
npm run audit
```

### **🌐 Configuración para Producción**

#### **Analytics (ya configurado):**
- **Google Analytics 4**: G-KE03XZJNV6 ✅
- **Tracking**: Formularios, CTAs, scroll depth ✅
- **Conversiones**: Sistema automático implementado ✅

#### **Domain y SSL:**
- **Dominio**: pablocabello.com (configurar en hosting)
- **SSL**: Ready para Let's Encrypt
- **Nginx**: Configuración lista en `/docker/nginx.conf`

#### **Email Backend:**
- **Gmail API**: Configurar `credentials.json` en `/backend/`
- **SMTP**: Alternativa lista en código
- **Validación**: Pydantic models implementados

---

## 🎯 **Roadmap y Próximas Mejoras**

### **📈 Optimizaciones Pendientes:**
- **A/B Testing**: Activar en producción cuando haya tráfico
- **Hotjar**: Integrar heatmaps para análisis UX
- **Core Web Vitals**: Optimizar para Score 95+
- **Blog**: Sección de artículos técnicos

### **🚀 Funcionalidades Futuras:**
- **CRM Integration**: Conectar formularios con Pipedrive/HubSpot
- **Obratec Platform**: Integración con metodología propia
- **Multi-idioma**: Expandir a catalán/francés
- **Calculadora ROI**: Tool interactiva de presupuestos

---

## 🔄 **Workflow de Git**

### **🌿 Branches Actuales:**
- `development` → Rama principal de desarrollo (activa)
- `main` → Producción estable

### **📝 Últimos Commits:**
```
5f552a9 Web translated to english + Analytics
df6d863 Merge branch 'development'  
bb5dc82 Service worker improvements
41a76f4 Improve SEO and structured data
e854e6b Fix: Disable A/B testing
```

### **🏷️ Convención de Commits:**
```bash
feat: add bilingual functionality
fix: resolve service worker cache
perf: optimize structured data
docs: update README with current state
```

---

## 📚 **Documentación Completa**

| Archivo | Estado | Descripción |
|---------|--------|-------------|
| **[CLAUDE.md](CLAUDE.md)** | ✅ Actualizado | Contexto desarrollo + instrucciones |
| **[GEMINI.md](GEMINI.md)** | ✅ Actualizado | Instrucciones para Gemini AI |
| **[docs/METRICAS-IMPLEMENTACION.md](docs/METRICAS-IMPLEMENTACION.md)** | ✅ Completo | Guía métricas y analytics |
| **[docs/README-Docker.md](docs/README-Docker.md)** | ✅ Completo | Docker deployment guide |
| **[docs/guiaEstilos.md](docs/guiaEstilos.md)** | ✅ Actualizado | Guía de diseño y estilos |
| **[docs/DEPLOY-HOSTINGER-VPS.md](docs/DEPLOY-HOSTINGER-VPS.md)** | ✅ Específico | Deploy en VPS Hostinger |

---

## ✅ **Estado Actual: Listo para Producción**

### **🏆 Logros Implementados:**
✅ **Web bilingüe completa** (ES/EN) con switch automático  
✅ **SEO optimizado** con structured data Schema.org  
✅ **PWA funcional** con service worker avanzado  
✅ **Analytics configurado** Google Analytics 4 activo  
✅ **Portfolio real** con casos documentados  
✅ **Backend robusto** FastAPI + email automation  
✅ **Docker ready** para deploy inmediato  

### **🎯 Diferenciación Conseguida:**
- **Especialización retail**: 10+ años experiencia documentada
- **Metodología Obratec**: Sistema propio diferenciador
- **Casos reales**: LlaoLlao, Baviera, Basic Fit, etc.
- **Bilingüe**: Alcance internacional ready
- **Tech stack moderno**: PWA + Analytics profesional

---

## 📞 **Información de Contacto**

**Pablo Cabello Hurtado**  
🏗️ **Arquitecto Técnico Colegiado nº 90533**  
📧 Email: pablo.cabello.hurtado@gmail.com  
📱 Teléfono: +34-600-518-588  
🌐 Web: [pablocabello.com](https://pablocabello.com)  
💼 LinkedIn: [Pablo Cabello - Arquitecto Técnico](https://linkedin.com/in/pablo-cabello-hurtado)  
🏢 Ubicación: Granada, Andalucía, España

### **🔗 Enlaces del Proyecto:**
- **Repositorio**: [github.com/CabhuDev/landingPabloCabello](https://github.com/CabhuDev/landingPabloCabello)
- **Metodología**: [obratec.es](https://obratec.es)

---

✍️ **Desarrollado por Pablo Cabello**  
📅 **Última actualización: Agosto 2025**  
🚀 **Versión: 4.0 - Web Bilingüe Lista para Producción**