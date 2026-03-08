import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class MakeDurationNullableForProducts1704081600006 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.changeColumn(
      'services',
      'duration_minutes',
      new TableColumn({
        name: 'duration_minutes',
        type: 'int',
        isNullable: true,
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.changeColumn(
      'services',
      'duration_minutes',
      new TableColumn({
        name: 'duration_minutes',
        type: 'int',
        isNullable: false,
      }),
    );
  }
}
