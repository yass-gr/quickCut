export type Language = "en" | "fr" | "darija"

const translations: Record<string, Record<Language, string>> = {
  "HOME": { en: "HOME", fr: "DOMICILE", darija: "الديور" },
  "AWAY": { en: "AWAY", fr: "EXTÉRIEUR", darija: "البرا" },
  "DRAW": { en: "DRAW", fr: "NUL", darija: "تعادل" },
  "HOME WIN": { en: "HOME WIN", fr: "DOMICILE GAGNE", darija: "الديور ربح" },
  "AWAY WIN": { en: "AWAY WIN", fr: "EXTÉRIEUR GAGNE", darija: "البرا ربح" },
  "MATCH RESULT": { en: "MATCH RESULT", fr: "RÉSULTAT MATCH", darija: "نتيجة لماتش" },
  "BOTH TO SCORE": { en: "BOTH TO SCORE", fr: "LES DEUX MARQUENT", darija: "جوج يهدرو" },
  "TOTAL GOALS": { en: "TOTAL GOALS", fr: "TOTAL DE BUTS", darija: "مجموع لأهداف" },
  "OVER 2.5": { en: "OVER 2.5", fr: "PLUS DE 2.5", darija: "كتير من 2.5" },
  "UNDER 2.5": { en: "UNDER 2.5", fr: "MOINS DE 2.5", darija: "قل من 2.5" },
  "FULL TIME": { en: "FULL TIME", fr: "TEMPS RÉGLEMENTAIRE", darija: "الوقت القانوني" },
  "MATCH ANALYSIS": { en: "MATCH ANALYSIS", fr: "ANALYSE DU MATCH", darija: "تحليل لماتش" },
  "BEST PICK": { en: "BEST PICK", fr: "MEILLEUR CHOIX", darija: "أحسن اختيار" },
  "GET FULL AI ANALYSIS": { en: "GET FULL AI ANALYSIS", fr: "ANALYSE AI COMPLÈTE", darija: "تحليل كامل بالذكاء" },
  "AI CONFIDENCE": { en: "AI CONFIDENCE", fr: "CONFIANCE AI", darija: "ثقة" },
  "AI PREDICTION": { en: "AI PREDICTION", fr: "PRÉDICTION AI", darija: "توقعات" },
  "CONFIDENCE BREAKDOWN": { en: "CONFIDENCE BREAKDOWN", fr: "RÉPARTITION CONFIANCE", darija: "تفصيل الثقة" },
  "AI INSIGHT": { en: "AI INSIGHT", fr: "ANALYSE AI", darija: "تحليل" },
  "HIGH": { en: "HIGH", fr: "ÉLEVÉ", darija: "عالٍ" },
  "MEDIUM": { en: "MEDIUM", fr: "MOYEN", darija: "متوسط" },
  "LOW": { en: "LOW", fr: "FAIBLE", darija: "ضعيف" },
  "MATCH": { en: "MATCH", fr: "MATCH", darija: "لماتش" },
  "LEAGUE": { en: "LEAGUE", fr: "LIGUE", darija: "البطولة" },
  "VS": { en: "VS", fr: "VS", darija: "VS" },
  "YES": { en: "YES", fr: "OUI", darija: "إيه" },
  "NO": { en: "NO", fr: "NON", darija: "لا" },
  "MSSOUGRA AI": { en: "MSSOUGRA AI", fr: "MSSOUGRA AI", darija: "مسوقرة AI" },
  "link in bio": { en: "link in bio", fr: "lien en bio", darija: "اللينك ف البايو" },
  "or mssougra.vercel.app": { en: "or mssougra.vercel.app", fr: "ou mssougra.vercel.app", darija: "ولا mssougra.vercel.app" },
  ">": { en: ">", fr: ">", darija: ">" },
  "have a strong home record this season": { en: "have a strong home record this season", fr: "a un solide bilan à domicile cette saison", darija: "عندو ريكورد قوي ف الديور هاد الموسم" },
  "struggles away from home recently": { en: "struggles away from home recently", fr: "a du mal à l'extérieur récemment", darija: "عندو مشكل ف البرا هاد الوقت" },
  "Head-to-head favors the home side": { en: "Head-to-head favors the home side", fr: "Les confrontations favorisent le domicile", darija: "المواجهات كاتحيد الديور" },
  "CONFIDENCE": { en: "CONFIDENCE", fr: "CONFIANCE", darija: "ثقة" },
  "9:41": { en: "9:41", fr: "9:41", darija: "9:41" },
  "15:00": { en: "15:00", fr: "15:00", darija: "15:00" },
  "THE MODEL": { en: "THE MODEL", fr: "LE MODÈLE", darija: "النموذج" },
  "LOVES THIS": { en: "LOVES THIS", fr: "ADORE ÇA", darija: "كيحب هاد" },
  "PICK OF": { en: "PICK OF", fr: "CHOIX DU", darija: "اختيار" },
  "THE DAY": { en: "THE DAY", fr: "JOUR", darija: "النهار" },
  "TODAY'S": { en: "TODAY'S", fr: "DU JOUR", darija: "النهار" },
}

const hookPairOverrides: Record<string, Record<Language, [string, string]>> = {
  ["TODAY'S\tMATCH"]: {
    en: ["TODAY'S", "MATCH"],
    fr: ["MATCH", "DU JOUR"],
    darija: ["لماتش", "النهار"],
  },
}

export function tHookSegment(lang: Language, line1: string, line2: string, index: 0 | 1): string {
  const pair = hookPairOverrides[`${line1}\t${line2}`]
  if (pair) return pair[lang][index]
  return t(lang, index === 0 ? line1 : line2)
}

export function t(lang: Language, key: string): string {
  return translations[key]?.[lang] ?? key
}

export function tPick(lang: Language, pick: string): string {
  if (pick === "1") return t(lang, "HOME")
  if (pick === "X") return t(lang, "DRAW")
  if (pick === "2") return t(lang, "AWAY")
  return pick
}

export function tType(lang: Language, type: string): string {
  if (type === "1X2") return t(lang, "MATCH RESULT")
  if (type === "BTTS") return t(lang, "BOTH TO SCORE")
  if (type === "OVER/UNDER 2.5") return t(lang, "TOTAL GOALS")
  return type
}

export function tConfidenceLabel(lang: Language, confidence: number): string {
  if (confidence >= 70) return t(lang, "HIGH")
  if (confidence >= 50) return t(lang, "MEDIUM")
  return t(lang, "LOW")
}
