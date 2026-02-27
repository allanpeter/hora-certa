import { MigrationInterface, QueryRunner, Table, TableForeignKey } from 'typeorm';

export class InitialSchema1704081600000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create enum types
    await queryRunner.query(`
      CREATE TYPE "public"."users_user_type_enum" AS ENUM('BARBER', 'CLIENT', 'OWNER')
    `);

    await queryRunner.query(`
      CREATE TYPE "public"."tenant_users_role_enum" AS ENUM('OWNER', 'MANAGER', 'BARBER', 'RECEPTIONIST')
    `);

    await queryRunner.query(`
      CREATE TYPE "public"."appointments_status_enum" AS ENUM('SCHEDULED', 'CONFIRMED', 'COMPLETED', 'CANCELLED', 'NO_SHOW')
    `);

    await queryRunner.query(`
      CREATE TYPE "public"."appointments_payment_status_enum" AS ENUM('PENDING', 'COMPLETED', 'FAILED', 'REFUNDED')
    `);

    await queryRunner.query(`
      CREATE TYPE "public"."payments_status_enum" AS ENUM('PENDING', 'COMPLETED', 'FAILED', 'REFUNDED')
    `);

    await queryRunner.query(`
      CREATE TYPE "public"."payments_method_enum" AS ENUM('CASH', 'CARD', 'PIX', 'TRANSFER')
    `);

    await queryRunner.query(`
      CREATE TYPE "public"."services_category_enum" AS ENUM('HAIR', 'BEARD', 'COMBO', 'PRODUCT')
    `);

    await queryRunner.query(`
      CREATE TYPE "public"."customers_gender_enum" AS ENUM('MALE', 'FEMALE', 'OTHER')
    `);

    await queryRunner.query(`
      CREATE TYPE "public"."loyalty_transactions_type_enum" AS ENUM('EARNED', 'REDEEMED', 'ADJUSTED')
    `);

    // Tenants table
    await queryRunner.createTable(
      new Table({
        name: 'tenants',
        columns: [
          { name: 'id', type: 'uuid', isPrimary: true, generationStrategy: 'uuid', default: 'uuid_generate_v4()' },
          { name: 'slug', type: 'varchar', isUnique: true, isNullable: false },
          { name: 'name', type: 'varchar', isNullable: false },
          { name: 'owner_id', type: 'uuid', isNullable: false },
          { name: 'address', type: 'varchar', isNullable: true },
          { name: 'phone', type: 'varchar', isNullable: true },
          { name: 'pix_key', type: 'varchar', isNullable: true },
          { name: 'logo_url', type: 'varchar', isNullable: true },
          { name: 'theme', type: 'jsonb', isNullable: true },
          { name: 'settings', type: 'jsonb', isNullable: true },
          { name: 'subscription_tier', type: 'varchar', default: `'FREE'`, isNullable: false },
          { name: 'subscription_active', type: 'boolean', default: true, isNullable: false },
          { name: 'created_at', type: 'timestamp', default: 'now()', isNullable: false },
          { name: 'updated_at', type: 'timestamp', default: 'now()', isNullable: false },
        ],
        indices: [
          { columnNames: ['slug'] },
        ],
      }),
      true,
    );

    // Users table
    await queryRunner.createTable(
      new Table({
        name: 'users',
        columns: [
          { name: 'id', type: 'uuid', isPrimary: true, generationStrategy: 'uuid', default: 'uuid_generate_v4()' },
          { name: 'email', type: 'varchar', isUnique: true, isNullable: false },
          { name: 'password_hash', type: 'varchar', isNullable: true },
          { name: 'name', type: 'varchar', isNullable: false },
          { name: 'phone', type: 'varchar', isNullable: true },
          { name: 'avatar_url', type: 'varchar', isNullable: true },
          { name: 'user_type', type: 'enum', enum: ['BARBER', 'CLIENT', 'OWNER'], isNullable: false },
          { name: 'created_at', type: 'timestamp', default: 'now()', isNullable: false },
          { name: 'updated_at', type: 'timestamp', default: 'now()', isNullable: false },
        ],
        indices: [
          { columnNames: ['email'] },
        ],
      }),
      true,
    );

    // TenantUsers table
    await queryRunner.createTable(
      new Table({
        name: 'tenant_users',
        columns: [
          { name: 'id', type: 'uuid', isPrimary: true, generationStrategy: 'uuid', default: 'uuid_generate_v4()' },
          { name: 'tenant_id', type: 'uuid', isNullable: false },
          { name: 'user_id', type: 'uuid', isNullable: false },
          { name: 'role', type: 'enum', enum: ['OWNER', 'MANAGER', 'BARBER', 'RECEPTIONIST'], isNullable: false },
          { name: 'created_at', type: 'timestamp', default: 'now()', isNullable: false },
          { name: 'updated_at', type: 'timestamp', default: 'now()', isNullable: false },
        ],
        indices: [
          { columnNames: ['tenant_id'] },
          { columnNames: ['user_id'] },
          { columnNames: ['tenant_id', 'user_id'], isUnique: true },
        ],
        foreignKeys: [
          new TableForeignKey({
            columnNames: ['tenant_id'],
            referencedTableName: 'tenants',
            referencedColumnNames: ['id'],
            onDelete: 'CASCADE',
          }),
          new TableForeignKey({
            columnNames: ['user_id'],
            referencedTableName: 'users',
            referencedColumnNames: ['id'],
            onDelete: 'CASCADE',
          }),
        ],
      }),
      true,
    );

    // Customers table
    await queryRunner.createTable(
      new Table({
        name: 'customers',
        columns: [
          { name: 'id', type: 'uuid', isPrimary: true, generationStrategy: 'uuid', default: 'uuid_generate_v4()' },
          { name: 'tenant_id', type: 'uuid', isNullable: false },
          { name: 'user_id', type: 'uuid', isNullable: true },
          { name: 'name', type: 'varchar', isNullable: false },
          { name: 'email', type: 'varchar', isNullable: true },
          { name: 'phone', type: 'varchar', isNullable: true },
          { name: 'gender', type: 'enum', enum: ['MALE', 'FEMALE', 'OTHER'], isNullable: true },
          { name: 'birthday', type: 'date', isNullable: true },
          { name: 'notes', type: 'text', isNullable: true },
          { name: 'avatar_url', type: 'varchar', isNullable: true },
          { name: 'preferred_barber_id', type: 'uuid', isNullable: true },
          { name: 'total_spent', type: 'numeric', precision: 10, scale: 2, default: 0, isNullable: false },
          { name: 'visit_count', type: 'int', default: 0, isNullable: false },
          { name: 'last_visit', type: 'timestamp', isNullable: true },
          { name: 'contact_preferences', type: 'jsonb', isNullable: true },
          { name: 'created_at', type: 'timestamp', default: 'now()', isNullable: false },
          { name: 'updated_at', type: 'timestamp', default: 'now()', isNullable: false },
        ],
        indices: [
          { columnNames: ['tenant_id'] },
        ],
        foreignKeys: [
          new TableForeignKey({
            columnNames: ['tenant_id'],
            referencedTableName: 'tenants',
            referencedColumnNames: ['id'],
            onDelete: 'CASCADE',
          }),
          new TableForeignKey({
            columnNames: ['user_id'],
            referencedTableName: 'users',
            referencedColumnNames: ['id'],
            onDelete: 'SET NULL',
          }),
        ],
      }),
      true,
    );

    // Services table
    await queryRunner.createTable(
      new Table({
        name: 'services',
        columns: [
          { name: 'id', type: 'uuid', isPrimary: true, generationStrategy: 'uuid', default: 'uuid_generate_v4()' },
          { name: 'tenant_id', type: 'uuid', isNullable: false },
          { name: 'name', type: 'varchar', isNullable: false },
          { name: 'description', type: 'text', isNullable: true },
          { name: 'price', type: 'numeric', precision: 10, scale: 2, isNullable: false },
          { name: 'duration_minutes', type: 'int', isNullable: false },
          { name: 'category', type: 'enum', enum: ['HAIR', 'BEARD', 'COMBO', 'PRODUCT'], isNullable: false },
          { name: 'icon_url', type: 'varchar', isNullable: true },
          { name: 'active', type: 'boolean', default: true, isNullable: false },
          { name: 'created_at', type: 'timestamp', default: 'now()', isNullable: false },
          { name: 'updated_at', type: 'timestamp', default: 'now()', isNullable: false },
        ],
        indices: [
          { columnNames: ['tenant_id'] },
        ],
        foreignKeys: [
          new TableForeignKey({
            columnNames: ['tenant_id'],
            referencedTableName: 'tenants',
            referencedColumnNames: ['id'],
            onDelete: 'CASCADE',
          }),
        ],
      }),
      true,
    );

    // Barbers table
    await queryRunner.createTable(
      new Table({
        name: 'barbers',
        columns: [
          { name: 'id', type: 'uuid', isPrimary: true, generationStrategy: 'uuid', default: 'uuid_generate_v4()' },
          { name: 'tenant_id', type: 'uuid', isNullable: false },
          { name: 'user_id', type: 'uuid', isNullable: false },
          { name: 'bio', type: 'text', isNullable: true },
          { name: 'rating', type: 'numeric', precision: 3, scale: 2, default: 0, isNullable: false },
          { name: 'commission_percentage', type: 'numeric', precision: 5, scale: 2, isNullable: true },
          { name: 'working_hours', type: 'jsonb', isNullable: true },
          { name: 'created_at', type: 'timestamp', default: 'now()', isNullable: false },
          { name: 'updated_at', type: 'timestamp', default: 'now()', isNullable: false },
        ],
        indices: [
          { columnNames: ['tenant_id'] },
        ],
        foreignKeys: [
          new TableForeignKey({
            columnNames: ['tenant_id'],
            referencedTableName: 'tenants',
            referencedColumnNames: ['id'],
            onDelete: 'CASCADE',
          }),
          new TableForeignKey({
            columnNames: ['user_id'],
            referencedTableName: 'users',
            referencedColumnNames: ['id'],
            onDelete: 'CASCADE',
          }),
        ],
      }),
      true,
    );

    // BarberServices table
    await queryRunner.createTable(
      new Table({
        name: 'barber_services',
        columns: [
          { name: 'id', type: 'uuid', isPrimary: true, generationStrategy: 'uuid', default: 'uuid_generate_v4()' },
          { name: 'barber_id', type: 'uuid', isNullable: false },
          { name: 'service_id', type: 'uuid', isNullable: false },
          { name: 'custom_price', type: 'numeric', precision: 10, scale: 2, isNullable: true },
          { name: 'custom_duration', type: 'int', isNullable: true },
          { name: 'created_at', type: 'timestamp', default: 'now()', isNullable: false },
          { name: 'updated_at', type: 'timestamp', default: 'now()', isNullable: false },
        ],
        indices: [
          { columnNames: ['barber_id', 'service_id'], isUnique: true },
        ],
        foreignKeys: [
          new TableForeignKey({
            columnNames: ['barber_id'],
            referencedTableName: 'barbers',
            referencedColumnNames: ['id'],
            onDelete: 'CASCADE',
          }),
          new TableForeignKey({
            columnNames: ['service_id'],
            referencedTableName: 'services',
            referencedColumnNames: ['id'],
            onDelete: 'CASCADE',
          }),
        ],
      }),
      true,
    );

    // Appointments table
    await queryRunner.createTable(
      new Table({
        name: 'appointments',
        columns: [
          { name: 'id', type: 'uuid', isPrimary: true, generationStrategy: 'uuid', default: 'uuid_generate_v4()' },
          { name: 'tenant_id', type: 'uuid', isNullable: false },
          { name: 'barber_id', type: 'uuid', isNullable: false },
          { name: 'customer_id', type: 'uuid', isNullable: false },
          { name: 'service_id', type: 'uuid', isNullable: false },
          { name: 'scheduled_start', type: 'timestamp', isNullable: false },
          { name: 'scheduled_end', type: 'timestamp', isNullable: false },
          { name: 'status', type: 'enum', enum: ['SCHEDULED', 'CONFIRMED', 'COMPLETED', 'CANCELLED', 'NO_SHOW'], default: `'SCHEDULED'`, isNullable: false },
          { name: 'payment_status', type: 'enum', enum: ['PENDING', 'COMPLETED', 'FAILED', 'REFUNDED'], default: `'PENDING'`, isNullable: false },
          { name: 'payment_id', type: 'uuid', isNullable: true },
          { name: 'reminder_sent_at', type: 'timestamp', isNullable: true },
          { name: 'notes', type: 'text', isNullable: true },
          { name: 'created_at', type: 'timestamp', default: 'now()', isNullable: false },
          { name: 'updated_at', type: 'timestamp', default: 'now()', isNullable: false },
        ],
        indices: [
          { columnNames: ['tenant_id'] },
          { columnNames: ['barber_id'] },
          { columnNames: ['customer_id'] },
          { columnNames: ['scheduled_start'] },
          { columnNames: ['status'] },
        ],
        foreignKeys: [
          new TableForeignKey({
            columnNames: ['tenant_id'],
            referencedTableName: 'tenants',
            referencedColumnNames: ['id'],
            onDelete: 'CASCADE',
          }),
          new TableForeignKey({
            columnNames: ['barber_id'],
            referencedTableName: 'barbers',
            referencedColumnNames: ['id'],
            onDelete: 'CASCADE',
          }),
          new TableForeignKey({
            columnNames: ['customer_id'],
            referencedTableName: 'customers',
            referencedColumnNames: ['id'],
            onDelete: 'CASCADE',
          }),
          new TableForeignKey({
            columnNames: ['service_id'],
            referencedTableName: 'services',
            referencedColumnNames: ['id'],
            onDelete: 'CASCADE',
          }),
        ],
      }),
      true,
    );

    // Payments table
    await queryRunner.createTable(
      new Table({
        name: 'payments',
        columns: [
          { name: 'id', type: 'uuid', isPrimary: true, generationStrategy: 'uuid', default: 'uuid_generate_v4()' },
          { name: 'tenant_id', type: 'uuid', isNullable: false },
          { name: 'appointment_id', type: 'uuid', isNullable: true },
          { name: 'customer_id', type: 'uuid', isNullable: false },
          { name: 'amount', type: 'numeric', precision: 10, scale: 2, isNullable: false },
          { name: 'currency', type: 'char', length: '3', default: `'BRL'`, isNullable: false },
          { name: 'status', type: 'enum', enum: ['PENDING', 'COMPLETED', 'FAILED', 'REFUNDED'], default: `'PENDING'`, isNullable: false },
          { name: 'method', type: 'enum', enum: ['CASH', 'CARD', 'PIX', 'TRANSFER'], isNullable: false },
          { name: 'provider_transaction_id', type: 'varchar', isNullable: true },
          { name: 'items', type: 'jsonb', isNullable: true },
          { name: 'discount_amount', type: 'numeric', precision: 10, scale: 2, default: 0, isNullable: false },
          { name: 'tip_amount', type: 'numeric', precision: 10, scale: 2, default: 0, isNullable: false },
          { name: 'tax_amount', type: 'numeric', precision: 10, scale: 2, default: 0, isNullable: false },
          { name: 'receipt_url', type: 'varchar', isNullable: true },
          { name: 'created_at', type: 'timestamp', default: 'now()', isNullable: false },
          { name: 'updated_at', type: 'timestamp', default: 'now()', isNullable: false },
        ],
        indices: [
          { columnNames: ['tenant_id'] },
          { columnNames: ['customer_id'] },
          { columnNames: ['status'] },
          { columnNames: ['provider_transaction_id'] },
        ],
        foreignKeys: [
          new TableForeignKey({
            columnNames: ['tenant_id'],
            referencedTableName: 'tenants',
            referencedColumnNames: ['id'],
            onDelete: 'CASCADE',
          }),
          new TableForeignKey({
            columnNames: ['customer_id'],
            referencedTableName: 'customers',
            referencedColumnNames: ['id'],
            onDelete: 'CASCADE',
          }),
        ],
      }),
      true,
    );

    // LoyaltyPoints table
    await queryRunner.createTable(
      new Table({
        name: 'loyalty_points',
        columns: [
          { name: 'id', type: 'uuid', isPrimary: true, generationStrategy: 'uuid', default: 'uuid_generate_v4()' },
          { name: 'tenant_id', type: 'uuid', isNullable: false },
          { name: 'customer_id', type: 'uuid', isNullable: false },
          { name: 'balance', type: 'int', default: 0, isNullable: false },
          { name: 'created_at', type: 'timestamp', default: 'now()', isNullable: false },
          { name: 'updated_at', type: 'timestamp', default: 'now()', isNullable: false },
        ],
        indices: [
          { columnNames: ['tenant_id', 'customer_id'], isUnique: true },
        ],
        foreignKeys: [
          new TableForeignKey({
            columnNames: ['tenant_id'],
            referencedTableName: 'tenants',
            referencedColumnNames: ['id'],
            onDelete: 'CASCADE',
          }),
          new TableForeignKey({
            columnNames: ['customer_id'],
            referencedTableName: 'customers',
            referencedColumnNames: ['id'],
            onDelete: 'CASCADE',
          }),
        ],
      }),
      true,
    );

    // LoyaltyTransactions table
    await queryRunner.createTable(
      new Table({
        name: 'loyalty_transactions',
        columns: [
          { name: 'id', type: 'uuid', isPrimary: true, generationStrategy: 'uuid', default: 'uuid_generate_v4()' },
          { name: 'tenant_id', type: 'uuid', isNullable: false },
          { name: 'customer_id', type: 'uuid', isNullable: false },
          { name: 'points', type: 'int', isNullable: false },
          { name: 'type', type: 'enum', enum: ['EARNED', 'REDEEMED', 'ADJUSTED'], isNullable: false },
          { name: 'reference_id', type: 'uuid', isNullable: true },
          { name: 'created_at', type: 'timestamp', default: 'now()', isNullable: false },
          { name: 'updated_at', type: 'timestamp', default: 'now()', isNullable: false },
        ],
        indices: [
          { columnNames: ['tenant_id'] },
          { columnNames: ['customer_id'] },
        ],
        foreignKeys: [
          new TableForeignKey({
            columnNames: ['tenant_id'],
            referencedTableName: 'tenants',
            referencedColumnNames: ['id'],
            onDelete: 'CASCADE',
          }),
          new TableForeignKey({
            columnNames: ['customer_id'],
            referencedTableName: 'customers',
            referencedColumnNames: ['id'],
            onDelete: 'CASCADE',
          }),
        ],
      }),
      true,
    );

    // LoyaltyRewards table
    await queryRunner.createTable(
      new Table({
        name: 'loyalty_rewards',
        columns: [
          { name: 'id', type: 'uuid', isPrimary: true, generationStrategy: 'uuid', default: 'uuid_generate_v4()' },
          { name: 'tenant_id', type: 'uuid', isNullable: false },
          { name: 'name', type: 'varchar', isNullable: false },
          { name: 'description', type: 'text', isNullable: true },
          { name: 'points_required', type: 'int', isNullable: false },
          { name: 'reward_type', type: 'varchar', isNullable: false },
          { name: 'reward_value', type: 'numeric', precision: 10, scale: 2, isNullable: true },
          { name: 'active', type: 'boolean', default: true, isNullable: false },
          { name: 'created_at', type: 'timestamp', default: 'now()', isNullable: false },
          { name: 'updated_at', type: 'timestamp', default: 'now()', isNullable: false },
        ],
        indices: [
          { columnNames: ['tenant_id'] },
        ],
        foreignKeys: [
          new TableForeignKey({
            columnNames: ['tenant_id'],
            referencedTableName: 'tenants',
            referencedColumnNames: ['id'],
            onDelete: 'CASCADE',
          }),
        ],
      }),
      true,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop tables in reverse order of creation (respecting foreign keys)
    await queryRunner.dropTable('loyalty_rewards', true);
    await queryRunner.dropTable('loyalty_transactions', true);
    await queryRunner.dropTable('loyalty_points', true);
    await queryRunner.dropTable('payments', true);
    await queryRunner.dropTable('appointments', true);
    await queryRunner.dropTable('barber_services', true);
    await queryRunner.dropTable('barbers', true);
    await queryRunner.dropTable('services', true);
    await queryRunner.dropTable('customers', true);
    await queryRunner.dropTable('tenant_users', true);
    await queryRunner.dropTable('users', true);
    await queryRunner.dropTable('tenants', true);

    // Drop enum types
    await queryRunner.query(`DROP TYPE "public"."loyalty_transactions_type_enum"`);
    await queryRunner.query(`DROP TYPE "public"."customers_gender_enum"`);
    await queryRunner.query(`DROP TYPE "public"."services_category_enum"`);
    await queryRunner.query(`DROP TYPE "public"."payments_method_enum"`);
    await queryRunner.query(`DROP TYPE "public"."payments_status_enum"`);
    await queryRunner.query(`DROP TYPE "public"."appointments_payment_status_enum"`);
    await queryRunner.query(`DROP TYPE "public"."appointments_status_enum"`);
    await queryRunner.query(`DROP TYPE "public"."tenant_users_role_enum"`);
    await queryRunner.query(`DROP TYPE "public"."users_user_type_enum"`);
  }
}
