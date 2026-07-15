import { Resend } from "resend";
import { site } from "@/data/site";
import type { AppointmentRecord } from "@/types/appointment";
import { buildWhatsAppUrl, formatAppointmentMessage } from "./format";

export async function notifyPrincesse(a:AppointmentRecord){const errors:string[]=[];let emailSent=false,whatsappSent=false;const message=formatAppointmentMessage(a);
  if(process.env.RESEND_API_KEY&&process.env.EMAIL_FROM&&process.env.PRINCESSE_EMAIL){try{const {error}=await new Resend(process.env.RESEND_API_KEY).emails.send({from:process.env.EMAIL_FROM,to:process.env.PRINCESSE_EMAIL,subject:`Nouveau rendez-vous ${a.reference}`,text:message});if(error)throw new Error(error.message);emailSent=true;}catch(e){errors.push(`Email: ${e instanceof Error?e.message:"échec inconnu"}`)}}
  if(process.env.WHATSAPP_PHONE_NUMBER_ID&&process.env.WHATSAPP_ACCESS_TOKEN&&process.env.PRINCESSE_WHATSAPP){try{const response=await fetch(`https://graph.facebook.com/v23.0/${process.env.WHATSAPP_PHONE_NUMBER_ID}/messages`,{method:"POST",headers:{Authorization:`Bearer ${process.env.WHATSAPP_ACCESS_TOKEN}`,"Content-Type":"application/json"},body:JSON.stringify({messaging_product:"whatsapp",to:process.env.PRINCESSE_WHATSAPP.replace(/\D/g,""),type:"text",text:{body:message}})});if(!response.ok)throw new Error(`Meta HTTP ${response.status}`);whatsappSent=true;}catch(e){errors.push(`WhatsApp: ${e instanceof Error?e.message:"échec inconnu"}`)}}
  return{emailSent,whatsappSent,errors,whatsappUrl:buildWhatsAppUrl(site.whatsapp,message)};}
