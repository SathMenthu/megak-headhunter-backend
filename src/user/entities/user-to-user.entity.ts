import { BaseEntity, Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { UserToUserBasicData } from '../../types';

@Entity()
export class UserToUser extends BaseEntity implements UserToUserBasicData {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    length: 36,
  })
  hrId: string;

  @Column({
    length: 36,
  })
  studentId: string;

  @Column({
    type: 'datetime',
    nullable: true,
    default: null,
  })
  reservationEndDate: Date | null;
}
