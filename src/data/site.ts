export function formatFrenchPhone(value: string) {
  const digits = value.replace(/\D/g, "");
  if (digits.length === 10 && digits.startsWith("0")) return digits.match(/.{1,2}/g)?.join(" ") ?? value;
  if (digits.length === 11 && digits.startsWith("33")) return `0${digits.slice(2)}`.match(/.{1,2}/g)?.join(" ") ?? value;
  return value;
}

const phone = process.env.PRINCESSE_PHONE || "[TÉLÉPHONE À REMPLACER]";

export const site = {
  name: process.env.NEXT_PUBLIC_SITE_NAME || "Princesse Coiffure",
  owner: process.env.PRINCESSE_NAME || "Princesse [nom à préciser]",
  email: process.env.PRINCESSE_EMAIL || "[GMAIL À REMPLACER]",
  phone: formatFrenchPhone(phone),
  phoneHref: phone.replace(/\D/g, ""),
  whatsapp: process.env.PRINCESSE_WHATSAPP || process.env.NEXT_PUBLIC_PRINCESSE_WHATSAPP || "[WHATSAPP INTERNATIONAL À REMPLACER]",
  address: process.env.PRINCESSE_ADDRESS || "[LOCALISATION À REMPLACER]",
  hours: process.env.PRINCESSE_HOURS || "[HORAIRES À REMPLACER]",
};

export const services = [
  { id: "tresses", name: "Tresses signature", duration: "3–5 h", price: "Tarif à confirmer", description: "Finitions soignées et style personnalisé.", category: "Tresses" },
  { id: "perruque", name: "Pose de perruque", duration: "2–3 h", price: "Tarif à confirmer", description: "Pose naturelle et ajustement sur mesure.", category: "Perruques" },
  { id: "naturel", name: "Soin cheveux naturels", duration: "1–2 h", price: "Tarif à confirmer", description: "Diagnostic, soin et mise en beauté.", category: "Naturel" },
];

export const hairstyles = [
  { id: "couronne", name: "Couronne bohème", category: "Tresses", duration: "4 h", image: "/images/hairstyles/placeholder.svg" },
  { id: "silk", name: "Silk lace", category: "Perruques", duration: "2 h", image: "/images/hairstyles/placeholder.svg" },
  { id: "twists", name: "Twists naturels", category: "Naturel", duration: "3 h", image: "/images/hairstyles/placeholder.svg" },
];
