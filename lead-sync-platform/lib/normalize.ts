// Normaliza string: remove acento, espaços e deixa minúsculo
export function normalizeKey(value: string): string {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // remove acentos
    .replace(/\s+/g, "") // remove espaços
    .trim();
}

// Mapeamento inteligente
export function mapColumn(key: string): string | null {
  const k = normalizeKey(key);

  if (["nome", "name", "cliente", "contato"].includes(k)) return "nome";

  if (["telefone", "celular", "whatsapp", "fone", "phone"].includes(k))
    return "telefone";

  if (["empresa", "company", "organizacao"].includes(k))
    return "empresa";

  if (["cidade", "city"].includes(k)) return "cidade";

  if (["status", "etapa"].includes(k)) return "status";

  if (["observacao", "obs", "nota", "comentario"].includes(k))
    return "observacao";

  return null;
}
