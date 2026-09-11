// pact:ed — färdiga mallar
// Delas mellan admin.html (redigering) och mall.html (visning + signering)
// Fält: {name, label, type: text|date|number|textarea|select, required, options[]}
// Body: enkla {{variabler}} som ersätts med fältvärden.

window.PACTED_TEMPLATES = [

  // ============ UTRUSTNING ============
  {
    id: "utrustning-dator",
    title: "Utrustningskvittens — dator",
    category: "Utrustning",
    icon: "💻",
    description: "Anställd bekräftar mottagande av bärbar dator, laddare och tillbehör.",
    fields: [
      { name: "employee_name", label: "Anställdas namn", type: "text", required: true },
      { name: "employee_id", label: "Anställningsnummer", type: "text", required: false },
      { name: "date", label: "Utlämningsdatum", type: "date", required: true },
      { name: "device_brand", label: "Fabrikat och modell", type: "text", required: true, placeholder: "T.ex. Apple MacBook Pro 14\" M3" },
      { name: "serial", label: "Serienummer", type: "text", required: true },
      { name: "accessories", label: "Tillbehör", type: "textarea", required: false, placeholder: "Laddare, väska, mus, extra skärm..." },
      { name: "value", label: "Nyanskaffningsvärde (kr)", type: "number", required: false }
    ],
    bodyMarkdown:
      "Härmed bekräftar {{employee_name}} ({{employee_id}}) mottagandet av följande utrustning från arbetsgivaren {{date}}:\n\n" +
      "**Enhet:** {{device_brand}}\n" +
      "**Serienummer:** {{serial}}\n" +
      "**Tillbehör:** {{accessories}}\n" +
      "**Värde:** {{value}} kr\n\n" +
      "Den anställda förbinder sig att vårda utrustningen väl, endast använda den för arbetsrelaterade uppgifter (och privat i den utsträckning arbetsgivaren tillåter enligt IT-policy) samt återlämna den vid anställningens slut eller på begäran. " +
      "Vid skada eller förlust som beror på grov vårdslöshet kan ersättningsanspråk göras enligt gällande lag.",
    legalNote: "Detta dokument utgör bevis på överlämnad egendom. Vid tvist gäller skadeståndslagen och köplagen samt eventuella kollektivavtalsbestämmelser."
  },

  {
    id: "utrustning-telefon",
    title: "Utrustningskvittens — mobiltelefon",
    category: "Utrustning",
    icon: "📱",
    description: "Överlämning av tjänstetelefon inklusive SIM och abonnemang.",
    fields: [
      { name: "employee_name", label: "Anställdas namn", type: "text", required: true },
      { name: "date", label: "Utlämningsdatum", type: "date", required: true },
      { name: "phone_model", label: "Telefonmodell", type: "text", required: true, placeholder: "iPhone 16 Pro 256 GB" },
      { name: "imei", label: "IMEI", type: "text", required: true },
      { name: "sim_number", label: "Telefonnummer", type: "text", required: true },
      { name: "operator", label: "Operatör", type: "text", required: false },
      { name: "private_use", label: "Privat användning tillåten?", type: "select", required: true, options: ["Ja, enligt IT-policy", "Nej, endast tjänstesamtal"] }
    ],
    bodyMarkdown:
      "{{employee_name}} bekräftar mottagandet av tjänstetelefon {{date}}.\n\n" +
      "**Modell:** {{phone_model}}\n" +
      "**IMEI:** {{imei}}\n" +
      "**Telefonnummer:** {{sim_number}} ({{operator}})\n" +
      "**Privat användning:** {{private_use}}\n\n" +
      "Vid förlust ska arbetsgivaren informeras omedelbart så att SIM-kortet kan spärras. Telefonen återlämnas vid anställningens slut i det skick den då befinner sig.",
    legalNote: "Beskattning av eventuell privat användning sker enligt Skatteverkets regler för tjänstetelefon."
  },

  {
    id: "utrustning-nyckel",
    title: "Nyckel- och passerkortskvittens",
    category: "Utrustning",
    icon: "🔑",
    description: "Utlämning av fysiska nycklar, taggar och passerkort.",
    fields: [
      { name: "employee_name", label: "Anställdas namn", type: "text", required: true },
      { name: "date", label: "Utlämningsdatum", type: "date", required: true },
      { name: "keys", label: "Antal nycklar", type: "number", required: true, placeholder: "3" },
      { name: "key_marking", label: "Nyckelmärkning", type: "text", required: true, placeholder: "K-101, K-102, K-201" },
      { name: "access_card", label: "Passerkort/tag-nummer", type: "text", required: false },
      { name: "areas", label: "Behörighet till områden", type: "textarea", required: false, placeholder: "Kontor plan 3, arkivrum, förråd" }
    ],
    bodyMarkdown:
      "{{employee_name}} har {{date}} mottagit följande nycklar och passermedel:\n\n" +
      "**Nycklar:** {{keys}} st ({{key_marking}})\n" +
      "**Passerkort:** {{access_card}}\n" +
      "**Behörighet:** {{areas}}\n\n" +
      "Nycklar och passermedel är arbetsgivarens egendom och får inte överlåtas till någon annan. Förlust anmäls omedelbart. Vid anställningens upphörande återlämnas samtliga nycklar och passermedel.",
    legalNote: "Vid vårdslös hantering som leder till behov av låsbyte kan ersättningsskyldighet uppstå."
  },

  {
    id: "utrustning-bil",
    title: "Tjänstebilsöverlämning",
    category: "Utrustning",
    icon: "🚗",
    description: "Överlämning av företagsbil med skick, mätarställning och tillbehör.",
    fields: [
      { name: "employee_name", label: "Förare", type: "text", required: true },
      { name: "date", label: "Överlämningsdatum", type: "date", required: true },
      { name: "reg_number", label: "Registreringsnummer", type: "text", required: true },
      { name: "make_model", label: "Fabrikat och modell", type: "text", required: true },
      { name: "year", label: "Årsmodell", type: "number", required: false },
      { name: "mileage", label: "Mätarställning (km)", type: "number", required: true },
      { name: "fuel_level", label: "Tanknivå", type: "select", required: true, options: ["Full", "3/4", "1/2", "1/4", "Reservlampa"] },
      { name: "condition", label: "Anmärkningar på skick", type: "textarea", required: false, placeholder: "Repor, dellar, saknade delar..." },
      { name: "insurance", label: "Försäkringsbolag och nummer", type: "text", required: false }
    ],
    bodyMarkdown:
      "{{employee_name}} har {{date}} mottagit följande tjänstebil:\n\n" +
      "**Reg.nr:** {{reg_number}}\n" +
      "**Fordon:** {{make_model}} ({{year}})\n" +
      "**Mätarställning:** {{mileage}} km\n" +
      "**Tanknivå vid överlämning:** {{fuel_level}}\n" +
      "**Anmärkningar:** {{condition}}\n" +
      "**Försäkring:** {{insurance}}\n\n" +
      "Föraren förbinder sig att köra bilen på ett ansvarsfullt sätt, följa trafikregler, hålla den ren och rapportera skador omgående. Trafikförseelser är förarens personliga ansvar.",
    legalNote: "Bilförmånsbeskattning enligt Skatteverkets regler tillämpas när privat körning tillåts. Se separat bilförmånsavtal."
  },

  {
    id: "utrustning-skydd",
    title: "Skyddsutrustning (PPE)",
    category: "Utrustning",
    icon: "🦺",
    description: "Utlämning av personlig skyddsutrustning inom bygg, industri och lager.",
    fields: [
      { name: "employee_name", label: "Anställdas namn", type: "text", required: true },
      { name: "date", label: "Utlämningsdatum", type: "date", required: true },
      { name: "workplace", label: "Arbetsplats", type: "text", required: true },
      { name: "items", label: "Utlämnad utrustning", type: "textarea", required: true, placeholder: "Hjälm, skyddsskor stl 44, hörselkåpor, skyddsglasögon, varselväst" },
      { name: "training_done", label: "Introduktion i användning genomförd?", type: "select", required: true, options: ["Ja", "Nej — planerad"] }
    ],
    bodyMarkdown:
      "{{employee_name}} har {{date}} mottagit personlig skyddsutrustning för arbete på {{workplace}}:\n\n" +
      "**Utrustning:** {{items}}\n" +
      "**Introduktion i användning:** {{training_done}}\n\n" +
      "Anställda är skyldiga att använda utrustningen enligt anvisning, kontrollera funktion före varje arbetspass och byta ut skadade delar. Underlåtenhet kan innebära brott mot arbetsmiljölagen.",
    legalNote: "Baseras på Arbetsmiljöverkets föreskrifter AFS 2001:3 om användning av personlig skyddsutrustning."
  },

  // ============ POLICY & FÖRBINDELSER ============

  {
    id: "policy-sekretess",
    title: "Sekretessförbindelse (NDA)",
    category: "Policy",
    icon: "🤫",
    description: "Anställd förbinder sig att inte sprida företagets känsliga information.",
    fields: [
      { name: "employee_name", label: "Anställdas namn", type: "text", required: true },
      { name: "date", label: "Datum", type: "date", required: true },
      { name: "role", label: "Roll/befattning", type: "text", required: false },
      { name: "duration_years", label: "Sekretessperiod efter anställning (år)", type: "number", required: true, placeholder: "2" }
    ],
    bodyMarkdown:
      "**Sekretessförbindelse**\n\n" +
      "{{employee_name}} ({{role}}) förbinder sig genom denna signatur att inte, vare sig under eller efter anställningens upphörande, till utomstående yppa, utnyttja eller på annat sätt utnyttja företagets företagshemligheter enligt lagen (2018:558) om företagshemligheter.\n\n" +
      "Med företagshemlighet avses information om affärs- eller driftsförhållanden, tekniska lösningar, kundlistor, prissättning, källkod, affärsplaner och annan information som arbetsgivaren håller hemlig och vars röjande skulle kunna medföra skada.\n\n" +
      "Förbindelsen gäller under anställningen och därefter i **{{duration_years}} år**. Överträdelse kan medföra skadeståndsskyldighet och straffansvar.\n\n" +
      "Datum: {{date}}",
    legalNote: "Regleras av lagen (2018:558) om företagshemligheter samt anställningsavtalet."
  },

  {
    id: "policy-gdpr",
    title: "GDPR- och informationssäkerhetspolicy",
    category: "Policy",
    icon: "🛡️",
    description: "Anställd bekräftar att ha läst policyn för hantering av personuppgifter.",
    fields: [
      { name: "employee_name", label: "Anställdas namn", type: "text", required: true },
      { name: "date", label: "Datum", type: "date", required: true },
      { name: "policy_version", label: "Policyversion", type: "text", required: true, placeholder: "v2.1 (2026-01)" }
    ],
    bodyMarkdown:
      "**Bekräftelse — GDPR och informationssäkerhet**\n\n" +
      "{{employee_name}} bekräftar {{date}} att hen har tagit del av företagets policy för personuppgiftsbehandling och informationssäkerhet (**{{policy_version}}**), förstått innehållet samt förbinder sig att:\n\n" +
      "- Endast behandla personuppgifter för legitima ändamål inom ramen för arbetsuppgifterna\n" +
      "- Följa principerna om laglighet, ändamålsbegränsning, dataminimering och lagringstidsbegränsning\n" +
      "- Använda godkända system och säkra lösenord\n" +
      "- Aldrig dela inloggningsuppgifter\n" +
      "- Omedelbart rapportera misstänkta personuppgiftsincidenter till dataskyddsombudet\n" +
      "- Delta i årlig repetitionsutbildning\n\n" +
      "Överträdelse av GDPR kan medföra allvarliga sanktionsavgifter för företaget och disciplinära åtgärder för den anställda.",
    legalNote: "Baseras på EU-förordning 2016/679 (GDPR) och kompletterande svensk dataskyddslagstiftning."
  },

  {
    id: "policy-uppforandekod",
    title: "Uppförandekod (Code of Conduct)",
    category: "Policy",
    icon: "🤝",
    description: "Etiska riktlinjer, antikorruption, mångfald och trakasserier.",
    fields: [
      { name: "employee_name", label: "Anställdas namn", type: "text", required: true },
      { name: "date", label: "Datum", type: "date", required: true }
    ],
    bodyMarkdown:
      "**Bekräftelse av uppförandekod**\n\n" +
      "{{employee_name}} bekräftar {{date}} att ha läst och förstått företagets uppförandekod och förbinder sig att:\n\n" +
      "1. Behandla kollegor, kunder och leverantörer med respekt, oavsett kön, könsidentitet, etnicitet, religion, funktionsvariation, ålder eller sexuell läggning\n" +
      "2. Inte acceptera eller erbjuda mutor, otillbörliga gåvor eller andra förmåner\n" +
      "3. Undvika intressekonflikter och rapportera potentiella sådana\n" +
      "4. Aldrig delta i eller acceptera trakasserier, mobbning eller diskriminering\n" +
      "5. Följa alla tillämpliga lagar och regler i länderna där vi verkar\n" +
      "6. Rapportera misstänkta överträdelser via visselblåsarkanalen\n\n" +
      "Uppförandekoden gäller alla anställda, konsulter och styrelsemedlemmar.",
    legalNote: "Överträdelse kan leda till disciplinära åtgärder inklusive uppsägning enligt anställningsskyddslagen."
  },

  {
    id: "policy-it",
    title: "IT-policy och acceptabelt bruk",
    category: "Policy",
    icon: "💾",
    description: "Regler för användning av företagets IT-system, e-post och internet.",
    fields: [
      { name: "employee_name", label: "Anställdas namn", type: "text", required: true },
      { name: "date", label: "Datum", type: "date", required: true },
      { name: "byod", label: "Använder egen enhet (BYOD)?", type: "select", required: true, options: ["Nej", "Ja — telefon", "Ja — dator", "Ja — flera"] }
    ],
    bodyMarkdown:
      "**Bekräftelse — IT-policy och acceptabelt bruk**\n\n" +
      "{{employee_name}} bekräftar {{date}} att ha läst företagets IT-policy och förbinder sig att:\n\n" +
      "- Endast använda företagets IT-resurser för arbetsrelaterade ändamål (måttlig privat användning tillåten)\n" +
      "- Inte installera obehörig programvara\n" +
      "- Inte ansluta okrypterad USB eller privat lagringsmedia till företagets enheter\n" +
      "- Använda multifaktor-autentisering där det erbjuds\n" +
      "- Låsa datorn vid frånvaro\n" +
      "- Inte vidarebefordra företags-e-post till privata konton\n" +
      "- Rapportera misstänkta phishing-försök\n\n" +
      "**Egen enhet (BYOD):** {{byod}}. Vid BYOD gäller separata krav på krypterad lagring och möjlighet för arbetsgivaren att fjärrensa företagsdata.\n\n" +
      "Överträdelse kan leda till indragen behörighet och disciplinära åtgärder.",
    legalNote: "Övervakning av IT-användning sker i enlighet med kollektivavtal och GDPR."
  },

  {
    id: "policy-arbetsmiljo",
    title: "Arbetsmiljöintroduktion",
    category: "Policy",
    icon: "⚠️",
    description: "Genomförd introduktion i arbetsmiljö, brand och första hjälpen.",
    fields: [
      { name: "employee_name", label: "Anställdas namn", type: "text", required: true },
      { name: "date", label: "Datum för introduktion", type: "date", required: true },
      { name: "workplace", label: "Arbetsplats", type: "text", required: true },
      { name: "instructor", label: "Ansvarig för introduktionen", type: "text", required: true },
      { name: "topics", label: "Genomgångna moment", type: "textarea", required: true, placeholder: "Utrymningsvägar, brandlarmet, återsamlingsplats, första hjälpen-lådan, hjärtstartare, riskanalys, tillbudsanmälan" }
    ],
    bodyMarkdown:
      "**Bekräftelse — arbetsmiljöintroduktion**\n\n" +
      "{{employee_name}} har {{date}} genomgått arbetsmiljöintroduktion på {{workplace}}, med {{instructor}} som ansvarig.\n\n" +
      "**Genomgångna moment:**\n{{topics}}\n\n" +
      "Den anställda bekräftar att hen har förstått innehållet, vet var utrymningsvägar och första hjälpen-utrustning finns, samt känner till rutin för att anmäla tillbud och olyckor.\n\n" +
      "Repetitionsutbildning genomförs årligen samt när nya risker identifieras eller nya arbetsmoment introduceras.",
    legalNote: "Baseras på Arbetsmiljölagen (1977:1160) och Arbetsmiljöverkets föreskrifter om systematiskt arbetsmiljöarbete (AFS 2001:1)."
  }

];

// Hjälpfunktion: rendera markdown-liknande text med {{variabler}}
window.renderTemplate = function(bodyMarkdown, values) {
  let out = bodyMarkdown;
  for (const [k, v] of Object.entries(values || {})) {
    const re = new RegExp('\\{\\{\\s*' + k + '\\s*\\}\\}', 'g');
    out = out.replace(re, v || '—');
  }
  // Ersätt kvarvarande {{variabler}} med streck
  out = out.replace(/\{\{[^}]+\}\}/g, '—');
  return out;
};

// Hämta mallar (customized eller default)
window.getTemplates = function() {
  try {
    const stored = localStorage.getItem('pacted_templates_v1');
    if (stored) return JSON.parse(stored);
  } catch {}
  return window.PACTED_TEMPLATES;
};

window.saveTemplates = function(templates) {
  localStorage.setItem('pacted_templates_v1', JSON.stringify(templates));
};

window.resetTemplates = function() {
  localStorage.removeItem('pacted_templates_v1');
};
