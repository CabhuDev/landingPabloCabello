# backend/app/core/mailer.py

import os
import smtplib
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from dotenv import load_dotenv

# Cargar las variables de entorno desde el archivo .env
load_dotenv()

# Leer las credenciales y configuración desde las variables de entorno
EMAIL_HOST = os.getenv("EMAIL_HOST")
EMAIL_PORT = int(os.getenv("EMAIL_PORT", 587))
EMAIL_USERNAME = os.getenv("EMAIL_USERNAME")
EMAIL_PASSWORD = os.getenv("EMAIL_PASSWORD")
EMAIL_FROM = os.getenv("EMAIL_FROM")
EMAIL_TO = os.getenv("EMAIL_TO")

async def send_contact_email(name: str, email: str, message: str) -> bool:
    """
    Construye y envía un correo electrónico con los datos del formulario de contacto.

    Args:
        name (str): Nombre del remitente.
        email (str): Email del remitente.
        message (str): Mensaje del formulario.

    Returns:
        bool: True si el correo se envió con éxito, False en caso contrario.
    """
    if not all([EMAIL_HOST, EMAIL_PORT, EMAIL_USERNAME, EMAIL_PASSWORD, EMAIL_FROM, EMAIL_TO]):
        print("Error: Faltan variables de entorno para la configuración del email.")
        return False

    # Crear el cuerpo del mensaje
    msg = MIMEMultipart()
    msg['From'] = EMAIL_FROM
    msg['To'] = EMAIL_TO
    msg['Subject'] = f"Nuevo Mensaje de Contacto de {name}"

    body = f"""
    Has recibido un nuevo mensaje a través del formulario de tu página web.
    ------------------------------------------------------------------

    Nombre: {name}
    Email: {email}

    Mensaje:
    {message}

    ------------------------------------------------------------------
    """
    msg.attach(MIMEText(body, 'plain'))

    try:
        print("Intentando conectar con el servidor SMTP...")
        # Conectar al servidor SMTP
        server = smtplib.SMTP(EMAIL_HOST, EMAIL_PORT)
        server.starttls()  # Iniciar conexión segura
        server.login(EMAIL_USERNAME, EMAIL_PASSWORD)
        
        # Enviar el correo
        text = msg.as_string()
        server.sendmail(EMAIL_FROM, EMAIL_TO, text)
        server.quit()
        
        print("Correo enviado con éxito.")
        return True
    except smtplib.SMTPAuthenticationError as e:
        print(f"Error de autenticación SMTP: {e}")
        return False
    except Exception as e:
        print(f"Error al enviar el correo: {e}")
        return False
