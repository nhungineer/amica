-- CreateEnum
CREATE TYPE "VenueType" AS ENUM ('RESTAURANT', 'CAFE', 'BAR', 'PARK');

-- AlterTable
ALTER TABLE "gatherings" ADD COLUMN     "venue_type" "VenueType" NOT NULL DEFAULT 'RESTAURANT';
