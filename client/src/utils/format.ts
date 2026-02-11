export const maskPhone = (value: string) => {
    if (!value) return "";

    // Remove tudo que não for dígito
    const digits = value.replace(/\D/g, "");

    // Limita a 11 dígitos (formato celular brasileiro)
    const limited = digits.substring(0, 11);

    // Aplica a máscara (XX) XXXXX-XXXX ou (XX) XXXX-XXXX
    if (limited.length <= 2) {
        return limited.replace(/^(\d{0,2})/, "($1");
    } else if (limited.length <= 6) {
        return limited.replace(/^(\d{2})(\d{0,4})/, "($1) $2");
    } else if (limited.length <= 10) {
        return limited.replace(/^(\d{2})(\d{4})(\d{0,4})/, "($1) $2-$3");
    } else {
        return limited.replace(/^(\d{2})(\d{5})(\d{4})/, "($1) $2-$3");
    }
};
