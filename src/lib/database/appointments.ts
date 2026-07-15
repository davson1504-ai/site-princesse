import { promises as fs } from "node:fs";
import path from "node:path";
import type { AppointmentInput } from "@/lib/validation/appointment";
import type { AppointmentRecord, AppointmentStatus } from "@/types/appointment";
import { getPrisma } from "./prisma";

const file = path.join(process.cwd(), "data", "appointments.json");

async function readLocal(): Promise<AppointmentRecord[]> {
  try { return JSON.parse(await fs.readFile(file, "utf8")); } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") return [];
    throw error;
  }
}
async function writeLocal(items: AppointmentRecord[]) { await fs.mkdir(path.dirname(file), { recursive: true }); await fs.writeFile(file, JSON.stringify(items, null, 2), "utf8"); }
function fromDb(x: { id:string;reference:string;customerName:string;phone:string;whatsapp:string;email:string|null;service:{slug:string};hairstyle:{slug:string}|null;appointmentDate:Date;appointmentTime:string;location:string;appointmentType:string;preferredContactMethod:string;message:string|null;status:string;notificationErrors:unknown;createdAt:Date;updatedAt:Date }): AppointmentRecord { return { ...x, email:x.email||undefined, serviceId:x.service.slug, hairstyleId:x.hairstyle?.slug, appointmentDate:x.appointmentDate.toISOString().slice(0,10), appointmentType:x.appointmentType as AppointmentRecord["appointmentType"], preferredContactMethod:x.preferredContactMethod as AppointmentRecord["preferredContactMethod"], message:x.message||undefined, status:x.status as AppointmentStatus, notificationErrors:Array.isArray(x.notificationErrors)?x.notificationErrors as string[]:undefined, createdAt:x.createdAt.toISOString(), updatedAt:x.updatedAt.toISOString() }; }

export async function hasConflict(date:string,time:string){const db=getPrisma();if(db)return Boolean(await db.appointment.findFirst({where:{appointmentDate:new Date(`${date}T00:00:00.000Z`),appointmentTime:time,status:{notIn:["CANCELLED","REFUSED","ARCHIVED"]}}}));return (await readLocal()).some(x=>x.appointmentDate===date&&x.appointmentTime===time&&!(["CANCELLED","REFUSED","ARCHIVED"] as string[]).includes(x.status));}
export async function createAppointment(input:AppointmentInput,reference:string):Promise<AppointmentRecord>{const now=new Date().toISOString();const db=getPrisma();if(db){const service=await db.service.findUniqueOrThrow({where:{slug:input.serviceId}});const hairstyle=input.hairstyleId?await db.hairstyle.findUnique({where:{slug:input.hairstyleId}}):null;return fromDb(await db.appointment.create({data:{reference,customerName:input.customerName,phone:input.phone,whatsapp:input.whatsapp,email:input.email||null,serviceId:service.id,hairstyleId:hairstyle?.id,appointmentDate:new Date(`${input.appointmentDate}T00:00:00.000Z`),appointmentTime:input.appointmentTime,location:input.location,appointmentType:input.appointmentType,preferredContactMethod:input.preferredContactMethod,message:input.message||null},include:{service:true,hairstyle:true}}));}const item:AppointmentRecord={id:crypto.randomUUID(),reference,...input,email:input.email||undefined,hairstyleId:input.hairstyleId||undefined,message:input.message||undefined,status:"PENDING",createdAt:now,updatedAt:now};const items=await readLocal();items.push(item);await writeLocal(items);return item;}
export async function listAppointments(){const db=getPrisma();if(db)return (await db.appointment.findMany({include:{service:true,hairstyle:true},orderBy:[{appointmentDate:"asc"},{appointmentTime:"asc"}]})).map(fromDb);return (await readLocal()).sort((a,b)=>(a.appointmentDate+a.appointmentTime).localeCompare(b.appointmentDate+b.appointmentTime));}
export async function getAppointment(reference:string){const db=getPrisma();if(db){const x=await db.appointment.findUnique({where:{reference},include:{service:true,hairstyle:true}});return x?fromDb(x):null;}return (await readLocal()).find(x=>x.reference===reference)||null;}
export async function updateAppointment(reference:string,status:AppointmentStatus,notificationErrors?:string[]){const db=getPrisma();if(db){const x=await db.appointment.update({where:{reference},data:{status,notificationErrors},include:{service:true,hairstyle:true}});return fromDb(x);}const items=await readLocal();const item=items.find(x=>x.reference===reference);if(!item)return null;item.status=status;item.updatedAt=new Date().toISOString();if(notificationErrors)item.notificationErrors=notificationErrors;await writeLocal(items);return item;}
export async function archiveAppointment(reference:string){return updateAppointment(reference,"ARCHIVED")}
