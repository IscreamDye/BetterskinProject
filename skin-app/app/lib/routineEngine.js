/* =====================================================
   ADVANCED ROUTINE ENGINE v2
   ✅ Fixed SPF, normalization, serum rules, rotation
===================================================== */

/* ---------------- SERUM NORMALIZATION ---------------- */

export const SERUM_MAP = {
  "Vitamin C": "vitamin_c",
  "Hyaluronic Acid": "hyaluronic_acid",
  "Niacinamide": "niacinamide",
  "Retinoid": "retinoid",
  "Glycolic Acid": "aha",
  "Lactic Acid": "aha",
  "Mandelic Acid": "aha",
  "BHA (Salicylic Acid)": "bha",
  "Peptide": "peptides",
};

/* ---------------- ROUTINE STRUCTURE ---------------- */

export const MORNING_ROUTINE = [
  "cleanser",
  "toner",
  "serums",
  "eye_cream",
  "moisturizer",
  "spf",
];

export const EVENING_ROUTINE = [
  "cleanser",
  "toner",
  "exfoliant",
  "serums",
  "eye_cream",
  "moisturizer",
];

/* ---------------- SERUM PRIORITY ---------------- */

export const SERUM_PRIORITY = [
  "peptides",
  "hyaluronic_acid",
  "vitamin_c",
  "aha",
  "bha",
  "niacinamide",
  "azelaic_acid",
  "retinoid",
];

/* ---------------- SERUM RULES ---------------- */

export const SERUM_RULES = {
  vitamin_c: {
    routine: ["morning"],
    excludeWith: ["retinoid"],
    frequency: "daily",
  },

  hyaluronic_acid: {
    routine: ["morning", "evening"],
    frequency: "daily",
  },

  niacinamide: {
    routine: ["morning", "evening"],
    frequency: "daily",
  },

  peptides: {
    routine: ["morning", "evening"],
    frequency: "daily",
    priority: "first",
  },

  retinoid: {
    routine: ["evening"],
    excludeWith: ["vitamin_c", "aha", "bha"],
    frequency: "2-3x_week",
    priority: "last",
  },

  aha: {
    routine: ["evening"],
    excludeWith: ["retinoid", "bha"],
    frequency: "2x_week",
  },

  bha: {
    routine: ["evening"],
    excludeWith: ["retinoid", "aha"],
    frequency: "2x_week",
  },

  azelaic_acid: {
    routine: ["morning", "evening"],
    excludeWith: ["vitamin_c"],
    frequency: "daily",
  },
};

/* ---------------- ROTATION CONFIG ---------------- */

export const ROTATION_RULES = {
  serumsPerRoutineMax: 2,
  retinoidDays: [1, 3, 5], // Mon Wed Fri
  exfoliantMaxPerWeek: 2,
};

/* =====================================================
   HELPERS
===================================================== */

// Map categories for normalization
const CATEGORY_OVERRIDE = {
  "Serum / Active Ingredients": "serums",
  "Sunscreen": "spf",
};

// Normalize category names for engine logic
const normalizeCategory = (product) => {
  if (CATEGORY_OVERRIDE[product.category]) return CATEGORY_OVERRIDE[product.category];
  return product.category.toLowerCase().replace(/\s+/g, "_").replace("/", "");
};

// Enrich products with normalized category & serum key
const enrichProducts = (products) =>
  products.map((p) => ({
    ...p,
    normalizedCategory: normalizeCategory(p),
    serumKey: p.serumType ? SERUM_MAP[p.serumType] : null,
  }));

// Get day of week 0-6 (Sun-Sat)
const dayOfWeek = (date) => new Date(date).getDay();

/* =====================================================
   CORE LOGIC
===================================================== */

// Mandatory products: cleanser, moisturizer, SPF (morning)
const getMandatory = (products, routineType) =>
  products.filter((p) => {
    if (p.normalizedCategory === "cleanser") return true;
    if (p.normalizedCategory === "moisturizer") return true;
    if (routineType === "morning" && p.normalizedCategory === "spf") return true;
    return false;
  });

// Optional products: toner, eye cream, evening exfoliant
const getOptional = (products, routineType) =>
  products.filter((p) => {
    if (p.normalizedCategory === "toner") return true;
    if (p.normalizedCategory === "eye_cream") return true;
    if (routineType === "evening" && p.normalizedCategory === "exfoliant") return true;
    return false;
  });

// Filter eligible serums based on serum rules, routine type, and rotation
const getEligibleSerums = (products, routineType, date) => {
  const day = dayOfWeek(date);

  return products.filter((p) => {
    if (p.normalizedCategory !== "serums") return false;

    const rules = SERUM_RULES[p.serumKey];
    if (!rules) return false;
    if (!rules.routine.includes(routineType)) return false;

    // Retinoid rotation
    if (p.serumKey === "retinoid") {
      return ROTATION_RULES.retinoidDays.includes(day);
    }

    return true;
  });
};

// Apply serum conflicts and limit number of serums per routine
const applySerumRules = (serums) => {
  const selected = [];
  const skipped = [];

  for (const key of SERUM_PRIORITY) {
    const serum = serums.find((s) => s.serumKey === key);
    if (!serum) continue;

    const rules = SERUM_RULES[key];
    const conflict = selected.some((s) =>
      rules.excludeWith?.includes(s.serumKey)
    );

    if (conflict) {
      skipped.push({
        serum,
        reason: `Excluded due to conflict with another active`,
      });
      continue;
    }

    selected.push({
      ...serum,
      reason: `Included based on routine compatibility and priority`,
    });

    if (selected.length >= ROTATION_RULES.serumsPerRoutineMax) break;
  }

  return { selected, skipped };
};

// Order routine steps
const orderRoutine = (mandatory, optional, serums, routineType) => {
  const steps = [];

  // 1️⃣ Cleanser
  steps.push(...mandatory.filter(p => p.normalizedCategory === "cleanser"));

  // 2️⃣ Toner
  steps.push(...optional.filter(p => p.normalizedCategory === "toner"));

  // 3️⃣ Evening exfoliant
  if (routineType === "evening") {
    steps.push(...optional.filter(p => p.normalizedCategory === "exfoliant"));
  }

  // 4️⃣ Serums
  steps.push(...serums);

  // 5️⃣ Eye cream
  steps.push(...optional.filter(p => p.normalizedCategory === "eye_cream"));

  // 6️⃣ Moisturizer
  steps.push(...mandatory.filter(p => p.normalizedCategory === "moisturizer"));

  // 7️⃣ SPF (morning)
  if (routineType === "morning") {
    steps.push(...mandatory.filter(p => p.normalizedCategory === "spf"));
  }

  return steps;
};

/* =====================================================
   PUBLIC API
===================================================== */

export function buildRoutine({
  products,
  routineType,
  date = new Date(),
}) {
  const enriched = enrichProducts(products);

  const mandatory = getMandatory(enriched, routineType);
  const optional = getOptional(enriched, routineType);
  const eligibleSerums = getEligibleSerums(enriched, routineType, date);

  const { selected, skipped } = applySerumRules(eligibleSerums);

  const routine = orderRoutine(mandatory, optional, selected, routineType);

  return {
    routine,
    skipped,
    meta: {
      date,
      routineType,
      serumCount: selected.length,
    },
  };
}
