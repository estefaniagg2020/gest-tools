-- Rename table BonoTemplate to Bono (empresa tiene muchos bonos)
ALTER TABLE "BonoTemplate" RENAME TO "Bono";

-- Rename ClientBono.templateId to bonoId (bono asociado a muchos clientes)
ALTER TABLE "ClientBono" RENAME COLUMN "templateId" TO "bonoId";
