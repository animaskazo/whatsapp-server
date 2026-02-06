const express = require('express');
const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const bodyParser = require('body-parser');

const app = express();
app.use(bodyParser.json());

// Cliente de WhatsApp
let whatsappClient;
let isReady = false;

// Inicializar cliente de WhatsApp
const initWhatsApp = () => {
    whatsappClient = new Client({
        authStrategy: new LocalAuth({
            dataPath: './whatsapp-session'
        }),
        puppeteer: {
            headless: true,
            args: ['--no-sandbox', '--disable-setuid-sandbox']
        }
    });

    // Generar QR para autenticación
    whatsappClient.on('qr', (qr) => {
        console.log('📱 Escanea este código QR con WhatsApp:');
        qrcode.generate(qr, { small: true });
        console.log('\nO abre este link en tu navegador para ver el QR más grande:');
        console.log('http://localhost:3000/qr');
    });

    // Cliente listo
    whatsappClient.on('ready', () => {
        console.log('✅ WhatsApp está listo para enviar mensajes');
        isReady = true;
    });

    // Manejo de autenticación
    whatsappClient.on('authenticated', () => {
        console.log('🔐 Autenticado correctamente');
    });

    // Manejo de errores
    whatsappClient.on('auth_failure', (msg) => {
        console.error('❌ Error de autenticación:', msg);
    });

    whatsappClient.on('disconnected', (reason) => {
        console.log('⚠️ Cliente desconectado:', reason);
        isReady = false;
    });

    whatsappClient.initialize();
};

// ENDPOINTS API

// Verificar estado
app.get('/status', (req, res) => {
    res.json({
        status: isReady ? 'ready' : 'not_ready',
        message: isReady ? 'WhatsApp está conectado' : 'WhatsApp no está conectado. Escanea el QR.'
    });
});

// Enviar mensaje individual
app.post('/send-message', async (req, res) => {
    const { phone, message } = req.body;

    if (!isReady) {
        return res.status(503).json({
            success: false,
            error: 'WhatsApp no está conectado. Por favor escanea el QR primero.'
        });
    }

    if (!phone || !message) {
        return res.status(400).json({
            success: false,
            error: 'Se requieren los campos "phone" y "message"'
        });
    }

    try {
        // Formato del número: código de país + número sin espacios ni caracteres especiales
        // Ejemplo: 56912345678 para Chile
        const chatId = phone.includes('@c.us') ? phone : `${phone}@c.us`;
        
        await whatsappClient.sendMessage(chatId, message);
        
        res.json({
            success: true,
            message: 'Mensaje enviado correctamente',
            to: phone
        });
    } catch (error) {
        console.error('Error al enviar mensaje:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// Enviar mensaje a múltiples números
app.post('/send-bulk', async (req, res) => {
    const { phones, message } = req.body;

    if (!isReady) {
        return res.status(503).json({
            success: false,
            error: 'WhatsApp no está conectado'
        });
    }

    if (!phones || !Array.isArray(phones) || !message) {
        return res.status(400).json({
            success: false,
            error: 'Se requiere un array de "phones" y un "message"'
        });
    }

    const results = [];

    for (const phone of phones) {
        try {
            const chatId = phone.includes('@c.us') ? phone : `${phone}@c.us`;
            await whatsappClient.sendMessage(chatId, message);
            results.push({ phone, success: true });
            
            // Pequeña pausa entre mensajes para evitar bloqueos
            await new Promise(resolve => setTimeout(resolve, 2000));
        } catch (error) {
            results.push({ phone, success: false, error: error.message });
        }
    }

    res.json({
        success: true,
        results
    });
});

// Enviar notificación con plantilla personalizada
app.post('/send-notification', async (req, res) => {
    const { phone, type, data } = req.body;

    if (!isReady) {
        return res.status(503).json({
            success: false,
            error: 'WhatsApp no está conectado'
        });
    }

    // Plantillas de notificaciones
    const templates = {
        'new_order': (data) => `🛍️ *Nueva Orden Recibida*\n\n` +
            `Orden #${data.orderId}\n` +
            `Cliente: ${data.customerName}\n` +
            `Total: $${data.total}\n` +
            `Fecha: ${data.date}\n\n` +
            `¡Revisa los detalles en tu panel!`,
        
        'payment_received': (data) => `💰 *Pago Recibido*\n\n` +
            `Se ha confirmado el pago de $${data.amount}\n` +
            `Método: ${data.method}\n` +
            `Transacción: ${data.transactionId}\n\n` +
            `¡Gracias por tu compra!`,
        
        'status_update': (data) => `📦 *Actualización de Estado*\n\n` +
            `Tu pedido #${data.orderId} ha cambiado a:\n` +
            `Estado: *${data.status}*\n\n` +
            `${data.message || ''}`,
        
        'reminder': (data) => `⏰ *Recordatorio*\n\n` +
            `${data.title}\n` +
            `${data.description}\n` +
            `Fecha: ${data.date}`,

        'alert': (data) => `🚨 *Alerta del Sistema*\n\n` +
            `${data.message}\n` +
            `Nivel: ${data.severity}\n` +
            `Hora: ${new Date().toLocaleString()}`
    };

    try {
        const message = templates[type] 
            ? templates[type](data) 
            : data.customMessage || 'Notificación sin formato';

        const chatId = phone.includes('@c.us') ? phone : `${phone}@c.us`;
        await whatsappClient.sendMessage(chatId, message);

        res.json({
            success: true,
            message: 'Notificación enviada',
            type,
            to: phone
        });
    } catch (error) {
        console.error('Error al enviar notificación:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// Página simple para mostrar QR
app.get('/qr', (req, res) => {
    if (isReady) {
        res.send('<h1>✅ WhatsApp ya está conectado</h1>');
    } else {
        res.send('<h1>⏳ Esperando escaneo de QR...</h1><p>Revisa la consola del servidor</p>');
    }
});

// Iniciar servidor
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`\n🚀 Servidor iniciado en http://localhost:${PORT}`);
    console.log(`📊 Estado: http://localhost:${PORT}/status`);
    console.log(`\n⚡ Inicializando WhatsApp...\n`);
    initWhatsApp();
});
