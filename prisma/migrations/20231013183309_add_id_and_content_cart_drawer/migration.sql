/*
  Warnings:

  - The primary key for the `themeId` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - Added the required column `contentCartDrawer` to the `themeId` table without a default value. This is not possible if the table is not empty.
  - Added the required column `id` to the `themeId` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_themeId" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "shop" TEXT NOT NULL,
    "theme_id" TEXT NOT NULL,
    "contentCartDrawer" TEXT NOT NULL
);
INSERT INTO "new_themeId" ("shop", "theme_id") SELECT "shop", "theme_id" FROM "themeId";
DROP TABLE "themeId";
ALTER TABLE "new_themeId" RENAME TO "themeId";
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
