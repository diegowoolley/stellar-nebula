import { supabase } from '../db.js';
import bcrypt from 'bcrypt';

async function resetAdminPassword() {
    const email = 'diegowoolley@gmail.com';
    const newPassword = 'Nsx-sz21';

    try {
        const hashedPassword = await bcrypt.hash(newPassword, 10);
        const { error } = await supabase
            .from('users')
            .update({ password: hashedPassword })
            .eq('email', email);

        if (error) throw error;

        console.log(`✅ Senha do admin (${email}) resetada com sucesso para: ${newPassword}`);
    } catch (error: any) {
        console.error('Erro ao resetar senha:', error.message);
    }
}

resetAdminPassword();
