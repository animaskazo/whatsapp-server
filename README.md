# 📱 Sistema de Notificaciones WhatsApp

Sistema completo para enviar notificaciones por WhatsApp desde tu aplicación web usando Node.js y whatsapp-web.js.

## 🚀 Características

- ✅ Envío de mensajes individuales
- ✅ Envío masivo a múltiples números
- ✅ Plantillas predefinidas de notificaciones
- ✅ API REST fácil de integrar
- ✅ Interfaz web para pruebas
- ✅ Sin costos de API (usa WhatsApp Web)

## 📋 Requisitos Previos

- Node.js 14 o superior
- NPM o Yarn
- Una cuenta de WhatsApp
- Google Chrome o Chromium instalado

## 🔧 Instalación

### 1. Instalar dependencias

```bash
npm install
```

### 2. Iniciar el servidor

```bash
npm start
```

El servidor se iniciará en `http://localhost:3000`

### 3. Autenticar WhatsApp

Cuando inicies el servidor por primera vez, aparecerá un código QR en la consola.

1. Abre WhatsApp en tu teléfono
2. Toca Menú o Configuración → Dispositivos vinculados
3. Toca "Vincular un dispositivo"
4. Escanea el código QR que aparece en la consola

Una vez escaneado, verás el mensaje: ✅ WhatsApp está listo para enviar mensajes

**Nota**: La sesión se guarda localmente, por lo que solo necesitas escanear el QR la primera vez.

## 📡 Endpoints de la API

### 1. Verificar Estado

```http
GET /status
```

**Respuesta:**
```json
{
  "status": "ready",
  "message": "WhatsApp está conectado"
}
```

### 2. Enviar Mensaje Simple

```http
POST /send-message
Content-Type: application/json

{
  "phone": "56912345678",
  "message": "Hola, este es un mensaje de prueba"
}
```

**Respuesta exitosa:**
```json
{
  "success": true,
  "message": "Mensaje enviado correctamente",
  "to": "56912345678"
}
```

### 3. Enviar Mensaje Masivo

```http
POST /send-bulk
Content-Type: application/json

{
  "phones": ["56912345678", "56987654321"],
  "message": "Mensaje para todos"
}
```

### 4. Enviar Notificación con Plantilla

```http
POST /send-notification
Content-Type: application/json

{
  "phone": "56912345678",
  "type": "new_order",
  "data": {
    "orderId": "ORD-12345",
    "customerName": "Juan Pérez",
    "total": "45.990",
    "date": "2024-02-06 10:30"
  }
}
```

## 📝 Tipos de Notificaciones Disponibles

### 1. Nueva Orden (`new_order`)

```javascript
{
  "type": "new_order",
  "data": {
    "orderId": "ORD-12345",
    "customerName": "Juan Pérez",
    "total": "45.990",
    "date": "2024-02-06 10:30"
  }
}
```

### 2. Pago Recibido (`payment_received`)

```javascript
{
  "type": "payment_received",
  "data": {
    "amount": "45.990",
    "method": "Tarjeta de crédito",
    "transactionId": "TRX-98765"
  }
}
```

### 3. Actualización de Estado (`status_update`)

```javascript
{
  "type": "status_update",
  "data": {
    "orderId": "ORD-12345",
    "status": "En camino",
    "message": "Llegará en 2-3 días"
  }
}
```

### 4. Recordatorio (`reminder`)

```javascript
{
  "type": "reminder",
  "data": {
    "title": "Reunión importante",
    "description": "Revisión del proyecto Q1",
    "date": "Mañana a las 10:00"
  }
}
```

### 5. Alerta del Sistema (`alert`)

```javascript
{
  "type": "alert",
  "data": {
    "message": "El servidor está experimentando alta carga",
    "severity": "Alto"
  }
}
```

## 💻 Ejemplos de Integración

### JavaScript/Node.js

```javascript
// Enviar notificación cuando se crea una orden
async function notificarNuevaOrden(orden) {
  const response = await fetch('http://localhost:3000/send-notification', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      phone: orden.clientePhone,
      type: 'new_order',
      data: {
        orderId: orden.id,
        customerName: orden.cliente,
        total: orden.total,
        date: new Date().toLocaleString()
      }
    })
  });
  
  return await response.json();
}
```

### Python

```python
import requests

def enviar_notificacion(phone, tipo, datos):
    url = 'http://localhost:3000/send-notification'
    payload = {
        'phone': phone,
        'type': tipo,
        'data': datos
    }
    
    response = requests.post(url, json=payload)
    return response.json()

# Ejemplo de uso
enviar_notificacion(
    phone='56912345678',
    tipo='payment_received',
    datos={
        'amount': '45.990',
        'method': 'Transferencia',
        'transactionId': 'TRX-12345'
    }
)
```

### PHP

```php
<?php
function enviarNotificacion($phone, $type, $data) {
    $url = 'http://localhost:3000/send-notification';
    
    $payload = json_encode([
        'phone' => $phone,
        'type' => $type,
        'data' => $data
    ]);
    
    $ch = curl_init($url);
    curl_setopt($ch, CURLOPT_POSTFIELDS, $payload);
    curl_setopt($ch, CURLOPT_HTTPHEADER, ['Content-Type:application/json']);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    
    $result = curl_exec($ch);
    curl_close($ch);
    
    return json_decode($result);
}

// Ejemplo de uso
enviarNotificacion(
    '56912345678',
    'new_order',
    [
        'orderId' => 'ORD-12345',
        'customerName' => 'Juan Pérez',
        'total' => '45.990',
        'date' => date('Y-m-d H:i:s')
    ]
);
?>
```

## 🌐 Interfaz Web

Abre `index.html` en tu navegador para acceder a la interfaz de pruebas. Puedes:

- Enviar mensajes simples
- Probar diferentes tipos de notificaciones
- Verificar el estado de la conexión
- Ver ejemplos de código

## 📱 Formato de Números de Teléfono

Los números deben incluir el código de país **sin** el símbolo `+`:

- ✅ Chile: `56912345678`
- ✅ México: `5215512345678`
- ✅ España: `34612345678`
- ✅ Argentina: `5491123456789`
- ❌ Incorrecto: `+56912345678`
- ❌ Incorrecto: `912345678`

## ⚠️ Consideraciones Importantes

### Límites y Restricciones

1. **No es oficial**: Esta solución usa la API no oficial de WhatsApp Web
2. **Riesgo de bloqueo**: WhatsApp puede detectar uso automatizado y bloquear tu número
3. **Pausas recomendadas**: Espera 2-3 segundos entre mensajes masivos
4. **No para producción crítica**: Para aplicaciones serias, considera WhatsApp Business API oficial

### Recomendaciones

- Usa un número secundario para pruebas
- No envíes más de 50 mensajes por hora
- Evita enviar spam o mensajes no solicitados
- Respeta las políticas de WhatsApp

## 🐛 Solución de Problemas

### Error: "WhatsApp no está conectado"

- Verifica que hayas escaneado el QR
- Revisa que WhatsApp esté abierto en tu teléfono
- Reinicia el servidor con `npm start`

### Error: "No se puede conectar al servidor"

- Verifica que el servidor esté corriendo en el puerto 3000
- Comprueba que no haya un firewall bloqueando el puerto
- Verifica la URL: debe ser `http://localhost:3000`

### El QR no aparece

- Elimina la carpeta `whatsapp-session` y reinicia
- Verifica que Chrome/Chromium esté instalado
- Revisa los logs en la consola

### Mensajes no se envían

- Verifica el formato del número (con código de país)
- Asegúrate de que el contacto esté en WhatsApp
- Revisa que no estés bloqueado

## 📚 Recursos Adicionales

- [Documentación whatsapp-web.js](https://github.com/pedroslopez/whatsapp-web.js)
- [WhatsApp Business API oficial](https://business.whatsapp.com)
- [Express.js](https://expressjs.com)

## 🔒 Seguridad

Para usar en producción:

1. Agrega autenticación a los endpoints (JWT, API Keys)
2. Implementa rate limiting
3. Usa HTTPS
4. Valida y sanitiza todas las entradas
5. Considera usar WhatsApp Business API oficial

## 📄 Licencia

MIT - Libre para uso personal y comercial

---

¿Necesitas ayuda? Abre un issue o contacta al desarrollador.
