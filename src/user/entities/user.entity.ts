import {
  ExpectedContractTypeEnum,
  ExpectedTypeWorkEnum,
  RoleEnum,
  UserBasicData,
} from 'types';
import { BaseEntity, Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { StudentStatus } from '../../../types/enums/student.status.enum';

@Entity()
export class User extends BaseEntity implements UserBasicData {
  // All Users Variables
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    unique: true,
  })
  email: string;

  @Column({
    length: 255,
  })
  password: string;

  @Column({
    length: 50,
    nullable: false,
  })
  firstName: string;

  @Column({
    length: 50,
    nullable: false,
  })
  lastName: string;

  @Column({
    type: 'enum',
    enum: RoleEnum,
  })
  permissions: RoleEnum;

  @Column({ nullable: true })
  activeTokenId: string | null;

  @Column({ type: 'timestamp' })
  createdAt: string = Date.now().toLocaleString();

  @Column({
    default:
      'https://www.deviantart.com/karmaanddestiny/art/Default-user-icon-4-858661084 ',
    length: 255,
  })
  avatar: string;

  // ONLY HR VARIABLES

  @Column({
    length: 100,
    nullable: true,
  })
  company: string | null;

  @Column({
    precision: 3,
    nullable: true,
  })
  maxReservedStudents: number | null;

  // ONLY USER VARIABLES

  @Column({ type: 'datetime', nullable: true, default: null })
  reservationEndDate: string | null;

  @Column({
    type: 'enum',
    enum: StudentStatus,
    nullable: true,
    default: null,
  })
  studentStatus: StudentStatus | null;

  @Column({ precision: 9, nullable: true })
  phoneNumber: number | null;

  @Column({
    unique: true,
    type: 'varchar',
    length: 39,
    nullable: true,
  })
  githubUsername: string | null;

  @Column({
    type: 'simple-array',
    nullable: true,
  })
  portfolioUrls: string[] | null;

  @Column({
    type: 'simple-array',
    nullable: true,
  })
  projectUrls: string[] | null;

  @Column({
    type: 'text',
    nullable: true,
    default: null,
  })
  bio: string | null;

  @Column({
    type: 'enum',
    enum: ExpectedTypeWorkEnum,
    nullable: true,
  })
  expectedTypeWork: ExpectedTypeWorkEnum | null;

  @Column({
    length: 60,
    nullable: true,
  })
  targetWorkCity: string | null;

  @Column({
    type: 'enum',
    enum: ExpectedContractTypeEnum,
    nullable: true,
  })
  expectedContractType: ExpectedContractTypeEnum | null;

  @Column({
    type: 'float',
    precision: 7,
    scale: 2,
    nullable: true,
  })
  expectedSalary: number | null;

  @Column({
    type: 'boolean',
    nullable: true,
  })
  canTakeApprenticeship: boolean | null;

  @Column({
    nullable: true,
    precision: 3,
  })
  monthsOfCommercialExp: number | null;

  @Column({
    type: 'text',
    nullable: true,
  })
  education: string | null;

  @Column({
    type: 'text',
    nullable: true,
  })
  workExperience: string | null;

  @Column({
    type: 'text',
    nullable: true,
  })
  courses: string | null;

  @Column({
    precision: 1,
    nullable: true,
  })
  courseCompletion: number | null;

  @Column({
    precision: 1,
    nullable: true,
  })
  courseEngagement: number | null;

  @Column({
    precision: 1,
    nullable: true,
  })
  projectDegree: number | null;

  @Column({
    precision: 1,
    nullable: true,
  })
  teamProjectDegree: number | null;

  @Column({
    type: 'simple-array',
    nullable: true,
  })
  bonusProjectUrls: string[] | null;

  @Column({
    length: 36,
    unique: true,
  })
  activationLink: string | null;
}
