// cleanup-session.js
// Script para limpiar archivos de bloqueo de Chromium

const fs = require('fs');
const path = require('path');

function cleanupSession() {
    const sessionPath = './whatsapp-session';
    
    console.log('🧹 Limpiando archivos de bloqueo de sesión...');
    
    try {
        // Archivos de bloqueo que causan problemas
        const lockFiles = [
            path.join(sessionPath, 'SingletonLock'),
            path.join(sessionPath, 'SingletonSocket'),
            path.join(sessionPath, 'SingletonCookie')
        ];
        
        lockFiles.forEach(file => {
            if (fs.existsSync(file)) {
                try {
                    fs.unlinkSync(file);
                    console.log(`✅ Eliminado: ${file}`);
                } catch (err) {
                    console.log(`⚠️ No se pudo eliminar ${file}:`, err.message);
                }
            }
        });
        
        // Buscar y eliminar cualquier archivo Singleton* en subdirectorios
        if (fs.existsSync(sessionPath)) {
            const cleanDirectory = (dir) => {
                const files = fs.readdirSync(dir, { withFileTypes: true });
                
                files.forEach(file => {
                    const fullPath = path.join(dir, file.name);
                    
                    if (file.isDirectory()) {
                        cleanDirectory(fullPath);
                    } else if (file.name.startsWith('Singleton')) {
                        try {
                            fs.unlinkSync(fullPath);
                            console.log(`✅ Eliminado: ${fullPath}`);
                        } catch (err) {
                            console.log(`⚠️ No se pudo eliminar ${fullPath}`);
                        }
                    }
                });
            };
            
            cleanDirectory(sessionPath);
        }
        
        console.log('✅ Limpieza de sesión completada');
        
    } catch (error) {
        console.log('⚠️ Error durante la limpieza:', error.message);
    }
}

// Ejecutar limpieza
cleanupSession();

module.exports = cleanupSession;
