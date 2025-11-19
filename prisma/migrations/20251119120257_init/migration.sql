-- CreateTable
CREATE TABLE "DispatchEntry" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "date" TEXT NOT NULL,
    "vehicleId" TEXT NOT NULL,
    "slotIndex" INTEGER NOT NULL,
    "pickup" TEXT,
    "delivery" TEXT,
    "updatedAt" DATETIME NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "DispatchEntry_date_vehicleId_slotIndex_key" ON "DispatchEntry"("date", "vehicleId", "slotIndex");
