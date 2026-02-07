# Dockerfile para WhatsApp Notifications
FROM node:18-slim

# Instalar dependencias del sistema y Chromium
RUN apt-get update && apt-get install -y \
    wget \
    gnupg \
    ca-certificates \
    fonts-liberation \
    libasound2 \
    libatk-bridge2.0-0 \
    libatk1.0-0 \
    libatspi2.0-0 \
    libcups2 \
    libdbus-1-3 \
    libdrm2 \
    libgbm1 \
    libgtk-3-0 \
    libnspr4 \
    libnss3 \
    libwayland-client0 \
    libxcomposite1 \
    libxdamage1 \
    libxfixes3 \
    libxkbcommon0 \
    libxrandr2 \
    xdg-utils \
    chromium \
    --no-install-recommends \
    && rm -rf /var/lib/apt/lists/*

# Variables de entorno para Puppeteer
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true
ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium
ENV CHROME_BIN=/usr/bin/chromium

# Crear directorio de trabajo
WORKDIR /app

# Copiar archivos de dependencias
COPY package*.json ./

# Instalar dependencias de Node
RUN npm install --production

# Copiar el resto de los archivos
COPY . .

# Crear directorio para sesión de WhatsApp
RUN mkdir -p whatsapp-session

# Exponer puerto
EXPOSE 3000

# Usuario no root para seguridad
RUN groupadd -r whatsapp && useradd -r -g whatsapp -G audio,video whatsapp \
    && mkdir -p /home/whatsapp/Downloads \
    && chown -R whatsapp:whatsapp /app \
    && chown -R whatsapp:whatsapp /home/whatsapp

USER whatsapp

# Comando para iniciar
CMD ["node", "whatsapp-server.js"]
