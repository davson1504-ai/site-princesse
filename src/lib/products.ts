export function buildProductWhatsAppMessage(siteName: string, product: { name: string; code?: string; displayedPrice: string }) {
  return `Bonjour ${siteName}, je souhaite demander ${product.name}${product.code ? ` (réf. ${product.code})` : ""}, affiché à ${product.displayedPrice}. Pouvez-vous confirmer sa disponibilité ?`;
}
