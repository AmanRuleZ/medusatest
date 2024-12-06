import { Migration } from "@mikro-orm/migrations";

export class Migration20241201145839 extends Migration {
    async up(): Promise<void> {
        this.addSql(
            'create table if not exists "outlet" ("id" text not null, "is_outlet" boolean not null, "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "deleted_at" timestamptz null, constraint "outlet_pkey" primary key ("id"));',
        );
        this.addSql(
            'CREATE INDEX IF NOT EXISTS "IDX_outlet_deleted_at" ON "outlet" (deleted_at) WHERE deleted_at IS NULL;',
        );
    }

    async down(): Promise<void> {
        this.addSql('drop table if exists "outlet" cascade;');
    }
}
