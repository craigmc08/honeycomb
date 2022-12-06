/*
  Warnings:

  - Added the required column `color` to the `RecipeTag` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_RecipeTag" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "slug" TEXT NOT NULL,
    "tag" TEXT NOT NULL,
    "color" TEXT NOT NULL,
    "ownerId" INTEGER NOT NULL,
    CONSTRAINT "RecipeTag_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_RecipeTag" ("id", "ownerId", "slug", "tag") SELECT "id", "ownerId", "slug", "tag" FROM "RecipeTag";
DROP TABLE "RecipeTag";
ALTER TABLE "new_RecipeTag" RENAME TO "RecipeTag";
CREATE UNIQUE INDEX "RecipeTag_slug_key" ON "RecipeTag"("slug");
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
