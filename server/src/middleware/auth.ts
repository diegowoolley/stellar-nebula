import type { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
    console.warn('WARNING: JWT_SECRET is not defined in environment variables.');
}

// Interface estendida para incluir dados do usuário no objeto Request do Express
export interface AuthRequest extends Request {
    user?: any;
}

// Middleware para autenticar o usuário via Token JWT
export const authenticateUser = (req: AuthRequest, res: Response, next: NextFunction) => {
    // Captura o token do cabeçalho de autorização
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ error: 'Acesso negado. Token não fornecido.' });
    }

    try {
        if (!JWT_SECRET) {
            return res.status(500).json({ error: 'JWT_SECRET não configurado no servidor.' });
        }
        // Verifica a validade do token
        const decoded = jwt.verify(token, JWT_SECRET);
        req.user = decoded;
        next();
    } catch (error) {
        return res.status(403).json({ error: 'Token inválido ou expirado.' });
    }
};

// Middleware para autorizar acesso baseado em cargos (roles)
export const authorizeRole = (roles: string[]) => {
    return (req: AuthRequest, res: Response, next: NextFunction) => {
        if (!req.user) {
            return res.status(401).json({ error: 'Usuário não autenticado.' });
        }

        // Verifica se o cargo do usuário está na lista de permissões da rota
        if (!roles.includes(req.user.role)) {
            return res.status(403).json({ error: 'Acesso negado. Permissão insuficiente.' });
        }

        next();
    };
};
