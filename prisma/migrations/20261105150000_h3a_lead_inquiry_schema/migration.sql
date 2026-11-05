-- H-3A additive migration. No existing Inquiry rows or columns are modified.
CREATE TYPE "LeadInquirySource" AS ENUM ('CHAT_FORM', 'HOTEL_FORM', 'OTHER');
CREATE TYPE "LeadInquiryStatus" AS ENUM ('NEW', 'CONTACTED', 'QUALIFIED', 'WON', 'LOST');

CREATE TABLE "LeadInquiry" (
    "id" TEXT NOT NULL,
    "businessId" VARCHAR(64) NOT NULL,
    "source" "LeadInquirySource" NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "contact" VARCHAR(150) NOT NULL,
    "question" VARCHAR(400) NOT NULL,
    "consentedAt" TIMESTAMP(3) NOT NULL,
    "status" "LeadInquiryStatus" NOT NULL DEFAULT 'NEW',
    "version" INTEGER NOT NULL DEFAULT 1,
    "idempotencyKey" VARCHAR(128),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "LeadInquiry_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "LeadInquiry_version_check" CHECK ("version" >= 1),
    CONSTRAINT "LeadInquiry_business_nonempty" CHECK (length(btrim("businessId")) > 0),
    CONSTRAINT "LeadInquiry_name_nonempty" CHECK (length(btrim("name")) > 0),
    CONSTRAINT "LeadInquiry_contact_nonempty" CHECK (length(btrim("contact")) > 0),
    CONSTRAINT "LeadInquiry_question_nonempty" CHECK (length(btrim("question")) > 0),
    CONSTRAINT "LeadInquiry_expiry_after_create" CHECK ("expiresAt" > "createdAt")
);

CREATE TABLE "LeadHotelStay" (
    "inquiryId" TEXT NOT NULL,
    "roomType" VARCHAR(100),
    "checkIn" DATE,
    "checkOut" DATE,
    "guests" INTEGER,
    CONSTRAINT "LeadHotelStay_pkey" PRIMARY KEY ("inquiryId"),
    CONSTRAINT "LeadHotelStay_guests_positive" CHECK ("guests" IS NULL OR ("guests" BETWEEN 1 AND 8)),
    CONSTRAINT "LeadHotelStay_dates_ordered" CHECK ("checkIn" IS NULL OR "checkOut" IS NULL OR "checkOut" > "checkIn")
);

CREATE TABLE "LeadInquiryStatusEvent" (
    "id" TEXT NOT NULL,
    "inquiryId" TEXT NOT NULL,
    "actorId" VARCHAR(128) NOT NULL,
    "previousStatus" "LeadInquiryStatus" NOT NULL,
    "nextStatus" "LeadInquiryStatus" NOT NULL,
    "version" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "LeadInquiryStatusEvent_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "LeadInquiryStatusEvent_version_check" CHECK ("version" >= 2),
    CONSTRAINT "LeadInquiryStatusEvent_changed" CHECK ("previousStatus" <> "nextStatus"),
    CONSTRAINT "LeadInquiryStatusEvent_actor_nonempty" CHECK (length(btrim("actorId")) > 0)
);

CREATE UNIQUE INDEX "LeadInquiry_businessId_idempotencyKey_key"
    ON "LeadInquiry"("businessId", "idempotencyKey");
CREATE INDEX "LeadInquiry_businessId_createdAt_id_idx"
    ON "LeadInquiry"("businessId", "createdAt", "id");
CREATE INDEX "LeadInquiry_businessId_status_createdAt_idx"
    ON "LeadInquiry"("businessId", "status", "createdAt");
CREATE INDEX "LeadInquiry_expiresAt_idx" ON "LeadInquiry"("expiresAt");
CREATE UNIQUE INDEX "LeadInquiryStatusEvent_inquiryId_version_key"
    ON "LeadInquiryStatusEvent"("inquiryId", "version");
CREATE INDEX "LeadInquiryStatusEvent_inquiryId_createdAt_idx"
    ON "LeadInquiryStatusEvent"("inquiryId", "createdAt");

ALTER TABLE "LeadHotelStay" ADD CONSTRAINT "LeadHotelStay_inquiryId_fkey"
    FOREIGN KEY ("inquiryId") REFERENCES "LeadInquiry"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "LeadInquiryStatusEvent" ADD CONSTRAINT "LeadInquiryStatusEvent_inquiryId_fkey"
    FOREIGN KEY ("inquiryId") REFERENCES "LeadInquiry"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
