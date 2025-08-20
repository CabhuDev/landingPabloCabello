# Multi-stage build para optimizar tamaño final
FROM python:3.11-slim as backend-builder

# Variables de entorno
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

# Instalar dependencias del sistema
RUN apt-get update && apt-get install -y \
    gcc \
    && rm -rf /var/lib/apt/lists/*

# Crear directorio de trabajo
WORKDIR /app

# Copiar requirements y instalar dependencias Python
COPY backend/requirements.txt .
RUN pip install --no-cache-dir --upgrade pip && \
    pip install --no-cache-dir --user -r requirements.txt

# Etapa final
FROM python:3.11-slim

# Variables de entorno para producción
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1
ENV PYTHONPATH=/app/backend

# Instalar nginx, supervisor y openssl
RUN apt-get update && apt-get install -y \
    nginx \
    supervisor \
    openssl \
    && rm -rf /var/lib/apt/lists/*

# Crear usuario no-root
RUN useradd --create-home --shell /bin/bash appuser

# Copiar dependencias Python desde builder
COPY --from=backend-builder /root/.local /home/appuser/.local

# Crear directorios necesarios
RUN mkdir -p /app/logs /var/log/supervisor
RUN chown -R appuser:appuser /app /var/log/supervisor

# Copiar código de la aplicación
COPY --chown=appuser:appuser backend/ /app/backend/
COPY --chown=appuser:appuser frontend/ /app/frontend/

# Copiar configuraciones
COPY docker/nginx.conf /etc/nginx/sites-available/default
COPY docker/supervisord.conf /etc/supervisor/conf.d/supervisord.conf
COPY docker/start.sh /app/start.sh

# Hacer ejecutable el script
RUN chmod +x /app/start.sh

# Exponer puerto 80 (solo HTTP, el VPS maneja SSL)
EXPOSE 80

# Supervisor debe ejecutarse como root para manejar nginx
# Las dependencias de Python están en /home/appuser/.local pero ejecutamos como root
USER root

# Variables de entorno para la aplicación
ENV PATH="/home/appuser/.local/bin:$PATH"
ENV PYTHONPATH="/app/backend:/home/appuser/.local/lib/python3.11/site-packages"

# Comando por defecto
CMD ["/app/start.sh"]