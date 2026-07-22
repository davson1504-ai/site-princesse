import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import { hairstyles, imageAlts, products, SITE_NAME } from "@/data/site";
import { productPrice } from "@/lib/pricing";
import { getPrisma } from "@/lib/database/prisma";
export const metadata: Metadata = { alternates: { canonical: "/" } };
export default async function Home() {
  const db = getPrisma();
  const featuredHairstyles = db
    ? (await db.hairstyle.findMany({ where: { isActive: true }, orderBy: [{ isFeatured: "desc" }, { name: "asc" }], take: 5 })).map(item => ({ id: item.slug, name: item.name, price: item.price || "Prix sur demande", image: item.mainImage, alt: imageAlts[item.mainImage] || item.name }))
    : hairstyles.slice(0, 5);
  const featuredProducts = db
    ? (await db.product.findMany({ where: { active: true, featured: true }, orderBy: { displayOrder: "asc" }, take: 4 })).map(item => ({ slug: item.slug, name: item.name, brand: item.brand, priceCents: item.priceCents ?? undefined, priceStatus: item.priceStatus, imagePath: item.imagePath }))
    : products.filter(product => product.featured).slice(0, 4);
  return (
    <>
      <section className="bg-[radial-gradient(circle_at_75%_30%,#ecd3c8,transparent_38%)]">
        <div className="mx-auto grid min-h-[72vh] max-w-6xl items-center gap-10 px-5 py-16 md:grid-cols-2">
          <div>
            <p className="mb-4 text-xs uppercase tracking-[.3em] text-[#9a624d]">
              {SITE_NAME}
            </p>
            <h1 className="font-serif text-5xl leading-tight md:text-7xl">
              La coiffure qui vous ressemble.
            </h1>
            <p className="mt-6 max-w-lg leading-7 text-black/65">
              Coiffures personnalisées et rendez-vous sur des dates
              sélectionnées par Nao.
            </p>
            <div className="mt-8 flex gap-3">
              <Link
                className="rounded-full bg-[#231b1b] px-6 py-3 text-white"
                href="/rendez-vous"
              >
                Prendre rendez-vous
              </Link>
              <Link className="rounded-full border px-6 py-3" href="/coiffures">
                Voir la galerie
              </Link>
            </div>
          </div>
          <div className="relative mx-auto aspect-[4/5] w-full max-w-sm overflow-hidden rounded-[8rem_8rem_2rem_2rem] shadow-2xl">
            <Image
              src="/images/hairstyles/box-braids-blondes-face.jpeg"
              alt={imageAlts["/images/hairstyles/box-braids-blondes-face.jpeg"]}
              fill
              priority
              sizes="(max-width:768px) 90vw,40vw"
              className="object-cover"
            />
          </div>
        </div>
      </section>
      <section className="mx-auto max-w-6xl px-5 py-20">
        <h2 className="font-serif text-4xl">Nos coiffures</h2>
        <div className="mt-8 grid gap-5 md:grid-cols-3">
          {featuredHairstyles.slice(0, 5).map((h) => (
            <article
              key={h.id}
              className="overflow-hidden rounded-3xl bg-white"
            >
              <div className="relative aspect-[4/5]">
                <Image
                  src={h.image}
                  alt={imageAlts[h.image] || h.alt}
                  fill
                  sizes="(max-width:768px) 100vw,33vw"
                  className="object-cover"
                />
              </div>
              <div className="p-5">
                <h3 className="font-serif text-2xl">{h.name}</h3>
                <p>{h.price}</p>
              </div>
            </article>
          ))}
        </div>
        <Link className="mt-7 inline-block underline" href="/coiffures">
          Toutes les coiffures
        </Link>
      </section>
      <section className="bg-white">
        <div className="mx-auto max-w-6xl px-5 py-20">
          <h2 className="font-serif text-4xl">Produits capillaires</h2>
          <div className="mt-8 grid gap-5 md:grid-cols-4">
            {featuredProducts.map((p) => (
                <article key={p.slug}>
                  <div className="relative aspect-square">
                    <Image
                      src={p.imagePath}
                      alt={imageAlts[p.imagePath] || `${p.name} ${p.brand}`}
                      fill
                      sizes="(max-width:768px) 50vw,25vw"
                      className="object-contain"
                    />
                  </div>
                  <h3 className="font-serif text-xl">{p.name}</h3>
                  <p>{productPrice(p.priceCents, p.priceStatus)}</p>
                </article>
              ))}
          </div>
          <Link className="mt-7 inline-block underline" href="/produits">
            Voir le catalogue
          </Link>
        </div>
      </section>
      <section className="mx-auto max-w-4xl px-5 py-20 text-center">
        <h2 className="font-serif text-4xl">Comment réserver</h2>
        <p className="mt-5 leading-8">
          1. Choisissez une date publiée · 2. Choisissez un créneau · 3. Envoyez
          votre demande · 4. Recevez votre référence.
        </p>
      </section>
    </>
  );
}
