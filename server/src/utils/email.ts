import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: process.env.SMTP_SECURE === 'true', // true for 465, false for other ports
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS?.replace(/\s+/g, ''), // Remove espaços caso o usuário tenha copiado do Google assim
    },
    family: 4, // Força o uso de IPv4 para evitar erros de ENETUNREACH (IPv6) no Render
});

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
