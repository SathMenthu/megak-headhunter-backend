import { RolesEnum } from 'src/types';
import { BaseEntity, Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { UserBasicData } from '../../types/interfaces/user';

@Entity()
export class User extends BaseEntity implements UserBasicData {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    length: 255,
  })
  email: string;

  @Column({
    length: 255,
  })
  password: string;

  @Column({
    type: 'set',
    enum: RolesEnum,
  })
  permissions: RolesEnum[];

  @Column({ nullable: true })
  activeTokenId: string | null;

  @Column({ type: 'timestamp' })
  createdAt: string = Date.now().toLocaleString();
}
