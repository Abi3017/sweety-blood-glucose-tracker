-- CreateEnum
CREATE TYPE "TimeSlot" AS ENUM ('MORNING', 'AFTER_BREAKFAST', 'AFTER_LUNCH', 'AFTER_DINNER');

-- CreateTable
CREATE TABLE "users" (
    "id" UUID NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "email" VARCHAR(255) NOT NULL,
    "password" VARCHAR(255) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "readings" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "reading_date" DATE NOT NULL,
    "time_slot" "TimeSlot" NOT NULL,
    "glucose_value" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "readings_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE INDEX "readings_user_id_reading_date_idx" ON "readings"("user_id", "reading_date");

-- CreateIndex
CREATE INDEX "readings_reading_date_idx" ON "readings"("reading_date");

-- CreateIndex
CREATE UNIQUE INDEX "readings_user_id_reading_date_time_slot_key" ON "readings"("user_id", "reading_date", "time_slot");

-- AddForeignKey
ALTER TABLE "readings" ADD CONSTRAINT "readings_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Database-level guard for the glucose range rule (whole numbers 40–600 mg/dL).
ALTER TABLE "readings"
  ADD CONSTRAINT "readings_glucose_value_range_check"
  CHECK ("glucose_value" BETWEEN 40 AND 600);
