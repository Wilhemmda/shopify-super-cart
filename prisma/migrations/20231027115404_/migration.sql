/*
  Warnings:

  - Added the required column `shop` to the `superCart` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_superCart" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "shop" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "option1" TEXT NOT NULL,
    "form" TEXT NOT NULL,
    "option2" TEXT NOT NULL,
    "total" TEXT NOT NULL,
    "option3" TEXT NOT NULL,
    "footer" TEXT NOT NULL
);
INSERT INTO "new_superCart" ("footer", "form", "id", "option1", "option2", "option3", "title", "total") SELECT "footer", "form", "id", "option1", "option2", "option3", "title", "total" FROM "superCart";
DROP TABLE "superCart";
ALTER TABLE "new_superCart" RENAME TO "superCart";
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
