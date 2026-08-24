export const appConfig = {
  name: "Econo Mizi",
  shortName: "Econo",
  description: "Gestão financeira pessoal simples e clara.",
  defaultUserName: "",
  currency: "BRL",
  locale: "pt-BR",
  timezone: "America/Sao_Paulo",
} as const;

export type AppConfig = typeof appConfig;
