import { MigrationInterface, QueryRunner } from "typeorm";

export class UpdateUserAndNewEntities1746770362871 implements MigrationInterface {
    name = 'UpdateUserAndNewEntities1746770362871'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "likes" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "createdAt" datetime NOT NULL DEFAULT (datetime('now')), "userId" integer, "postId" integer, CONSTRAINT "UQ_74b9b8cd79a1014e50135f266fe" UNIQUE ("userId", "postId"))`);
        await queryRunner.query(`CREATE INDEX "IDX_cfd8e81fac09d7339a32e57d90" ON "likes" ("userId") `);
        await queryRunner.query(`CREATE INDEX "IDX_e2fe567ad8d305fefc918d44f5" ON "likes" ("postId") `);
        await queryRunner.query(`CREATE INDEX "IDX_4d12a0f239ec4e5a8ab5d4393a" ON "likes" ("createdAt") `);
        await queryRunner.query(`CREATE TABLE "hashtags" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "tag" varchar(255) NOT NULL, "createdAt" datetime NOT NULL DEFAULT (datetime('now')), "updatedAt" datetime NOT NULL DEFAULT (datetime('now')), CONSTRAINT "UQ_0b4ef8e83392129fb3373fdb3af" UNIQUE ("tag"))`);
        await queryRunner.query(`CREATE INDEX "IDX_0b4ef8e83392129fb3373fdb3a" ON "hashtags" ("tag") `);
        await queryRunner.query(`CREATE TABLE "posts" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "content" text NOT NULL, "likeCount" integer NOT NULL DEFAULT (0), "createdAt" datetime NOT NULL DEFAULT (datetime('now')), "updatedAt" datetime NOT NULL DEFAULT (datetime('now')), "authorId" integer)`);
        await queryRunner.query(`CREATE INDEX "IDX_c5a322ad12a7bf95460c958e80" ON "posts" ("authorId") `);
        await queryRunner.query(`CREATE INDEX "IDX_46bc204f43827b6f25e0133dbf" ON "posts" ("createdAt") `);
        await queryRunner.query(`CREATE TABLE "follows" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "createdAt" datetime NOT NULL DEFAULT (datetime('now')), "followerId" integer, "followingId" integer, CONSTRAINT "UQ_105079775692df1f8799ed0fac8" UNIQUE ("followerId", "followingId"))`);
        await queryRunner.query(`CREATE INDEX "IDX_fdb91868b03a2040db408a5333" ON "follows" ("followerId") `);
        await queryRunner.query(`CREATE INDEX "IDX_ef463dd9a2ce0d673350e36e0f" ON "follows" ("followingId") `);
        await queryRunner.query(`CREATE INDEX "IDX_7054aca7a8916bb67624ee7b09" ON "follows" ("createdAt") `);
        await queryRunner.query(`CREATE TABLE "post_hashtags" ("post_id" integer NOT NULL, "hashtag_id" integer NOT NULL, PRIMARY KEY ("post_id", "hashtag_id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_6c16a0f366b0642259bbe50481" ON "post_hashtags" ("post_id") `);
        await queryRunner.query(`CREATE INDEX "IDX_41f5ee7a97e67023d7461fa8f4" ON "post_hashtags" ("hashtag_id") `);
        await queryRunner.query(`CREATE TABLE "temporary_users" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "firstName" varchar(255) NOT NULL, "lastName" varchar(255) NOT NULL, "email" varchar(255) NOT NULL, "createdAt" datetime NOT NULL DEFAULT (datetime('now')), "updatedAt" datetime NOT NULL DEFAULT (datetime('now')), CONSTRAINT "UQ_97672ac88f789774dd47f7c8be3" UNIQUE ("email"))`);
        await queryRunner.query(`INSERT INTO "temporary_users"("id", "firstName", "lastName", "email", "createdAt", "updatedAt") SELECT "id", "firstName", "lastName", "email", "createdAt", "updatedAt" FROM "users"`);
        await queryRunner.query(`DROP TABLE "users"`);
        await queryRunner.query(`ALTER TABLE "temporary_users" RENAME TO "users"`);
        await queryRunner.query(`CREATE INDEX "IDX_97672ac88f789774dd47f7c8be" ON "users" ("email") `);
        await queryRunner.query(`DROP INDEX "IDX_cfd8e81fac09d7339a32e57d90"`);
        await queryRunner.query(`DROP INDEX "IDX_e2fe567ad8d305fefc918d44f5"`);
        await queryRunner.query(`DROP INDEX "IDX_4d12a0f239ec4e5a8ab5d4393a"`);
        await queryRunner.query(`CREATE TABLE "temporary_likes" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "createdAt" datetime NOT NULL DEFAULT (datetime('now')), "userId" integer, "postId" integer, CONSTRAINT "UQ_74b9b8cd79a1014e50135f266fe" UNIQUE ("userId", "postId"), CONSTRAINT "FK_cfd8e81fac09d7339a32e57d904" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE NO ACTION, CONSTRAINT "FK_e2fe567ad8d305fefc918d44f50" FOREIGN KEY ("postId") REFERENCES "posts" ("id") ON DELETE CASCADE ON UPDATE NO ACTION)`);
        await queryRunner.query(`INSERT INTO "temporary_likes"("id", "createdAt", "userId", "postId") SELECT "id", "createdAt", "userId", "postId" FROM "likes"`);
        await queryRunner.query(`DROP TABLE "likes"`);
        await queryRunner.query(`ALTER TABLE "temporary_likes" RENAME TO "likes"`);
        await queryRunner.query(`CREATE INDEX "IDX_cfd8e81fac09d7339a32e57d90" ON "likes" ("userId") `);
        await queryRunner.query(`CREATE INDEX "IDX_e2fe567ad8d305fefc918d44f5" ON "likes" ("postId") `);
        await queryRunner.query(`CREATE INDEX "IDX_4d12a0f239ec4e5a8ab5d4393a" ON "likes" ("createdAt") `);
        await queryRunner.query(`DROP INDEX "IDX_c5a322ad12a7bf95460c958e80"`);
        await queryRunner.query(`DROP INDEX "IDX_46bc204f43827b6f25e0133dbf"`);
        await queryRunner.query(`CREATE TABLE "temporary_posts" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "content" text NOT NULL, "likeCount" integer NOT NULL DEFAULT (0), "createdAt" datetime NOT NULL DEFAULT (datetime('now')), "updatedAt" datetime NOT NULL DEFAULT (datetime('now')), "authorId" integer, CONSTRAINT "FK_c5a322ad12a7bf95460c958e80e" FOREIGN KEY ("authorId") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE NO ACTION)`);
        await queryRunner.query(`INSERT INTO "temporary_posts"("id", "content", "likeCount", "createdAt", "updatedAt", "authorId") SELECT "id", "content", "likeCount", "createdAt", "updatedAt", "authorId" FROM "posts"`);
        await queryRunner.query(`DROP TABLE "posts"`);
        await queryRunner.query(`ALTER TABLE "temporary_posts" RENAME TO "posts"`);
        await queryRunner.query(`CREATE INDEX "IDX_c5a322ad12a7bf95460c958e80" ON "posts" ("authorId") `);
        await queryRunner.query(`CREATE INDEX "IDX_46bc204f43827b6f25e0133dbf" ON "posts" ("createdAt") `);
        await queryRunner.query(`DROP INDEX "IDX_fdb91868b03a2040db408a5333"`);
        await queryRunner.query(`DROP INDEX "IDX_ef463dd9a2ce0d673350e36e0f"`);
        await queryRunner.query(`DROP INDEX "IDX_7054aca7a8916bb67624ee7b09"`);
        await queryRunner.query(`CREATE TABLE "temporary_follows" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "createdAt" datetime NOT NULL DEFAULT (datetime('now')), "followerId" integer, "followingId" integer, CONSTRAINT "UQ_105079775692df1f8799ed0fac8" UNIQUE ("followerId", "followingId"), CONSTRAINT "FK_fdb91868b03a2040db408a53331" FOREIGN KEY ("followerId") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE NO ACTION, CONSTRAINT "FK_ef463dd9a2ce0d673350e36e0fb" FOREIGN KEY ("followingId") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE NO ACTION)`);
        await queryRunner.query(`INSERT INTO "temporary_follows"("id", "createdAt", "followerId", "followingId") SELECT "id", "createdAt", "followerId", "followingId" FROM "follows"`);
        await queryRunner.query(`DROP TABLE "follows"`);
        await queryRunner.query(`ALTER TABLE "temporary_follows" RENAME TO "follows"`);
        await queryRunner.query(`CREATE INDEX "IDX_fdb91868b03a2040db408a5333" ON "follows" ("followerId") `);
        await queryRunner.query(`CREATE INDEX "IDX_ef463dd9a2ce0d673350e36e0f" ON "follows" ("followingId") `);
        await queryRunner.query(`CREATE INDEX "IDX_7054aca7a8916bb67624ee7b09" ON "follows" ("createdAt") `);
        await queryRunner.query(`DROP INDEX "IDX_6c16a0f366b0642259bbe50481"`);
        await queryRunner.query(`DROP INDEX "IDX_41f5ee7a97e67023d7461fa8f4"`);
        await queryRunner.query(`CREATE TABLE "temporary_post_hashtags" ("post_id" integer NOT NULL, "hashtag_id" integer NOT NULL, CONSTRAINT "FK_6c16a0f366b0642259bbe50481c" FOREIGN KEY ("post_id") REFERENCES "posts" ("id") ON DELETE CASCADE ON UPDATE CASCADE, CONSTRAINT "FK_41f5ee7a97e67023d7461fa8f43" FOREIGN KEY ("hashtag_id") REFERENCES "hashtags" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION, PRIMARY KEY ("post_id", "hashtag_id"))`);
        await queryRunner.query(`INSERT INTO "temporary_post_hashtags"("post_id", "hashtag_id") SELECT "post_id", "hashtag_id" FROM "post_hashtags"`);
        await queryRunner.query(`DROP TABLE "post_hashtags"`);
        await queryRunner.query(`ALTER TABLE "temporary_post_hashtags" RENAME TO "post_hashtags"`);
        await queryRunner.query(`CREATE INDEX "IDX_6c16a0f366b0642259bbe50481" ON "post_hashtags" ("post_id") `);
        await queryRunner.query(`CREATE INDEX "IDX_41f5ee7a97e67023d7461fa8f4" ON "post_hashtags" ("hashtag_id") `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX "IDX_41f5ee7a97e67023d7461fa8f4"`);
        await queryRunner.query(`DROP INDEX "IDX_6c16a0f366b0642259bbe50481"`);
        await queryRunner.query(`ALTER TABLE "post_hashtags" RENAME TO "temporary_post_hashtags"`);
        await queryRunner.query(`CREATE TABLE "post_hashtags" ("post_id" integer NOT NULL, "hashtag_id" integer NOT NULL, PRIMARY KEY ("post_id", "hashtag_id"))`);
        await queryRunner.query(`INSERT INTO "post_hashtags"("post_id", "hashtag_id") SELECT "post_id", "hashtag_id" FROM "temporary_post_hashtags"`);
        await queryRunner.query(`DROP TABLE "temporary_post_hashtags"`);
        await queryRunner.query(`CREATE INDEX "IDX_41f5ee7a97e67023d7461fa8f4" ON "post_hashtags" ("hashtag_id") `);
        await queryRunner.query(`CREATE INDEX "IDX_6c16a0f366b0642259bbe50481" ON "post_hashtags" ("post_id") `);
        await queryRunner.query(`DROP INDEX "IDX_7054aca7a8916bb67624ee7b09"`);
        await queryRunner.query(`DROP INDEX "IDX_ef463dd9a2ce0d673350e36e0f"`);
        await queryRunner.query(`DROP INDEX "IDX_fdb91868b03a2040db408a5333"`);
        await queryRunner.query(`ALTER TABLE "follows" RENAME TO "temporary_follows"`);
        await queryRunner.query(`CREATE TABLE "follows" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "createdAt" datetime NOT NULL DEFAULT (datetime('now')), "followerId" integer, "followingId" integer, CONSTRAINT "UQ_105079775692df1f8799ed0fac8" UNIQUE ("followerId", "followingId"))`);
        await queryRunner.query(`INSERT INTO "follows"("id", "createdAt", "followerId", "followingId") SELECT "id", "createdAt", "followerId", "followingId" FROM "temporary_follows"`);
        await queryRunner.query(`DROP TABLE "temporary_follows"`);
        await queryRunner.query(`CREATE INDEX "IDX_7054aca7a8916bb67624ee7b09" ON "follows" ("createdAt") `);
        await queryRunner.query(`CREATE INDEX "IDX_ef463dd9a2ce0d673350e36e0f" ON "follows" ("followingId") `);
        await queryRunner.query(`CREATE INDEX "IDX_fdb91868b03a2040db408a5333" ON "follows" ("followerId") `);
        await queryRunner.query(`DROP INDEX "IDX_46bc204f43827b6f25e0133dbf"`);
        await queryRunner.query(`DROP INDEX "IDX_c5a322ad12a7bf95460c958e80"`);
        await queryRunner.query(`ALTER TABLE "posts" RENAME TO "temporary_posts"`);
        await queryRunner.query(`CREATE TABLE "posts" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "content" text NOT NULL, "likeCount" integer NOT NULL DEFAULT (0), "createdAt" datetime NOT NULL DEFAULT (datetime('now')), "updatedAt" datetime NOT NULL DEFAULT (datetime('now')), "authorId" integer)`);
        await queryRunner.query(`INSERT INTO "posts"("id", "content", "likeCount", "createdAt", "updatedAt", "authorId") SELECT "id", "content", "likeCount", "createdAt", "updatedAt", "authorId" FROM "temporary_posts"`);
        await queryRunner.query(`DROP TABLE "temporary_posts"`);
        await queryRunner.query(`CREATE INDEX "IDX_46bc204f43827b6f25e0133dbf" ON "posts" ("createdAt") `);
        await queryRunner.query(`CREATE INDEX "IDX_c5a322ad12a7bf95460c958e80" ON "posts" ("authorId") `);
        await queryRunner.query(`DROP INDEX "IDX_4d12a0f239ec4e5a8ab5d4393a"`);
        await queryRunner.query(`DROP INDEX "IDX_e2fe567ad8d305fefc918d44f5"`);
        await queryRunner.query(`DROP INDEX "IDX_cfd8e81fac09d7339a32e57d90"`);
        await queryRunner.query(`ALTER TABLE "likes" RENAME TO "temporary_likes"`);
        await queryRunner.query(`CREATE TABLE "likes" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "createdAt" datetime NOT NULL DEFAULT (datetime('now')), "userId" integer, "postId" integer, CONSTRAINT "UQ_74b9b8cd79a1014e50135f266fe" UNIQUE ("userId", "postId"))`);
        await queryRunner.query(`INSERT INTO "likes"("id", "createdAt", "userId", "postId") SELECT "id", "createdAt", "userId", "postId" FROM "temporary_likes"`);
        await queryRunner.query(`DROP TABLE "temporary_likes"`);
        await queryRunner.query(`CREATE INDEX "IDX_4d12a0f239ec4e5a8ab5d4393a" ON "likes" ("createdAt") `);
        await queryRunner.query(`CREATE INDEX "IDX_e2fe567ad8d305fefc918d44f5" ON "likes" ("postId") `);
        await queryRunner.query(`CREATE INDEX "IDX_cfd8e81fac09d7339a32e57d90" ON "likes" ("userId") `);
        await queryRunner.query(`DROP INDEX "IDX_97672ac88f789774dd47f7c8be"`);
        await queryRunner.query(`ALTER TABLE "users" RENAME TO "temporary_users"`);
        await queryRunner.query(`CREATE TABLE "users" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "firstName" varchar(255) NOT NULL, "lastName" varchar(255) NOT NULL, "email" varchar(255) NOT NULL, "createdAt" datetime NOT NULL DEFAULT (CURRENT_TIMESTAMP), "updatedAt" datetime NOT NULL DEFAULT (CURRENT_TIMESTAMP), CONSTRAINT "UQ_97672ac88f789774dd47f7c8be3" UNIQUE ("email"))`);
        await queryRunner.query(`INSERT INTO "users"("id", "firstName", "lastName", "email", "createdAt", "updatedAt") SELECT "id", "firstName", "lastName", "email", "createdAt", "updatedAt" FROM "temporary_users"`);
        await queryRunner.query(`DROP TABLE "temporary_users"`);
        await queryRunner.query(`DROP INDEX "IDX_41f5ee7a97e67023d7461fa8f4"`);
        await queryRunner.query(`DROP INDEX "IDX_6c16a0f366b0642259bbe50481"`);
        await queryRunner.query(`DROP TABLE "post_hashtags"`);
        await queryRunner.query(`DROP INDEX "IDX_7054aca7a8916bb67624ee7b09"`);
        await queryRunner.query(`DROP INDEX "IDX_ef463dd9a2ce0d673350e36e0f"`);
        await queryRunner.query(`DROP INDEX "IDX_fdb91868b03a2040db408a5333"`);
        await queryRunner.query(`DROP TABLE "follows"`);
        await queryRunner.query(`DROP INDEX "IDX_46bc204f43827b6f25e0133dbf"`);
        await queryRunner.query(`DROP INDEX "IDX_c5a322ad12a7bf95460c958e80"`);
        await queryRunner.query(`DROP TABLE "posts"`);
        await queryRunner.query(`DROP INDEX "IDX_0b4ef8e83392129fb3373fdb3a"`);
        await queryRunner.query(`DROP TABLE "hashtags"`);
        await queryRunner.query(`DROP INDEX "IDX_4d12a0f239ec4e5a8ab5d4393a"`);
        await queryRunner.query(`DROP INDEX "IDX_e2fe567ad8d305fefc918d44f5"`);
        await queryRunner.query(`DROP INDEX "IDX_cfd8e81fac09d7339a32e57d90"`);
        await queryRunner.query(`DROP TABLE "likes"`);
    }

}
