import type { useTranslations } from "next-intl";

type Translator = ReturnType<typeof useTranslations>;

export type ChatIntent =
  | "greeting"
  | "services"
  | "realEstate"
  | "construction"
  | "relocation"
  | "founder"
  | "contact"
  | "fallback";

// Language-independent contact facts (kept in sync with Footer.tsx / CLAUDE.md).
const PHONE_GERMANY = "+49 152 09333151";
const PHONE_KAZAKHSTAN = "+7 707 299 9190";
const EMAIL = "Roberts@berqut.com";
const WEBSITE = "BERQUT.COM";

/**
 * COMPANY_CONTEXT — the knowledge base for the chatbot. Today it documents the
 * scope for the mock replies below; in the follow-up step it becomes the system
 * prompt for the real Claude API call. Keep in sync with CLAUDE.md.
 *
 * The future API integration must: (1) answer ONLY from this context,
 * (2) reply in the visitor's current locale, (3) politely decline anything
 * outside BERQUT GROUP's services, founder and contact details.
 */
export const COMPANY_CONTEXT = `
BERQUT GROUP is a premium real estate company in Astana, Kazakhstan, serving
international and local clients. Legal entity: LLP "BERQUT GROUP", Astana,
Republic of Kazakhstan. Tagline: "From empty square metres to ready premium
living."

Three service directions:
1. Real Estate — brokerage & investments: selection of apartments, houses,
   residences and commercial property; verification of property, district,
   price and liquidity; transaction support to handover of keys; investment
   via rental, resale and value-adding renovation. Process: Find → Verify →
   Deal → Grow.
2. Construction — renovation & living: construction, capital renovation,
   signature finishing, interior design, fit-out, furniture supply, home
   staging.
3. Relocation — management & languages: relocation for families, entrepreneurs
   and investors; property management (tenants, utilities, repairs, reports);
   private client service. Languages: Russian, Kazakh, English, German,
   Chinese, Spanish, Italian.

Founder: Robert Sowa, born 1971, German citizen, founder of BERQUT Real Estate
& Living International. Fluent in Russian, English, German, Polish and Italian.
35 years of international experience in construction and industrial engineering
across Australia, China, Europe, the Americas, the Middle East and Central Asia.

Contact — Germany: ${PHONE_GERMANY}; Kazakhstan: ${PHONE_KAZAKHSTAN};
Email: ${EMAIL}; Website: ${WEBSITE}.
`.trim();

// Keyword sets spanning all 7 site languages. Proper nouns (BERQUT, Robert
// Sowa, the email) are language-independent; the rest cover the key terms per
// locale so free-text questions route to the right intent.
const KEYWORDS: Record<
  Exclude<ChatIntent, "fallback" | "greeting">,
  string[]
> = {
  realEstate: [
    "real estate", "property", "properties", "apartment", "invest", "buy",
    "rent", "broker", "недвиж", "квартир", "инвест", "куп", "аренд",
    "immobil", "wohnung", "kaufen", "miet", "vivienda", "inmobili", "comprar",
    "invertir", "房产", "房", "投资", "买", "租", "жылжымайтын", "пәтер",
  ],
  construction: [
    "construc", "renovat", "renovation", "build", "interior", "fit-out",
    "ремонт", "строит", "отдел", "интерьер", "bau", "sanier", "innenausbau",
    "costru", "ristruttur", "interni", "reforma", "obra", "装修", "建", "翻新",
    "室内", "құрылыс", "жөндеу",
  ],
  relocation: [
    "reloc", "relocation", "moving", "move to", "tenant", "релокац", "переезд",
    "управлен", "umzug", "verwalt", "trasfer", "gesti", "reubicaci", "mudanza",
    "移居", "搬", "管理", "көшу", "басқару",
  ],
  founder: [
    "founder", "robert", "sowa", "owner", "who founded", "основа", "роберт",
    "сова", "владелец", "gründer", "fondat", "fundador", "创始", "罗伯特",
    "негізін",
  ],
  contact: [
    "contact", "email", "e-mail", "phone", "call", "reach", "address", "связ",
    "контакт", "почт", "телефон", "звон", "адрес", "kontakt", "erreich",
    "telefon", "adresse", "contatt", "telefono", "indirizzo", "contacto",
    "teléfono", "correo", "联系", "电话", "邮", "地址", "байланыс", "мекенжай",
    "@",
  ],
  services: [
    "service", "servic", "услуг", "dienst", "leistung", "servizio", "servicio",
    "服务", "қызмет", "offer", "предлаг", "help with", "do you do",
  ],
};

const GREETINGS = [
  "hello", "hi ", "hey", "good morning", "good day", "привет", "здравств",
  "добрый", "hallo", "guten tag", "moin", "ciao", "salve", "buongiorno",
  "hola", "buenas", "你好", "您好", "сәлем", "сәлеметсіз",
];

export function detectIntent(raw: string): ChatIntent {
  const m = " " + raw.toLowerCase().trim() + " ";
  if (!m.trim()) return "fallback";
  if (GREETINGS.some((g) => m.includes(g))) return "greeting";
  // Order matters. Construction/relocation carry unambiguous action words
  // (renovate, interior, relocate, manage), while real-estate keywords are
  // generic property nouns (apartment, property) that also show up in those
  // topics — so check the specific intents first, real estate before the
  // generic "services" catch-all.
  const order: Exclude<ChatIntent, "fallback" | "greeting">[] = [
    "founder", "contact", "construction", "relocation", "realEstate", "services",
  ];
  for (const intent of order) {
    if (KEYWORDS[intent].some((k) => m.includes(k))) return intent;
  }
  return "fallback";
}

// Builds a localized answer by composing the site's already-translated content
// (about / service / founder / footer namespaces) with the chat-specific copy.
function getMockReply(intent: ChatIntent, t: Translator): string {
  switch (intent) {
    case "greeting":
      return t("chat.greeting");
    case "services":
      return (
        t("chat.servicesIntro") +
        "\n\n" +
        `• ${t("realEstate.title")}\n• ${t("construction.title")}\n• ${t("relocation.title")}` +
        "\n\n" +
        t("chat.servicesOutro")
      );
    case "realEstate":
      return `${t("realEstate.title")}\n\n${t("realEstate.description")}`;
    case "construction":
      return `${t("construction.title")}\n\n${t("construction.description")}`;
    case "relocation":
      return `${t("relocation.title")}\n\n${t("relocation.description")}`;
    case "founder":
      return `${t("founder.name")} — ${t("founder.role")}\n\n${t("founder.bio")}`;
    case "contact":
      return (
        t("chat.contactIntro") +
        "\n\n" +
        `${t("footer.phoneGermany")}: ${PHONE_GERMANY}\n` +
        `${t("footer.phoneKazakhstan")}: ${PHONE_KAZAKHSTAN}\n` +
        `${t("footer.emailLabel")}: ${EMAIL}\n` +
        `${t("footer.websiteLabel")}: ${WEBSITE}`
      );
    case "fallback":
    default:
      return t("chat.fallback");
  }
}

/**
 * Produce the assistant's reply.
 *
 * MOCK IMPLEMENTATION — deterministic, offline, no network. In the follow-up
 * step this body is replaced with a `POST /api/chat` call to the Claude API
 * (sending { message, locale } and using COMPANY_CONTEXT as the system prompt).
 * The component calling this does not need to change — only this function does.
 */
export async function generateReply(
  message: string,
  t: Translator,
  forcedIntent?: ChatIntent
): Promise<string> {
  const intent = forcedIntent ?? detectIntent(message);
  // Simulate the latency of a real model call so the typing indicator shows.
  await new Promise((resolve) => setTimeout(resolve, 500 + Math.random() * 450));
  return getMockReply(intent, t);
}
