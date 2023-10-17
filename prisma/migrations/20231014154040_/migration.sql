/*
  Warnings:

  - You are about to alter the column `theme_id` on the `themeId` table. The data in that column could be lost. The data in that column will be cast from `String` to `Int`.

*/
-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_themeId" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "shop" TEXT NOT NULL,
    "theme_id" INTEGER NOT NULL,
    "contentCartDrawer" TEXT NOT NULL
);
INSERT INTO "new_themeId" ("contentCartDrawer", "id", "shop", "theme_id") SELECT "contentCartDrawer", "id", "shop", "theme_id" FROM "themeId";
DROP TABLE "themeId";
ALTER TABLE "new_themeId" RENAME TO "themeId";
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
