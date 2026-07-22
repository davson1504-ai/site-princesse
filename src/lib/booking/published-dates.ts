import{getPrisma}from"@/lib/database/prisma";import{MAX_ACTIVE_BOOKING_DATES}from"@/data/site";
export async function isPublishedBookingDate(date:string){const db=getPrisma();if(!db)return true;const row=await db.bookingAvailabilityDate.findUnique({where:{date:new Date(`${date}T00:00:00.000Z`)}});return Boolean(row?.isPublished)}
export function assertFutureDate(date:string,now=new Date()){const target=new Date(`${date}T23:59:59.999Z`);if(Number.isNaN(target.getTime())||target<now)throw new Error("Une date passée ne peut pas être publiée")}
export function assertPublicationLimit(count:number){if(count>=MAX_ACTIVE_BOOKING_DATES)throw new Error(`Maximum de ${MAX_ACTIVE_BOOKING_DATES} dates publiées atteint`)}
