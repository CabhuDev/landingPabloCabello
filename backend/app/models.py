# backend/app/models.py

from pydantic import BaseModel, EmailStr

class ContactForm(BaseModel):
    """
    Modelo de datos para el formulario de contacto.
    Pydantic se encarga de validar que los datos recibidos se ajustan a esta estructura.
    - name: debe ser un string.
    - email: debe ser un string con formato de email válido (gracias a EmailStr).
    - message: debe ser un string.
    """
    name: str
    email: EmailStr
    message: str
