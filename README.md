# Pablo Cabello - Aparejador Web

Landing page profesional para Pablo Cabello, aparejador.

## Stack Tecnológico

- **Frontend:** HTML5, CSS3, JavaScript Vanilla
- **Backend:** Python con FastAPI

## Estructura del Proyecto

```
├── backend/          # API con FastAPI
├── frontend/         # Archivos estáticos del sitio web
└── docs/            # Documentación del proyecto
```

## Ramas

- `main`: Rama de producción (código estable)
- `development`: Rama de desarrollo (nuevas funcionalidades)

## Instalación y Desarrollo

### Backend
```bash
cd backend
pip install -r requirements.txt
uvicorn app.main:app --reload
```

### Frontend
Abrir `frontend/index.html` en el navegador o servir con un servidor local.

## Contribución

1. Crear feature branch desde `development`
2. Hacer commits con mensajes descriptivos
3. Crear Pull Request hacia `development`
4. Hacer merge a `main` solo para releases