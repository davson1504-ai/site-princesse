export const SITE_NAME = "Beauty Haïr by Nao";
export const SITE_SLUG = "beauty-hair-by-nao";
export const MAX_ACTIVE_BOOKING_DATES = 7;

export const imageAlts: Record<string, string> = {
  "/images/hairstyles/cheveux-naturels-afro.jpeg": "Coiffure naturelle afro fournie par la cliente",
  "/images/hairstyles/crochet-braids-boucles-noires.jpeg": "Crochet braids longues et bouclées",
  "/images/hairstyles/faux-locks-longues.jpeg": "Faux locks longues",
  "/images/hairstyles/queue-de-cheval-cuivree-profil.jpeg": "Queue-de-cheval lisse cuivrée vue de profil",
  "/images/hairstyles/queue-de-cheval-cuivree-dessus.jpeg": "Queue-de-cheval lisse cuivrée vue du dessus",
  "/images/hairstyles/box-braids-blondes-face.jpeg": "Box braids blondes vues de face",
  "/images/hairstyles/box-braids-blondes-profil.jpeg": "Box braids blondes vues de profil",
  "/images/products/ampoules-aurodhea-soin-intensif-48-euros.jpeg": "Ampoules Aurodhea soin intensif",
  "/images/products/duo-aurodhea-bave-escargot.jpeg": "Duo Aurodhea shampoing et après-shampoing",
  "/images/products/gamme-aurodhea-anti-chute.jpeg": "Comparatif de références de la gamme Aurodhea",
  "/images/products/guide-shampoings-aurodhea-par-type-cheveux.jpeg": "Guide des shampoings Aurodhea par type de cheveux",
  "/images/products/lotion-aurodhea-anti-chute-50-euros.jpeg": "Lotion capillaire Aurodhea 50 ml",
  "/images/products/lotion-chogan-rafraichissante-24-90-euros.jpeg": "Lotion capillaire rafraîchissante Chogan",
  "/images/products/shampoing-aurodhea-anti-chute-19-90-euros.jpeg": "Shampoing Aurodhea pour cheveux fragiles 250 ml",
  "/images/products/shampoing-aurodhea-antipelliculaire-acide-salicylique.jpeg": "Shampoing Aurodhea antipelliculaire à l’acide salicylique",
};

export function formatFrenchPhone(value: string) {
  const digits = value.replace(/\D/g, "");
  if (digits.length === 10 && digits.startsWith("0")) return digits.match(/.{1,2}/g)?.join(" ") ?? value;
  if (digits.length === 11 && digits.startsWith("33")) return `0${digits.slice(2)}`.match(/.{1,2}/g)?.join(" ") ?? value;
  return value;
}

const phone = process.env.PRINCESSE_PHONE || "0745238006";
export const site = {
  name: SITE_NAME, slug: SITE_SLUG,
  owner: process.env.PRINCESSE_NAME || "Nao",
  email: process.env.PRINCESSE_EMAIL || "Princessesevinaomi@gmail.com",
  phone: formatFrenchPhone(phone), phoneHref: phone.replace(/\D/g, ""),
  whatsapp: process.env.PRINCESSE_WHATSAPP || process.env.NEXT_PUBLIC_PRINCESSE_WHATSAPP || "+33745238006",
  whatsappUrl: "https://wa.me/33745238006",
  address: process.env.PRINCESSE_ADDRESS || "Lieu communiqué lors de la confirmation",
  hours: process.env.PRINCESSE_HOURS || "Uniquement sur rendez-vous",
};

export const services = [
  { id: "tresses", name: "Tresses signature", duration: "4 h", durationMinutes: 240, price: "À partir de 50 €", description: "Tressage sur mesure selon la taille et la longueur choisies.", category: "Tresses" },
  { id: "perruque", name: "Pose de perruque", duration: "2 h 30", durationMinutes: 150, price: "Prix sur demande", description: "Préparation, ajustement et pose selon le modèle.", category: "Perruques" },
  { id: "naturel", name: "Soin naturel", duration: "1 h 30", durationMinutes: 90, price: "Prix sur demande", description: "Mise en forme adaptée aux cheveux naturels.", category: "Naturel" },
];

export const hairstyles = [
  { id:"coiffure-naturelle-afro",name:"Coiffure naturelle afro",category:"Naturel",duration:"À confirmer",price:"Prix sur demande",image:"/images/hairstyles/cheveux-naturels-afro.jpeg",images:["/images/hairstyles/cheveux-naturels-afro.jpeg"],alt:"Coiffure naturelle afro fournie par la cliente" },
  { id:"crochet-braids-bouclees",name:"Crochet braids bouclées",category:"Crochet braids",duration:"À confirmer",price:"Prix sur demande",image:"/images/hairstyles/crochet-braids-boucles-noires.jpeg",images:["/images/hairstyles/crochet-braids-boucles-noires.jpeg"],alt:"Crochet braids longues et bouclées" },
  { id:"faux-locks-longues",name:"Faux locks longues",category:"Locks",duration:"À confirmer",price:"Prix sur demande",image:"/images/hairstyles/faux-locks-longues.jpeg",images:["/images/hairstyles/faux-locks-longues.jpeg"],alt:"Faux locks longues" },
  { id:"queue-de-cheval-lisse-cuivree",name:"Queue-de-cheval lisse cuivrée",category:"Queue-de-cheval",duration:"À confirmer",price:"Prix sur demande",image:"/images/hairstyles/queue-de-cheval-cuivree-profil.jpeg",images:["/images/hairstyles/queue-de-cheval-cuivree-profil.jpeg","/images/hairstyles/queue-de-cheval-cuivree-dessus.jpeg"],alt:"Queue-de-cheval lisse de couleur cuivrée" },
  { id:"box-braids-blondes",name:"Box braids blondes",category:"Tresses",duration:"À confirmer",price:"À partir de 50 €",image:"/images/hairstyles/box-braids-blondes-face.jpeg",images:["/images/hairstyles/box-braids-blondes-face.jpeg","/images/hairstyles/box-braids-blondes-profil.jpeg"],alt:"Box braids blondes" },
];

export type Product = {slug:string;name:string;brand:string;category:string;description:string;code?:string;priceCents?:number;priceStatus:"CONFIRMED"|"VERIFY"|"MISSING";format?:string;imagePath:string;featured:boolean;available?:boolean};
export const products: Product[] = [
 {slug:"ampoules-aurodhea-soin-intensif",name:"Ampoules, soin intensif",brand:"Aurodhea",category:"Soin",description:"Soin capillaire en ampoules.",priceCents:4800,priceStatus:"CONFIRMED",format:"10 ampoules de 3 ml",imagePath:"/images/products/ampoules-aurodhea-soin-intensif-48-euros.jpeg",featured:true},
 {slug:"lotion-aurodhea-undaria",name:"Lotion capillaire à l’Undaria pinnatifida",brand:"Aurodhea",category:"Lotion",description:"Lotion capillaire de la gamme Aurodhea.",priceCents:5000,priceStatus:"CONFIRMED",format:"50 ml",imagePath:"/images/products/lotion-aurodhea-anti-chute-50-euros.jpeg",featured:true},
 {slug:"shampoing-aurodhea-cheveux-fragiles",name:"Shampoing pour cheveux fragiles",brand:"Aurodhea",category:"Shampoing",description:"Shampoing cosmétique pour cheveux fragiles.",priceCents:1990,priceStatus:"CONFIRMED",format:"250 ml",imagePath:"/images/products/shampoing-aurodhea-anti-chute-19-90-euros.jpeg",featured:true},
 {slug:"lotion-chogan-rafraichissante",name:"Lotion capillaire rafraîchissante",brand:"Chogan",category:"Lotion",description:"Lotion capillaire rafraîchissante.",priceCents:2490,priceStatus:"CONFIRMED",format:"Contenance à confirmer",imagePath:"/images/products/lotion-chogan-rafraichissante-24-90-euros.jpeg",featured:true},
 {slug:"shampoing-aurodhea-antipelliculaire",name:"Shampoing antipelliculaire à l’acide salicylique",brand:"Aurodhea",category:"Shampoing",description:"Shampoing cosmétique antipelliculaire.",priceStatus:"MISSING",imagePath:"/images/products/shampoing-aurodhea-antipelliculaire-acide-salicylique.jpeg",featured:false},
 {slug:"duo-aurodhea-bave-escargot",name:"Duo shampoing et après-shampoing à la bave d’escargot",brand:"Aurodhea",category:"Duo",description:"Duo de soins capillaires Aurodhea.",priceStatus:"MISSING",imagePath:"/images/products/duo-aurodhea-bave-escargot.jpeg",featured:false},
 {slug:"aurodhea-a101b",name:"Référence A101B",brand:"Aurodhea",category:"Gamme",description:"Référence visible sur le comparatif client; informations à vérifier.",code:"A101B",priceCents:1090,priceStatus:"VERIFY",imagePath:"/images/products/gamme-aurodhea-anti-chute.jpeg",featured:false},
 {slug:"aurodhea-ar02b",name:"Référence AR02B",brand:"Aurodhea",category:"Gamme",description:"Référence visible sur le comparatif client; informations à vérifier.",code:"AR02B",priceCents:1690,priceStatus:"VERIFY",imagePath:"/images/products/gamme-aurodhea-anti-chute.jpeg",featured:false},
 {slug:"aurodhea-nm01b",name:"Référence NM01B",brand:"Aurodhea",category:"Gamme",description:"Référence visible sur le comparatif client; informations à vérifier.",code:"NM01B",priceCents:1990,priceStatus:"VERIFY",imagePath:"/images/products/gamme-aurodhea-anti-chute.jpeg",featured:false},
 {slug:"aurodhea-bv09b",name:"Référence BV09B",brand:"Aurodhea",category:"Gamme",description:"Référence visible sur le comparatif client; informations à vérifier.",code:"BV09B",priceCents:1390,priceStatus:"VERIFY",imagePath:"/images/products/gamme-aurodhea-anti-chute.jpeg",featured:false},
 {slug:"aurodhea-la03b",name:"Référence LA03B",brand:"Aurodhea",category:"Gamme",description:"Référence visible sur le comparatif client; informations à vérifier.",code:"LA03B",priceCents:1990,priceStatus:"VERIFY",imagePath:"/images/products/gamme-aurodhea-anti-chute.jpeg",featured:false},
 {slug:"guide-shampoings-aurodhea",name:"Guide des shampoings par type de cheveux",brand:"Aurodhea",category:"Guide",description:"Visuel comparatif fourni par la cliente; références et recommandations à confirmer.",priceStatus:"MISSING",imagePath:"/images/products/guide-shampoings-aurodhea-par-type-cheveux.jpeg",featured:false},
];
