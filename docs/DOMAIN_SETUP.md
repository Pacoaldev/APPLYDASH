# Configuración de Dominio Personalizado

## Configurar ApplyDash en pacoal.dev

### Opción 1: Subdominio (Recomendado)
**URL Final:** `https://applydash.pacoal.dev`

#### Pasos en DigitalOcean:
1. Ve a tu App Platform dashboard
2. Selecciona la app ApplyDash
3. Ve a "Settings" → "Domains"
4. Haz clic en "Add Domain"
5. Ingresa: `applydash.pacoal.dev`
6. Sigue las instrucciones para configurar el DNS

#### Configuración DNS en tu proveedor de dominio:
```
Type: CNAME
Name: applydash
Value: [valor proporcionado por DigitalOcean]
TTL: 3600
```

### Opción 2: Subdirectorio con Proxy Reverso
**URL Final:** `https://www.pacoal.dev/applydash`

Si ya tienes tu portfolio en `pacoal.dev`, puedes configurar un proxy reverso:

#### En tu servidor web (Nginx ejemplo):
```nginx
location /applydash {
    proxy_pass https://your-app-name.ondigitalocean.app;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
}
```

#### En Apache:
```apache
ProxyPass /applydash https://your-app-name.ondigitalocean.app/
ProxyPassReverse /applydash https://your-app-name.ondigitalocean.app/
```

### Variables de Entorno a Actualizar:
```
NEXT_PUBLIC_SITE_URL=https://applydash.pacoal.dev
```

### Verificación:
1. Espera a que se propague el DNS (puede tomar hasta 48 horas)
2. Visita `https://applydash.pacoal.dev`
3. Verifica que el SSL esté funcionando
4. Prueba todas las funcionalidades

### Troubleshooting:
- **DNS no resuelve:** Verifica la configuración DNS
- **SSL no funciona:** DigitalOcean maneja SSL automáticamente, espera unos minutos
- **404 errors:** Verifica que la app esté corriendo correctamente