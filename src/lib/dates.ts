/** Data de hoje no fuso de Brasília, no formato AAAA-MM-DD (o mesmo das transações). */
export function todayInBrazil(): string {
  // en-CA formata como AAAA-MM-DD.
  return new Intl.DateTimeFormat("en-CA", { timeZone: "America/Sao_Paulo" }).format(new Date());
}
