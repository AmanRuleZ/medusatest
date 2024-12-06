import { Migration } from '@mikro-orm/migrations';

export class Migration20241206104339 extends Migration {

  async up(): Promise<void> {
    this.addSql('create table if not exists "advanced_product_price" ("id" text not null, "listPrice" numeric not null, "msrp" numeric not null, "msp" numeric not null, "raw_listPrice" jsonb not null, "raw_msrp" jsonb not null, "raw_msp" jsonb not null, "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "deleted_at" timestamptz null, constraint "advanced_product_price_pkey" primary key ("id"));');
    this.addSql('CREATE INDEX IF NOT EXISTS "IDX_advanced_product_price_deleted_at" ON "advanced_product_price" (deleted_at) WHERE deleted_at IS NULL;');
  }

  async down(): Promise<void> {
    this.addSql('drop table if exists "advanced_product_price" cascade;');
  }

}
