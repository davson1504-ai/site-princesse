export const braidPrices = { XS:11000, S:9000, M:7000, L:5000 } as const;
export type BraidSize = keyof typeof braidPrices;
export const EXTRA_LENGTH_CENTS = 1000;
export function estimateBraidPrice(code:BraidSize, extraLength=false){const base=braidPrices[code];if(base<0)throw new Error("Le prix ne peut pas être négatif");return base+(extraLength?EXTRA_LENGTH_CENTS:0)}
export function formatEUR(cents:number){if(cents<0)throw new Error("Le prix ne peut pas être négatif");return new Intl.NumberFormat("fr-FR",{style:"currency",currency:"EUR"}).format(cents/100)}
export function productPrice(priceCents?:number,status?:string){if(priceCents==null)return "Prix à confirmer";return `${status==="VERIFY"?"À vérifier · ":""}${formatEUR(priceCents)}`}
