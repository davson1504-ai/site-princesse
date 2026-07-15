import { isAdmin } from "@/lib/security/auth";import { listAppointments } from "@/lib/database/appointments";
export async function GET(){if(!(await isAdmin()))return Response.json({error:"Non autorisé"},{status:401});return Response.json({appointments:await listAppointments()})}
