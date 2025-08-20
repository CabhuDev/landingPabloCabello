# 🐳 Pablo Cabello - Contenedorización Docker

Configuración Docker completa para desplegar la web de Pablo Cabello (Aparejador & Desarrollador) en producción.

## 📁 Estructura Docker

```
WebPabloAparejador/
├── Dockerfile                 # Imagen multi-stage optimizada
├── docker-compose.yml         # Orquestación de servicios
├── .dockerignore              # Archivos excluidos del contexto
├── docker/
│   ├── nginx.conf            # Configuración Nginx optimizada
│   ├── supervisord.conf      # Supervisor para manejar procesos
│   └── start.sh              # Script de inicio del contenedor
├── build.sh                  # Script de construcción
├── deploy.sh                 # Script de despliegue
└── README-Docker.md          # Esta documentación
```

## 🚀 Construcción y Ejecución

### **Desarrollo Local**

```bash
# Construir la imagen
./build.sh

# O manualmente
docker build -t pablo-cabello-web .

# Ejecutar con docker-compose (recomendado)
docker-compose up -d

# O ejecutar directamente
docker run -d -p 80:80 --name pablo-cabello-app pablo-cabello-web
```

### **Verificar que funciona**
- **Frontend:** http://localhost
- **Backend API:** http://localhost/api/
- **Documentación:** http://localhost/docs
- **Health Check:** http://localhost/health

## 🏭 Despliegue en Producción

### **En tu VPS/Servidor:**

```bash
# 1. Clonar el repositorio
git clone <tu-repo> /opt/pablo-cabello
cd /opt/pablo-cabello

# 2. Configurar variables de entorno
export PABLO_PRODUCTION_SERVER=true

# 3. Ejecutar despliegue
./deploy.sh
```

### **Configuración con HTTPS (Let's Encrypt)**

```bash
# Instalar certbot
sudo apt-get install certbot

# Generar certificados
sudo certbot certonly --standalone -d tu-dominio.com

# Montar certificados en docker-compose.yml
volumes:
  - /etc/letsencrypt/live/tu-dominio.com:/app/certs
```

## ⚙️ Configuración Avanzada

### **Variables de Entorno**

Crea un archivo `.env` en el directorio raíz:

```env
# Entorno
ENV=production
DEBUG=false

# Base de datos
DATABASE_URL=sqlite:///./data/app.db
# Para PostgreSQL:
# DATABASE_URL=postgresql://user:password@db:5432/pablo_cabello

# Email (para formulario de contacto)
SMTP_SERVER=smtp.gmail.com
SMTP_PORT=587
EMAIL_USER=tu-email@gmail.com
EMAIL_PASSWORD=tu-app-password

# Seguridad
SECRET_KEY=tu-clave-secreta-muy-segura-aqui
```

### **Con Base de Datos PostgreSQL**

Descomenta la sección `db` en `docker-compose.yml` y actualiza:

```yaml
services:
  web:
    depends_on:
      - db
    environment:
      - DATABASE_URL=postgresql://pablouser:securepassword123@db:5432/pablo_cabello
  
  db:
    image: postgres:15-alpine
    # ... resto de configuración
```

## 📊 Monitoreo y Logs

### **Ver logs en tiempo real**
```bash
docker-compose logs -f
```

### **Logs específicos**
```bash
# Nginx
docker-compose exec web tail -f /app/logs/nginx_access.log

# Backend FastAPI
docker-compose exec web tail -f /app/logs/fastapi.log
```

### **Estadísticas de recursos**
```bash
docker stats
```

### **Health Check**
```bash
curl http://localhost/health
```

## 🔧 Mantenimiento

### **Actualizar aplicación**
```bash
git pull origin main
./deploy.sh
```

### **Backup de datos**
```bash
# Crear backup manual
sudo tar -czf backup-$(date +%Y%m%d).tar.gz /opt/pablo-cabello/data

# Los backups automáticos se crean en cada despliegue en:
/opt/pablo-cabello/backups/
```

### **Restaurar desde backup**
```bash
sudo tar -xzf backup-20241201.tar.gz -C /opt/pablo-cabello/
docker-compose restart
```

### **Limpiar sistema**
```bash
# Limpiar imágenes no utilizadas
docker image prune -a

# Limpiar volúmenes no utilizados
docker volume prune

# Limpiar todo el sistema (¡cuidado!)
docker system prune -a
```

## 🔒 Seguridad

La configuración incluye:

- ✅ **Usuario no-root** en el contenedor
- ✅ **Headers de seguridad** (XSS, CSRF, etc.)
- ✅ **Rate limiting** en Nginx
- ✅ **Logs de acceso** completos
- ✅ **SSL/HTTPS** ready
- ✅ **Firewall** configuración sugerida:

```bash
# UFW básico para VPS
sudo ufw allow ssh
sudo ufw allow 80
sudo ufw allow 443
sudo ufw enable
```

## 🚨 Troubleshooting

### **El contenedor no inicia**
```bash
# Ver logs detallados
docker-compose logs web

# Verificar configuración
docker-compose config
```

### **No se puede conectar**
```bash
# Verificar puertos
netstat -tlnp | grep :80

# Verificar que el contenedor está corriendo
docker-compose ps
```

### **Problemas de permisos**
```bash
# Arreglar permisos de logs y data
sudo chown -R $USER:$USER logs/ data/
```

### **Out of memory**
```bash
# Agregar límites en docker-compose.yml
services:
  web:
    mem_limit: 512m
    memswap_limit: 512m
```

## 📈 Optimizaciones

### **Para mejor rendimiento:**

1. **Usar CDN** para archivos estáticos
2. **Redis** para caché (añadir servicio en docker-compose)
3. **Load balancer** si tienes múltiples instancias
4. **Monitoring** con Prometheus/Grafana

---

## 📞 Contacto

**Pablo Cabello**  
Aparejador & Desarrollador DAW  
Email: contacto@pablocabello.com  
Colegiado en Granada desde 2013