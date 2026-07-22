import type { Metadata } from "next";
import Image from "next/image";
import { imageAlts, products as fallback, site, type Product } from "@/data/site";
import { getPrisma } from "@/lib/database/prisma";
import { productPrice } from "@/lib/pricing";
import { buildProductWhatsAppMessage } from "@/lib/products";

export const metadata: Metadata = {
  title: "Produits capillaires",
  description: "Catalogue disponible sur demande, sans paiement en ligne.",
};

export default async function Page() {
  const db = getPrisma();
  let products: Product[] = fallback;
  if (db) {
    const rows = await db.product.findMany({
      where: { active: true },
      orderBy: [{ featured: "desc" }, { displayOrder: "asc" }],
    });
    products = rows.map((product) => ({
      slug: product.slug,
      name: product.name,
      brand: product.brand,
      category: product.category,
      description: product.description,
      code: product.code || undefined,
      priceCents: product.priceCents ?? undefined,
      priceStatus: product.priceStatus as Product["priceStatus"],
      format: product.format || undefined,
      imagePath: product.imagePath,
      featured: product.featured,
      available: product.available,
    }));
  }
  const seenImages = new Set<string>();
  return (
    <div className="mx-auto max-w-6xl px-5 py-16">
      <p className="text-xs uppercase tracking-[.25em] text-[#9a624d]">
        Catalogue sans paiement en ligne
      </p>
      <h1 className="mt-2 font-serif text-5xl">Produits capillaires</h1>
      <p className="mt-4 text-black/65">
        Demandez un produit sur WhatsApp. La disponibilité est confirmée
        manuellement.
      </p>
      <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {products.map((product, index) => {
          const price = productPrice(product.priceCents, product.priceStatus);
          const message = buildProductWhatsAppMessage(site.name, {
            name: product.name,
            code: product.code,
            displayedPrice: price,
          });
          const showImage = !seenImages.has(product.imagePath);
          seenImages.add(product.imagePath);
          const available = product.available !== false;
          return (
            <article
              key={product.slug}
              className="overflow-hidden rounded-3xl bg-white shadow-sm"
            >
              {showImage ? (
                <div className="relative aspect-square bg-[#f4ece8]">
                  <Image
                    src={product.imagePath}
                    alt={imageAlts[product.imagePath] || `${product.name} de la marque ${product.brand}`}
                    fill
                    priority={index === 0}
                    sizes="(max-width:640px) 100vw,(max-width:1024px) 50vw,33vw"
                    className="object-contain p-3"
                  />
                </div>
              ) : (
                <div className="flex aspect-square items-center justify-center bg-[#f4ece8] p-8 text-center text-sm text-black/55">
                  Visuel comparatif présenté une seule fois dans le catalogue.
                </div>
              )}
              <div className="p-6">
                <p className="text-xs uppercase tracking-widest">
                  {product.brand} · {product.category}
                </p>
                <h2 className="mt-2 font-serif text-2xl">{product.name}</h2>
                <p className="mt-2 text-sm text-black/65">
                  {product.description}
                </p>
                {product.format && (
                  <p className="mt-2 text-sm">{product.format}</p>
                )}
                <p className="mt-4 font-semibold">{price}</p>
                <p
                  className={`mt-2 text-sm ${available ? "text-green-800" : "text-red-800"}`}
                >
                  {available
                    ? "Disponible sur confirmation"
                    : "Indisponible actuellement"}
                </p>
                {available ? (
                  <a
                    target="_blank"
                    rel="noreferrer"
                    href={`https://wa.me/33745238006?text=${encodeURIComponent(message)}`}
                    className="mt-5 inline-block rounded-full bg-[#231b1b] px-5 py-3 text-sm text-white"
                  >
                    Demander ce produit sur WhatsApp
                  </a>
                ) : (
                  <span className="mt-5 inline-block rounded-full bg-gray-200 px-5 py-3 text-sm text-gray-600">
                    Demande temporairement fermée
                  </span>
                )}
              </div>
            </article>
          );
        })}
      </div>
      <aside className="mt-10 rounded-2xl bg-amber-50 p-5 text-sm leading-6">
        Les informations produit sont fournies à titre descriptif. Vérifiez la
        composition et les précautions indiquées par le fabricant. En cas de
        problème de cuir chevelu ou de chute persistante, demandez conseil à un
        professionnel de santé.
      </aside>
    </div>
  );
}
