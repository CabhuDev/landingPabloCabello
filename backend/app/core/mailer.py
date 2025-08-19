# backend/app/core/mailer.py

import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
import os


def send_email_smtp(to_email: str, subject: str, body: str) -> bool:
    """
    Envía email usando SMTP de Gmail con credenciales de aplicación.
    """
    # Configuración SMTP de Gmail
    smtp_server = "smtp.gmail.com"
    smtp_port = 587
    
    # Credenciales de tu cuenta Gmail (usar contraseña de aplicación)
    gmail_user = os.getenv("GMAIL_USER", "tu-email@gmail.com")
    gmail_password = os.getenv("GMAIL_APP_PASSWORD", "tu-password-app")
    
    try:
        # Crear mensaje con codificación UTF-8
        msg = MIMEMultipart('alternative')
        msg['From'] = gmail_user
        msg['To'] = to_email
        msg['Subject'] = subject
        msg.attach(MIMEText(body, 'plain', 'utf-8'))
        
        # Convertir a string con codificación correcta
        msg_str = msg.as_string().encode('utf-8')
        
        # Conectar y enviar
        server = smtplib.SMTP(smtp_server, smtp_port)
        server.starttls()
        server.login(gmail_user, gmail_password)
        server.sendmail(gmail_user, to_email, msg_str)
        server.quit()
        
        print(f"Email enviado correctamente a {to_email}")
        return True
        
    except Exception as e:
        print(f"Error enviando email: {e}")
        return False


async def send_contact_email(name: str, email: str, message: str) -> bool:
    """
    Envía notificación de contacto a tu email usando SMTP.
    """
    subject = f"Nuevo Mensaje de Contacto de {name}"
    body = f"""Has recibido un nuevo mensaje a través del formulario de tu página web.
------------------------------------------------------------------

Nombre: {name}
Email: {email}

Mensaje:
{message}

------------------------------------------------------------------
"""
    
    # Enviar a tu email personal
    your_email = os.getenv("YOUR_EMAIL", "pablo.cabello@tu-dominio.com")
    return send_email_smtp(your_email, subject, body)


async def send_thank_you_email(name: str, email: str) -> bool:
    """
    Envía un email de agradecimiento al usuario que rellenó el formulario.
    """
    subject = "Gracias por contactar - Hemos recibido tu mensaje"
    body = f"""Hola {name},

Gracias por ponerte en contacto con nosotros. Hemos recibido tu mensaje y te responderemos lo antes posible.

Un saludo,
El equipo de Pablo Cabello
"""
    
    return send_email_smtp(email, subject, body)