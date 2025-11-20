/*
  Warnings:

  - Added the required column `columnIndex` to the `Shipment` table without a default value. This is not possible if the table is not empty.

*/
-- CreateTable
CREATE TABLE "DailyYardInfo" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "date" TEXT NOT NULL,
    "loadingPerson" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Shipment" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "date" TEXT NOT NULL,
    "columnIndex" INTEGER NOT NULL,
    "trailer" TEXT NOT NULL,
    "time" TEXT,
    "destination" TEXT,
    "cargo" TEXT,
    "remarks" TEXT,
    "category" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_Shipment" ("cargo", "category", "createdAt", "date", "destination", "id", "remarks", "time", "trailer", "updatedAt") SELECT "cargo", "category", "createdAt", "date", "destination", "id", "remarks", "time", "trailer", "updatedAt" FROM "Shipment";
DROP TABLE "Shipment";
ALTER TABLE "new_Shipment" RENAME TO "Shipment";
CREATE UNIQUE INDEX "Shipment_date_columnIndex_category_key" ON "Shipment"("date", "columnIndex", "category");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE UNIQUE INDEX "DailyYardInfo_date_key" ON "DailyYardInfo"("date");
