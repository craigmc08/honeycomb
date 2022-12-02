/*
  Warnings:

  - You are about to alter the column `ownerId` on the `Recipe` table. The data in that column could be lost. The data in that column will be cast from `String` to `Int`.
  - The primary key for the `User` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to alter the column `id` on the `User` table. The data in that column could be lost. The data in that column will be cast from `String` to `Int`.
  - You are about to alter the column `ownerId` on the `RecipeTag` table. The data in that column could be lost. The data in that column will be cast from `String` to `Int`.

*/
-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Recipe" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "slug" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "source" TEXT,
    "description" TEXT NOT NULL,
    "time" TEXT NOT NULL,
    "servings" TEXT NOT NULL,
    "imageURI" TEXT,
    "public" BOOLEAN NOT NULL DEFAULT false,
    "instructions" TEXT NOT NULL,
    "ownerId" INTEGER NOT NULL,
    CONSTRAINT "Recipe_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_Recipe" ("description", "id", "imageURI", "instructions", "ownerId", "public", "servings", "slug", "source", "time", "title") SELECT "description", "id", "imageURI", "instructions", "ownerId", "public", "servings", "slug", "source", "time", "title" FROM "Recipe";
DROP TABLE "Recipe";
ALTER TABLE "new_Recipe" RENAME TO "Recipe";
CREATE UNIQUE INDEX "Recipe_slug_key" ON "Recipe"("slug");
CREATE TABLE "new_User" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "password" TEXT NOT NULL
);
INSERT INTO "new_User" ("id", "name", "password", "username") SELECT "id", "name", "password", "username" FROM "User";
DROP TABLE "User";
ALTER TABLE "new_User" RENAME TO "User";
CREATE UNIQUE INDEX "User_username_key" ON "User"("username");
CREATE TABLE "new_RecipeTag" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "slug" TEXT NOT NULL,
    "tag" TEXT NOT NULL,
    "ownerId" INTEGER NOT NULL,
    CONSTRAINT "RecipeTag_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_RecipeTag" ("id", "ownerId", "slug", "tag") SELECT "id", "ownerId", "slug", "tag" FROM "RecipeTag";
DROP TABLE "RecipeTag";
ALTER TABLE "new_RecipeTag" RENAME TO "RecipeTag";
CREATE UNIQUE INDEX "RecipeTag_slug_key" ON "RecipeTag"("slug");
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
