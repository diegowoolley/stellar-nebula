import jwt from 'jsonwebtoken';
import { supabase } from '../db.js';
export const authenticateUser = async (req, res, next) => {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
        res.status(401).json({ message: 'Autenticação necessária' });
        return;
    }
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        next();
    }
    catch (error) {
        res.status(401).json({ message: 'Token inválido ou expirado' });
    }
};
export const authorizeRole = (roles) => {
    return (req, res, next) => {
        if (!req.user || !roles.includes(req.user.role)) {
            res.status(403).json({ message: 'Acesso negado' });
            return;
        }
        next();
    };
};
//# sourceMappingURL=auth.js.map