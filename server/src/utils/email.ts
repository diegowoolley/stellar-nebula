import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
import dns from 'dns';

dotenv.config();

// Configuração do Transporter (será inicializado assincronamente)
let transporter: nodemailer.Transporter;

const initTransporter = async () => {
    let host = process.env.SMTP_HOST || 'smtp.gmail.com';
    let tlsConfig = {};

    try {
        // Tenta resolver para IPv4 explicitamente
        // O Render as vezes força IPv6 que falha com timeout
        const addresses = await dns.promises.resolve4(host);
        if (addresses && addresses.length > 0) {
            console.log(`✅ SMTP ${host} resolvido para IPv4: ${addresses[0]}`);
            // Usa o IP direto para garantir IPv4
            host = addresses[0] || host;
            // Necessário para o handshake SSL funcionar quando usamos IP em vez de domínio
            // Garantir que é string para evitar erro de tipo
            const serverName = process.env.SMTP_HOST || 'smtp.gmail.com';
            tlsConfig = { servername: serverName };
        }
    } catch (e) {
        console.warn('⚠️ Falha ao resolver DNS IPv4, usando hostname padrão:', e);
    }

    transporter = nodemailer.createTransport({
        host: host,
        port: parseInt(process.env.SMTP_PORT || '587'),
        secure: process.env.SMTP_SECURE === 'true',
        auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS?.replace(/\s+/g, ''),
        },
        tls: tlsConfig
    });
};

// Inicializa logo no import
await initTransporter();

export const sendEmail = async (to: string, subject: string, html: string) => {
    try {
        const info = await transporter.sendMail({
            from: process.env.SMTP_FROM || '"Stellar Nebula" <noreply@stellarnebula.com>', // sender address
            to, // list of receivers
            subject, // Subject line
            html, // html body
        });

        console.log("Message sent: %s", info.messageId);
        return info;
    } catch (error) {
        console.error("Error sending email: ", error);
        throw error;
    }
};
