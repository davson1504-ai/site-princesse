import { cookies } from "next/headers";
import { SignJWT, jwtVerify } from "jose";
import bcrypt from "bcryptjs";

const cookieName="princesse_admin";
function secret(){const value=process.env.AUTH_SECRET||(process.env.NODE_ENV==="development"?"princesse-local-development-secret-change-me":"");if(!value)throw new Error("AUTH_SECRET doit être configuré");return new TextEncoder().encode(value)}
export async function validPassword(password:string){if(process.env.ADMIN_PASSWORD_HASH)return bcrypt.compare(password,process.env.ADMIN_PASSWORD_HASH);return process.env.NODE_ENV==="development"&&password==="princesse-local";}
export async function createSession(){const token=await new SignJWT({role:"admin",name:"Nao"}).setProtectedHeader({alg:"HS256"}).setIssuedAt().setExpirationTime("8h").sign(secret());(await cookies()).set(cookieName,token,{httpOnly:true,sameSite:"lax",secure:process.env.NODE_ENV==="production",path:"/",maxAge:8*60*60});}
export async function clearSession(){(await cookies()).delete(cookieName)}
export async function isAdmin(){try{const token=(await cookies()).get(cookieName)?.value;if(!token)return false;const {payload}=await jwtVerify(token,secret());return payload.role==="admin";}catch{return false}}
