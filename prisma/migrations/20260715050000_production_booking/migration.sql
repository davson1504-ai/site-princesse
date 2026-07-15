CREATE TYPE "NotificationChannel" AS ENUM ('EMAIL_ADMIN','EMAIL_CUSTOMER','WHATSAPP_META');

ALTER TABLE "Service" ADD COLUMN "durationMinutes" INTEGER;
UPDATE "Service" SET "durationMinutes" = CASE "slug" WHEN 'tresses' THEN 240 WHEN 'perruque' THEN 150 WHEN 'naturel' THEN 90 ELSE 120 END;
ALTER TABLE "Service" ALTER COLUMN "durationMinutes" SET NOT NULL;

ALTER TABLE "Appointment" ADD COLUMN "appointmentDateTime" TIMESTAMPTZ;
ALTER TABLE "Appointment" ADD COLUMN "endsAt" TIMESTAMPTZ;
ALTER TABLE "Appointment" ADD COLUMN "timezone" TEXT NOT NULL DEFAULT 'Europe/Paris';
ALTER TABLE "Appointment" ADD COLUMN "durationMinutes" INTEGER;
ALTER TABLE "Appointment" ADD COLUMN "quotedPrice" TEXT;
UPDATE "Appointment" SET "appointmentDateTime" = ("appointmentDate"::date + "appointmentTime"::time) AT TIME ZONE 'Europe/Paris', "durationMinutes" = 120;
UPDATE "Appointment" SET "endsAt" = "appointmentDateTime" + ("durationMinutes" || ' minutes')::interval;
ALTER TABLE "Appointment" ALTER COLUMN "appointmentDateTime" SET NOT NULL;
ALTER TABLE "Appointment" ALTER COLUMN "endsAt" SET NOT NULL;
ALTER TABLE "Appointment" ALTER COLUMN "durationMinutes" SET NOT NULL;
DROP INDEX IF EXISTS "Appointment_appointmentDate_appointmentTime_key";
CREATE INDEX "Appointment_appointmentDateTime_endsAt_idx" ON "Appointment"("appointmentDateTime","endsAt");

CREATE TABLE "NotificationLog" ("id" TEXT NOT NULL,"appointmentId" TEXT NOT NULL,"channel" "NotificationChannel" NOT NULL,"success" BOOLEAN NOT NULL,"providerId" TEXT,"sanitizedError" TEXT,"createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,CONSTRAINT "NotificationLog_pkey" PRIMARY KEY ("id"));
CREATE INDEX "NotificationLog_appointmentId_channel_createdAt_idx" ON "NotificationLog"("appointmentId","channel","createdAt");
CREATE INDEX "NotificationLog_success_createdAt_idx" ON "NotificationLog"("success","createdAt");
ALTER TABLE "NotificationLog" ADD CONSTRAINT "NotificationLog_appointmentId_fkey" FOREIGN KEY ("appointmentId") REFERENCES "Appointment"("id") ON DELETE CASCADE ON UPDATE CASCADE;

CREATE TABLE "AdminAuditLog" ("id" TEXT NOT NULL,"action" TEXT NOT NULL,"targetRef" TEXT,"metadata" JSONB,"createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,CONSTRAINT "AdminAuditLog_pkey" PRIMARY KEY ("id"));
CREATE INDEX "AdminAuditLog_action_createdAt_idx" ON "AdminAuditLog"("action","createdAt");

CREATE TABLE "BlockedSlot" ("id" TEXT NOT NULL,"startsAt" TIMESTAMP(3) NOT NULL,"endsAt" TIMESTAMP(3) NOT NULL,"reason" TEXT,"createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,"updatedAt" TIMESTAMP(3) NOT NULL,CONSTRAINT "BlockedSlot_pkey" PRIMARY KEY ("id"));
CREATE INDEX "BlockedSlot_startsAt_endsAt_idx" ON "BlockedSlot"("startsAt","endsAt");

CREATE EXTENSION IF NOT EXISTS btree_gist;
ALTER TABLE "Appointment" ADD CONSTRAINT "Appointment_no_active_overlap" EXCLUDE USING gist (tstzrange("appointmentDateTime", "endsAt", '[)') WITH &&) WHERE ("status" IN ('PENDING','CONFIRMED'));

CREATE TABLE "RateLimitBucket" ("key" TEXT NOT NULL,"count" INTEGER NOT NULL,"resetAt" TIMESTAMP(3) NOT NULL,"updatedAt" TIMESTAMP(3) NOT NULL,CONSTRAINT "RateLimitBucket_pkey" PRIMARY KEY ("key"));
CREATE INDEX "RateLimitBucket_resetAt_idx" ON "RateLimitBucket"("resetAt");
