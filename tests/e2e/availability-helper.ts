import type { APIRequestContext } from "@playwright/test";

type AvailabilityPayload = { slots?: string[] };

export async function findAvailableSlot(
  request: APIRequestContext,
  service = "tresses",
  startOffsetDays = 20,
) {
  const publishedResponse=await request.get("/api/availability");
  if(publishedResponse.ok()){
    const published=await publishedResponse.json() as {dates?:string[]};
    for(const date of published.dates||[]){const response=await request.get(`/api/availability?date=${date}&service=${encodeURIComponent(service)}`);if(response.ok()){const payload=await response.json() as AvailabilityPayload;if(payload.slots?.length)return{date,time:payload.slots[0]}}}
  }
  for (let offset = startOffsetDays; offset < startOffsetDays + 90; offset += 1) {
    const candidate = new Date(Date.now() + offset * 86_400_000);
    const date = candidate.toISOString().slice(0, 10);
    const response = await request.get(
      `/api/availability?date=${date}&service=${encodeURIComponent(service)}`,
    );
    if (!response.ok()) continue;
    const payload = (await response.json()) as AvailabilityPayload;
    if (payload.slots?.length) return { date, time: payload.slots[0] };
  }

  const login=await request.post("/api/admin/login",{data:{password:"princesse-local"}});
  if(login.ok()){
    const admin=await request.get("/api/admin/availability");
    if(admin.ok()){const body=await admin.json() as {dates?:Array<{id:string;isPublished:boolean}>};for(const item of body.dates||[])if(item.isPublished)await request.patch(`/api/admin/availability/${item.id}`,{data:{isPublished:false}})}
    const candidate=new Date(Date.now()+(2100+Math.floor(Date.now()/1000)%500)*86_400_000);
    while(candidate.getUTCDay()===0)candidate.setUTCDate(candidate.getUTCDate()+1);
    const date=candidate.toISOString().slice(0,10);
    const created=await request.post("/api/admin/availability",{data:{date}});
    if(created.ok()){
      const response=await request.get(`/api/availability?date=${date}&service=${encodeURIComponent(service)}`);
      if(response.ok()){const payload=await response.json() as AvailabilityPayload;if(payload.slots?.length)return{date,time:payload.slots[0]}}
    }
  }
  throw new Error(`Aucun créneau disponible trouvé pour ${service}`);
}
