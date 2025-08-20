# 🚀 Deployment Pablo Cabello en VPS Hostinger

**VPS:** 31.97.36.248 (Hostinger)  
**Estado:** Nginx + SSL ya configurados ✅  
**Objetivo:** Deploy simple junto con Obratec  
**Stack:** Docker + Nginx + FastAPI

---

## ✅ **Estado actual - TODO PREPARADO**

- **Dominio**: `pablocabello.com` configurado ✅
- **SSL**: Let's Encrypt activo ✅  
- **Nginx**: Proxy a puerto 8080 configurado ✅
- **Puertos**: Sin conflictos (Obratec=3000, Pablo=8080) ✅

## 🚀 **Deployment en 3 pasos**

### **1. Subir código al VPS:**
```bash
# Conectar
ssh root@31.97.36.248

# Crear directorio
mkdir -p /opt/pablo-cabello && cd /opt/pablo-cabello

# Opción A: Git
git clone https://github.com/CabhuDev/landingPabloCabello.git .

# Opción B: SCP desde tu PC
# scp -r "C:\Users\Pablo\Desktop\WebPabloAparejador\*" root@31.97.36.248:/opt/pablo-cabello/
```

### **2. Configurar variables de entorno:**
```bash
# Crear .env para producción
cat > backend/.env << 'EOF'
# Pablo Cabello - Producción VPS
GMAIL_USER=pablo.cabello.hurtado@gmail.com
GMAIL_APP_PASSWORD=tu-app-password-real
YOUR_EMAIL=pablo.cabello.hurtado@gmail.com

EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
ENV=production
DEBUG=false
DATABASE_URL=sqlite:///./app.db
EOF

chmod 600 backend/.env 
```

### **3. Deploy con Docker:**
```bash
# Construir y ejecutar
docker-compose up --build -d

# Verificar estado
docker-compose ps
docker-compose logs --tail=20

# Test final
curl -I http://127.0.0.1:8080/health
```

## ✅ **¡Listo!**

**URL en vivo:** https://pablocabello.com  
**Health check:** https://pablocabello.com/health

---

## 📊 **Monitoreo y mantenimiento**

### **Comandos útiles:**
```bash
# Ver logs
docker-compose logs -f pablo-cabello-web

# Reiniciar si necesario
docker-compose restart

# Actualizar código
git pull && docker-compose up --build -d

# Ver estado completo del VPS
docker ps
systemctl status nginx
```

### **Estado final - Servicios en VPS:**
| Puerto | Proyecto | URL |
|--------|----------|-----|
| 3000 | Obratec | https://obratec.app |
| 8080 | Pablo Cabello | https://pablocabello.com ✅ |
| 5678 | N8N | https://n8n.obratec.app |

**✅ Ambos proyectos funcionando sin conflictos en el mismo VPS.**