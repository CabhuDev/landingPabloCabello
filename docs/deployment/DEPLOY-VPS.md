# 🚀 Despliegue en VPS - Pablo Cabello Aparejador

**VPS Target:** 31.97.36.248  
**Proyecto:** WebPabloAparejador  
**Stack:** Docker + Docker Compose + Nginx + FastAPI

---

## 📋 **Pre-requisitos**

### **En tu PC local:**
- [x] Contenedor Docker funcionando localmente
- [ ] Código subido a Git repository
- [ ] Acceso SSH al VPS

### **En el VPS:**
- [ ] Docker y Docker Compose instalados
- [ ] Firewall configurado (puertos 80, 443, 22)
- [ ] Directorio `/opt/pablo-cabello` creado

---

## 🔧 **Paso 1: Configuración inicial del VPS**

### **Conectar al VPS:**
```bash
ssh root@31.97.36.248
```

### **Ejecutar script de configuración:**
```bash
# Opción A: Script automático (recomendado)
curl -fsSL https://raw.githubusercontent.com/tu-repo/WebPabloAparejador/main/vps-setup.sh | bash

# Opción B: Manual
apt-get update && apt-get upgrade -y
apt-get install -y curl wget git ufw htop

# Instalar Docker
curl -fsSL https://get.docker.com -o get-docker.sh && sh get-docker.sh

# Instalar Docker Compose
curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
chmod +x /usr/local/bin/docker-compose

# Configurar firewall
ufw --force reset
ufw default deny incoming
ufw default allow outgoing
ufw allow ssh
ufw allow 80/tcp
ufw allow 443/tcp
ufw --force enable
```

### **Verificar instalación:**
```bash
docker --version
docker-compose --version
ufw status
```

---

## 📦 **Paso 2: Subir código al VPS**

### **Opción A: Git (Recomendado)**
```bash
# En el VPS
cd /opt
mkdir -p pablo-cabello
cd pablo-cabello

# Clonar repositorio
git clone https://github.com/tu-usuario/WebPabloAparejador.git .

# O si ya existe, actualizar
git pull origin main
```

### **Opción B: SCP directo**
```bash
# Desde tu PC local (PowerShell/CMD)
scp -r "C:\Users\Pablo\Desktop\WebPabloAparejador\*" root@31.97.36.248:/opt/pablo-cabello/
```

---

## ⚙️ **Paso 3: Configurar variables de entorno**

En el VPS, crear archivo de producción:

```bash
cd /opt/pablo-cabello

cat > .env << 'EOF'
# ================================
# PABLO CABELLO - PRODUCCIÓN
# ================================

# Entorno
ENV=production
DEBUG=false

# Dominio/IP
DOMAIN=31.97.36.248
# Cambiar cuando tengas dominio:
# DOMAIN=pablocabello.com

# Base de datos
DATABASE_URL=sqlite:///./data/app.db
# Para PostgreSQL futuro:
# DATABASE_URL=postgresql://pablouser:SECURE_PASSWORD@db:5432/pablo_cabello

# Email para formulario de contacto
CONTACT_EMAIL=contacto@pablocabello.com
SMTP_SERVER=smtp.gmail.com
SMTP_PORT=587
EMAIL_USER=tu-email@gmail.com
EMAIL_PASSWORD=tu-app-password-de-gmail

# Seguridad
SECRET_KEY=$(openssl rand -base64 32)

# Logs
LOG_LEVEL=INFO
LOG_FILE=/app/logs/application.log

# Analytics (opcional)
GA_TRACKING_ID=G-XXXXXXXXXX
HOTJAR_ID=YOUR_HOTJAR_ID
EOF
```

### **Configurar permisos:**
```bash
chmod 600 .env
chown root:root .env
```

---

## 🐳 **Paso 4: Desplegar con Docker**

### **Opción A: Script automático**
```bash
cd /opt/pablo-cabello

# Marcar como servidor de producción
export PABLO_PRODUCTION_SERVER=true

# Ejecutar despliegue
./docker/deploy.sh
```

### **Opción B: Manual**
```bash
cd /opt/pablo-cabello

# Construir y ejecutar
docker-compose down --remove-orphans
docker-compose up --build -d

# Verificar
docker-compose ps
```

---

## 🔍 **Paso 5: Verificación del despliegue**

### **Verificar contenedores:**
```bash
docker-compose ps
# Debe mostrar: pablo-cabello-web Up

docker-compose logs --tail=50
# Verificar que no hay errores
```

### **Probar conectividad:**
```bash
# Desde el VPS
curl -I http://localhost
curl -I http://localhost/api/
curl -I http://localhost/health

# Desde tu PC
curl -I http://31.97.36.248
curl -I http://31.97.36.248/api/
```

### **Verificar puertos:**
```bash
netstat -tlnp | grep :80
netstat -tlnp | grep :443
```

---

## 🌐 **Paso 6: URLs de acceso**

Una vez desplegado, tu aplicación estará disponible en:

- **🏠 Frontend:** http://31.97.36.248
- **⚡ API Backend:** http://31.97.36.248/api/
- **📚 Documentación API:** http://31.97.36.248/docs
- **💚 Health Check:** http://31.97.36.248/health

---

## 📊 **Paso 7: Monitoreo y logs**

### **Ver logs en tiempo real:**
```bash
cd /opt/pablo-cabello

# Todos los servicios
docker-compose logs -f

# Solo aplicación web
docker-compose logs -f web

# Solo los últimos 100 registros
docker-compose logs --tail=100 web
```

### **Ver estado de recursos:**
```bash
# Uso de CPU/RAM por contenedor
docker stats

# Espacio en disco
df -h
du -sh /opt/pablo-cabello/
```

### **Logs del sistema:**
```bash
# Logs de nginx
tail -f /opt/pablo-cabello/logs/nginx_access.log
tail -f /opt/pablo-cabello/logs/nginx_error.log

# Logs de FastAPI
tail -f /opt/pablo-cabello/logs/fastapi.log
```

---

## 🔄 **Comandos útiles de mantenimiento**

### **Actualizar aplicación:**
```bash
cd /opt/pablo-cabello
git pull origin main
docker-compose up --build -d
```

### **Reiniciar servicios:**
```bash
# Reiniciar todo
docker-compose restart

# Reiniciar solo web
docker-compose restart web
```

### **Backup:**
```bash
# Backup manual
tar -czf /opt/pablo-cabello/backups/backup-$(date +%Y%m%d_%H%M%S).tar.gz \
  /opt/pablo-cabello/data \
  /opt/pablo-cabello/logs \
  /opt/pablo-cabello/.env
```

### **Limpiar Docker:**
```bash
# Limpiar imágenes no utilizadas
docker image prune -a

# Limpiar todo el sistema (¡cuidado!)
docker system prune -a --volumes
```

---

## 🔒 **Paso 8: Configuración HTTPS (Opcional)**

### **Con dominio personalizado:**
```bash
# Instalar Certbot
apt-get install certbot

# Generar certificados SSL
certbot certonly --standalone \
  -d tu-dominio.com \
  -d www.tu-dominio.com

# Los certificados se guardan en:
# /etc/letsencrypt/live/tu-dominio.com/
```

### **Configurar renovación automática:**
```bash
# Añadir a crontab
crontab -e

# Añadir esta línea:
0 3 * * * certbot renew --quiet --post-hook "docker-compose -f /opt/pablo-cabello/docker-compose.yml restart web"
```

---

## 🚨 **Troubleshooting**

### **Contenedor no inicia:**
```bash
docker-compose logs web
docker-compose ps
docker inspect pablo-cabello-web
```

### **No se puede acceder por IP:**
```bash
# Verificar firewall
ufw status verbose

# Verificar puertos
netstat -tlnp | grep :80

# Verificar nginx
docker-compose exec web nginx -t
```

### **Problemas de permisos:**
```bash
# Arreglar permisos de directorios
chown -R root:root /opt/pablo-cabello/
chmod -R 755 /opt/pablo-cabello/
chmod 600 /opt/pablo-cabello/.env
```

### **Problemas de memoria:**
```bash
# Ver uso de memoria
free -h
docker stats

# Si hay problemas, añadir swap
fallocate -l 2G /swapfile
chmod 600 /swapfile
mkswap /swapfile
swapon /swapfile
echo '/swapfile none swap sw 0 0' | tee -a /etc/fstab
```

---

## 📞 **Contacto y soporte**

**Pablo Cabello**  
📧 Email: contacto@pablocabello.com  
📱 Tel: +34-600-518-588  
🌐 Web: http://31.97.36.248 (después del despliegue)

---

## 📝 **Checklist de despliegue**

- [ ] VPS configurado con Docker y firewall
- [ ] Código subido al repositorio Git
- [ ] Variables de entorno configuradas (.env)
- [ ] Aplicación desplegada con docker-compose
- [ ] Verificación de conectividad (HTTP)
- [ ] Logs verificados sin errores
- [ ] URLs funcionales
- [ ] Backup inicial realizado
- [ ] Monitoreo configurado
- [ ] SSL/HTTPS configurado (si aplica)

---

**🎉 Una vez completado este checklist, tu aplicación estará lista en producción!**

**Fecha de creación:** $(date)  
**Última actualización:** [Actualizar cuando hagas cambios]