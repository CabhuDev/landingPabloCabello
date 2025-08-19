from fastapi import FastAPI, HTTPException
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles
from .models import ContactForm
from .core.mailer import send_contact_email

# 1. Crear una instancia de la aplicación FastAPI
app = FastAPI(
    title="API para la Web de Pablo Cabello",
    version="1.0.0",
)

# 2. Montar los archivos estáticos (CSS, JS, imágenes)
# El primer argumento es la ruta URL, `directory` es la carpeta en el disco.
# La ruta del directorio es relativa a la ubicación de main.py
app.mount("/assets", StaticFiles(directory="../frontend/assets"), name="assets")


# 3. Definir el endpoint raíz para servir index.html
@app.get("/", response_class=FileResponse)
async def read_index():
    """
    Este endpoint sirve el archivo principal de la interfaz de usuario.
    """
    return FileResponse("../frontend/index.html")


# 4. Definir el endpoint para el formulario de contacto
@app.post("/api/v1/contact")
async def submit_contact_form(form_data: ContactForm):
    try:
        success = await send_contact_email(
            name=form_data.name,
            email=form_data.email,
            message=form_data.message
        )
        if not success:
            raise HTTPException(status_code=500, detail="Error interno del servidor al enviar el correo.")
        
        return {"status": "success", "message": "Formulario recibido y correo enviado correctamente."}
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Un error inesperado ocurrió: {e}")