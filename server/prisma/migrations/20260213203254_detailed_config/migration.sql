-- CreateEnum
CREATE TYPE "SidebarPosition" AS ENUM ('left', 'right', 'none');

-- CreateEnum
CREATE TYPE "CalendarAppearance" AS ENUM ('default', 'compact', 'spacious');

-- AlterTable
ALTER TABLE "GestorConfig" ADD COLUMN     "agendaBg" TEXT NOT NULL DEFAULT '#ffffff',
ADD COLUMN     "calendarAppearance" "CalendarAppearance" NOT NULL DEFAULT 'default',
ADD COLUMN     "endHour" INTEGER NOT NULL DEFAULT 20,
ADD COLUMN     "markedDaysColor" TEXT NOT NULL DEFAULT '#3498db',
ADD COLUMN     "maxPeoplePerSlot" INTEGER NOT NULL DEFAULT 1,
ADD COLUMN     "sameColorsForAll" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "showNavbar" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "sidebarModuleIds" TEXT[] DEFAULT ARRAY['inicio', 'agenda', 'equipo', 'centros', 'config']::TEXT[],
ADD COLUMN     "sidebarPosition" "SidebarPosition" NOT NULL DEFAULT 'left',
ADD COLUMN     "slotDurationMinutes" INTEGER NOT NULL DEFAULT 60,
ADD COLUMN     "startHour" INTEGER NOT NULL DEFAULT 9,
ADD COLUMN     "vacationColor" TEXT NOT NULL DEFAULT '#e74c3c',
ADD COLUMN     "workDaysPerWeek" INTEGER NOT NULL DEFAULT 5;
