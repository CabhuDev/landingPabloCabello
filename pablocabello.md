# Plan de Desarrollo: pablocabello.com

## 1. Stack Tecnológico

- **Frontend:** HTML5, CSS3 (nativo, sin frameworks), JavaScript Vanilla (ES6+).
- **Backend:** Python con el framework FastAPI.

## 2. Estructura de Archivos y Carpetas

```
C:\Users\Pablo\Desktop\WebPabloAparejador\
├── backend\
│   ├── app\
│   │   ├── __init__.py
│   │   ├── main.py         # Lógica principal de la API (endpoints)
│   │   ├── models.py       # Modelos de datos Pydantic para validación
│   │   └── core\
│   │       └─── __init__.py
│   │       └─── mailer.py   # Lógica para enviar correos (opcional)
│   ├── tests\              # Pruebas para el backend
│   │   └── __init__.py
│   │   └── test_main.py
│   ├── .gitignore
│   └── requirements.txt    # Dependencias de Python (fastapi, uvicorn)
│
└── frontend\
    ├── index.html          # La página principal (landing page)
    ├── assets\
    │   ├── css\
    │   │   └── style.css   # Estilos principales
│   │   ├── js\
│   │   │   ├── events.js     # Lógica para eventos de la UI (animaciones, scroll)
│   │   │   └── form-handler.js # Lógica específica para el formulario de contacto
│   │   └── images\
│   │       ├── hero-background.jpg # Imagen de fondo principal
│   │       └── project-placeholder.png # Imagen para portfolio
│   │
    └─── pablocabello.com.md
```

## 3. Arquitectura del Sistema

1.  **Frontend (Cliente):**
    -   `index.html`: Archivo estático principal.
    -   `style.css`: Estilos con media queries para un diseño responsive (Mobile-First).
    -   `events.js`: Manejará interacciones de la página como efectos de scroll, menús, etc.
    -   `form-handler.js`: Se encargará exclusivamente de la validación y envío del formulario de contacto.

2.  **Backend (Servidor - FastAPI):**
    -   Servidor independiente con un endpoint principal: `/api/v1/contact`.
    -   Aceptará peticiones `POST` con los datos del formulario.
    -   Validará los datos de entrada usando modelos de Pydantic definidos en `models.py`.

3.  **Comunicación (Frontend <-> Backend):**
    -   El `form-handler.js` interceptará el envío del formulario.
    -   Usará la API `fetch` para enviar los datos en formato JSON al endpoint `/api/v1/contact`.
    -   El backend procesará la solicitud (p. ej., enviando un email) y devolverá una respuesta de éxito/error.
    -   El frontend mostrará un mensaje apropiado al usuario.

## 4. Buenas Prácticas y Rendimiento

- **HTML Semántico:** Uso de `<header>`, `<main>`, `<section>`, `<footer>` para SEO y accesibilidad.
- **CSS Moderno:** Uso de Flexbox, Grid y variables CSS.
- **JavaScript Eficiente:** Carga de scripts con `defer` para no bloquear la renderización. Código modular y separado por responsabilidad.
- **Optimización de Assets:** Compresión de imágenes.
- **Backend Robusto:** Validación de datos y estructura escalable.
- **Despliegue:** Backend con Uvicorn/Gunicorn y frontend como archivos estáticos.

```