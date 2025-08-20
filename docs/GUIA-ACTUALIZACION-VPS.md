# 🚀 Guía de Actualización del Proyecto Pablo Cabello en VPS

Esta guía documenta el proceso completo para actualizar el proyecto Pablo Cabello en el VPS de Hostinger con los últimos cambios del repositorio GitHub.

## 📋 Requisitos Previos

- Acceso SSH al VPS (31.97.36.248)
- Clave SSH configurada
- Docker y Docker Compose instalados en el VPS
- Repositorio Git configurado en el VPS
- **Repositorio local con ramas `development` y `main` configuradas**
- **Cambios probados y commitados en rama `development`**

## 🔧 Proceso de Actualización Paso a Paso

### 1. Actualización del Repositorio Local (Desarrollo)

Antes de actualizar el VPS, asegúrate de que tu código esté en la rama `main`:

```bash
# Verificar rama actual
git branch

# Cambiar a rama development si no estás en ella
git checkout development

# Actualizar development con últimos cambios
git pull origin development

# Verificar que todos los cambios están commitados
git status
```

### 2. Merge de Development a Main

Una vez que development está listo, hacer merge a main:

```bash
# Cambiar a rama main
git checkout main

# Actualizar main con últimos cambios remotos
git pull origin main

# Hacer merge de development a main
git merge development

# Subir los cambios a main remoto
git push origin main
```

**⚠️ Importante:** Solo hacer push a main cuando estés seguro de que los cambios están probados.

### 3. Verificación del Estado Actual del VPS

Ahora verificamos dónde está ubicado el repositorio en el VPS y su estado actual:

```bash
# Buscar el directorio del proyecto
ssh root@31.97.36.248 "find /opt -name '*pablo*' -type d 2>/dev/null"
```

**Resultado esperado:** `/opt/pablo-cabello`

```bash
# Verificar el estado del repositorio Git
ssh root@31.97.36.248 "cd /opt/pablo-cabello && pwd && git status && git branch"
```

**Salida típica:**
```
/opt/pablo-cabello
On branch main
Your branch is up to date with 'origin/main'.
nothing to commit, working tree clean
* main
```

### 4. Actualización del Repositorio en VPS desde GitHub

Obtenemos los últimos cambios del repositorio remoto:

```bash
# Fetch de los cambios remotos
ssh root@31.97.36.248 "cd /opt/pablo-cabello && git fetch origin && git status"
```

**Salida esperada cuando hay cambios:**
```
From https://github.com/CabhuDev/landingPabloCabello
   1f0b0cc..05ade1b  main        -> origin/main
   5b3c89a..05ade1b  development -> origin/development
On branch main
Your branch is behind 'origin/main' by X commit(s), and can be fast-forwarded.
```

```bash
# Aplicar los cambios
ssh root@31.97.36.248 "cd /opt/pablo-cabello && git pull origin main"
```

**Resultado típico:**
```
From https://github.com/CabhuDev/landingPabloCabello
 * branch            main       -> FETCH_HEAD
Updating 1f0b0cc..05ade1b
Fast-forward
 frontend/sw.js | 215 +++++++++++++++++++++++----------------------------------      
 1 file changed, 86 insertions(+), 129 deletions(-)
```

### 5. Verificación de Archivos Críticos Actualizados

Verificamos que el Service Worker se actualizó correctamente:

```bash
# Verificar la versión del Service Worker
ssh root@31.97.36.248 "cd /opt/pablo-cabello && head -20 frontend/sw.js"
```

**Buscar en la salida:**
- Versión actual (ej: `v1.3.0`)
- Estrategia de caché implementada
- Nombre de la caché actualizado

### 6. Verificación del Estado de Docker

Comprobamos el estado actual de los contenedores:

```bash
# Ver estado de contenedores
ssh root@31.97.36.248 "cd /opt/pablo-cabello && docker-compose ps"
```

**Estados posibles:**
- `Up (healthy)` ✅ - Funcionando correctamente
- `Up (unhealthy)` ⚠️ - Necesita reconstrucción
- `Exit` ❌ - Contenedor parado

### 7. Reconstrucción de Contenedores (Si es necesario)

Si el contenedor está `unhealthy` o necesita actualizarse:

```bash
# Detener contenedores actuales
ssh root@31.97.36.248 "cd /opt/pablo-cabello && docker-compose down"
```

```bash
# Reconstruir imagen sin caché (fuerza actualización completa)
ssh root@31.97.36.248 "cd /opt/pablo-cabello && docker-compose build --no-cache"
```

**⏱️ Tiempo estimado:** 2-5 minutos dependiendo de la conexión

```bash
# Levantar contenedores con nueva imagen
ssh root@31.97.36.248 "cd /opt/pablo-cabello && docker-compose up -d"
```

### 8. Verificación del Funcionamiento

Esperamos a que los contenedores arranquen y verificamos su estado:

```bash
# Verificar estado después del arranque
ssh root@31.97.36.248 "sleep 10 && cd /opt/pablo-cabello && docker-compose ps"
```

```bash
# Revisar logs para asegurar funcionamiento correcto
ssh root@31.97.36.248 "cd /opt/pablo-cabello && docker-compose logs --tail=20"
```

**Logs esperados:**
```
✓ Verificaciones completadas
Entorno: production
✓ Service Worker disponible
✓ success: fastapi entered RUNNING state
✓ success: nginx entered RUNNING state
```

### 9. Validación de Service Worker Actualizado

Verificamos que el Service Worker actualizado esté siendo servido:

```bash
# Verificar Service Worker desde el servidor local
ssh root@31.97.36.248 "curl -s http://localhost:8080/sw.js | head -15"
```

**Buscar:**
- Versión correcta en el comentario (ej: `v1.3.0`)
- `CACHE_NAME` actualizado
- Estrategia de caché correcta

### 10. Verificación del Contenido Principal

Confirmamos que el contenido de la página principal está actualizado:

```bash
# Verificar contenido del H1 principal
ssh root@31.97.36.248 "curl -s http://localhost:8080/ | grep -A 5 -B 5 'h1'"
```

**Contenido esperado:**
```html
<h1>Garantizo <span class="highlight">entregas puntuales</span> con metodología probada y documentación completa en retail</h1>
```

### 11. Prueba Final desde Dominio Público

Verificamos que los cambios están disponibles públicamente:

```bash
# Verificar Service Worker público (desde local)
curl -s "https://pablocabello.com/sw.js" | Select-Object -First 5
```

**Salida esperada:**
```javascript
/**
 * Service Worker para Pablo Cabello - v1.3.0 - Estrategia Híbrida
 *
 * ESTRATEGIA DE CACHÉ:
 * - HTML (Navegación): Network-First. Prioriza el contenido fresco del servidor.
```

## ✅ Checklist de Verificación Final

Marca cada elemento una vez completado:

- [ ] ✅ Cambios commitados en rama development
- [ ] ✅ Merge de development a main completado
- [ ] ✅ Push a main remoto realizado
- [ ] ✅ Repositorio actualizado con `git pull`
- [ ] ✅ Service Worker versión correcta verificada
- [ ] ✅ Contenedores Docker reconstruidos
- [ ] ✅ Servicios FastAPI y Nginx funcionando
- [ ] ✅ Health checks pasando
- [ ] ✅ Service Worker público accesible
- [ ] ✅ Contenido HTML correcto servido
- [ ] ✅ Sin errores en logs de Docker

## 🚨 Resolución de Problemas Comunes

### Problema: Contenedor `unhealthy`
```bash
# Ver logs detallados
ssh root@31.97.36.248 "cd /opt/pablo-cabello && docker-compose logs"

# Reiniciar contenedores
ssh root@31.97.36.248 "cd /opt/pablo-cabello && docker-compose restart"
```

### Problema: Service Worker no actualiza
```bash
# Verificar que el archivo se actualizó en el sistema
ssh root@31.97.36.248 "cd /opt/pablo-cabello && ls -la frontend/sw.js"

# Forzar reconstrucción completa
ssh root@31.97.36.248 "cd /opt/pablo-cabello && docker-compose down && docker system prune -f && docker-compose build --no-cache && docker-compose up -d"
```

### Problema: Conflictos en merge development → main
```bash
# Si hay conflictos durante el merge
git status  # Ver archivos en conflicto

# Resolver conflictos manualmente en VS Code, luego:
git add .
git commit -m "Resolve merge conflicts"
git push origin main
```

### Problema: Necesitas deshacer el merge
```bash
# Si el merge salió mal y quieres deshacerlo
git checkout main
git reset --hard HEAD~1  # Deshace el último commit (el merge)

# O si ya hiciste push:
git revert -m 1 HEAD  # Revierte el merge manteniendo historial
```
### Problema: Git pull falla en VPS
```bash
# Verificar estado de Git
ssh root@31.97.36.248 "cd /opt/pablo-cabello && git status"

# Si hay cambios locales, resetear
ssh root@31.97.36.248 "cd /opt/pablo-cabello && git reset --hard HEAD && git pull origin main"
```

## 📊 Tiempos Estimados

| Paso | Tiempo Estimado |
|------|----------------|
| Merge development → main | 1-2 minutos |
| Verificación inicial VPS | 1-2 minutos |
| Actualización Git en VPS | 30 segundos |
| Reconstrucción Docker | 2-5 minutos |
| Verificación final | 1-2 minutos |
| **Total** | **6-12 minutos** |

## 🎯 Resultado Esperado

Una vez completado el proceso:

- **Service Worker v1.3.0** con estrategia híbrida funcionando
- **Network-First** para HTML → Usuarios ven contenido más reciente
- **Cache-First** para assets → Máxima velocidad de carga
- **Contenedores Docker** funcionando correctamente
- **Problema de caché atrapada** resuelto definitivamente

## 📝 Notas Importantes

1. **Backup automático:** Los contenedores Docker mantienen persistencia de datos
2. **Downtime mínimo:** El proceso típicamente requiere menos de 30 segundos de downtime
3. **Rollback:** Si algo falla, usar `git reset --hard <commit-anterior>` y reconstruir
4. **Monitoreo:** Verificar logs periódicamente después de la actualización

---

**Última actualización:** 20 de agosto de 2025  
**Versión de la guía:** 1.0  
**Proyecto:** Pablo Cabello - Landing Page  
**VPS:** Hostinger (31.97.36.248)
