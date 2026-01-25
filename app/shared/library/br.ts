/**
 * Utilitários BR: CPF, CNPJ e telefone.
 * Padrão: sempre normalizar para dígitos (sem máscara) e validar dígitos verificadores quando aplicável.
 */

export function onlyDigits(value: string): string {
  return (value || '').replace(/\D/g, '');
}

export function maskDigits(digits: string, pattern: string): string {
  const clean = onlyDigits(digits);
  let out = '';
  let di = 0;
  for (let pi = 0; pi < pattern.length; pi++) {
    const p = pattern[pi];
    if (p === '0') {
      if (di >= clean.length) break;
      out += clean[di++];
    } else {
      if (di >= clean.length) break;
      out += p;
    }
  }
  return out;
}

export function formatCPF(value: string): string {
  return maskDigits(onlyDigits(value).slice(0, 11), '000.000.000-00');
}

export function formatCNPJ(value: string): string {
  return maskDigits(onlyDigits(value).slice(0, 14), '00.000.000/0000-00');
}

export function normalizeCpf(value: string): string {
  return onlyDigits(value).slice(0, 11);
}

export function normalizeCnpj(value: string): string {
  return onlyDigits(value).slice(0, 14);
}

export function isValidCPF(value: string): boolean {
  const cpf = normalizeCpf(value);
  if (cpf.length !== 11) return false;
  if (/^(\d)\1+$/.test(cpf)) return false;

  const calcDv = (base: string, factor: number) => {
    let sum = 0;
    for (let i = 0; i < base.length; i++) {
      sum += Number(base[i]) * (factor - i);
    }
    const mod = (sum * 10) % 11;
    return mod === 10 ? 0 : mod;
  };

  const dv1 = calcDv(cpf.slice(0, 9), 10);
  const dv2 = calcDv(cpf.slice(0, 10), 11);
  return dv1 === Number(cpf[9]) && dv2 === Number(cpf[10]);
}

export function isValidCNPJ(value: string): boolean {
  const cnpj = normalizeCnpj(value);
  if (cnpj.length !== 14) return false;
  if (/^(\d)\1+$/.test(cnpj)) return false;

  const calcDv = (base: string, weights: number[]) => {
    let sum = 0;
    for (let i = 0; i < base.length; i++) {
      sum += Number(base[i]) * weights[i];
    }
    const mod = sum % 11;
    return mod < 2 ? 0 : 11 - mod;
  };

  const weights1 = [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
  const weights2 = [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
  const dv1 = calcDv(cnpj.slice(0, 12), weights1);
  const dv2 = calcDv(cnpj.slice(0, 13), weights2);

  return dv1 === Number(cnpj[12]) && dv2 === Number(cnpj[13]);
}

/**
 * Telefone BR:
 * - Aceita entrada com ou sem +55
 * - Normaliza para DDD+Número (10 ou 11 dígitos), sem máscara.
 */
export function normalizeBRPhone(value: string): string {
  let digits = onlyDigits(value);
  // aceitar E.164 +55...
  if (digits.startsWith('55') && (digits.length === 12 || digits.length === 13)) {
    digits = digits.slice(2);
  }
  // limita ao tamanho máximo BR (DDD + 9 dígitos)
  return digits.slice(0, 11);
}

export function isValidBRPhone(value: string): boolean {
  const digits = normalizeBRPhone(value);
  return digits.length === 10 || digits.length === 11;
}

export function formatBRPhone(value: string): string {
  const digits = normalizeBRPhone(value);
  if (digits.length <= 2) return digits;
  const ddd = digits.slice(0, 2);
  const rest = digits.slice(2);
  if (rest.length <= 4) return `(${ddd}) ${rest}`;
  if (rest.length <= 8) return `(${ddd}) ${rest.slice(0, 4)}-${rest.slice(4)}`;
  // 9 dígitos
  return `(${ddd}) ${rest.slice(0, 5)}-${rest.slice(5, 9)}`;
}


