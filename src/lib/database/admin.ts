import { getPrisma } from "./prisma";

export async function auditAdminAction(action:string,targetRef?:string,metadata?:Record<string,string>){const db=getPrisma();if(!db)return;await db.adminAuditLog.create({data:{action,targetRef,metadata}}).catch(()=>undefined);}
export async function listBlockedSlots(){const db=getPrisma();if(!db)return[];return db.blockedSlot.findMany({where:{endsAt:{gte:new Date()}},orderBy:{startsAt:"asc"}});}
export async function createBlockedSlot(startsAt:Date,endsAt:Date,reason?:string){const db=getPrisma();if(!db)throw new Error("PostgreSQL est requis pour gérer les indisponibilités");const item=await db.blockedSlot.create({data:{startsAt,endsAt,reason}});await auditAdminAction("blocked_slot.created",item.id);return item;}
export async function deleteBlockedSlot(id:string){const db=getPrisma();if(!db)throw new Error("PostgreSQL est requis pour gérer les indisponibilités");const item=await db.blockedSlot.delete({where:{id}});await auditAdminAction("blocked_slot.deleted",id);return item;}
