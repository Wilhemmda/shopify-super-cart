/*
  Warnings:

  - The primary key for the `themeId` table will be changed. If it partially fails, the table could be left without primary key constraint.

*/
-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_themeId" (
    "shop" TEXT NOT NULL,
    "theme_id" TEXT NOT NULL PRIMARY KEY
);
INSERT INTO "new_themeId" ("shop", "theme_id") SELECT "shop", "theme_id" FROM "themeId";
DROP TABLE "themeId";
ALTER TABLE "new_themeId" RENAME TO "themeId";
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
