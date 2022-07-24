import {
  ExpectedContractTypeEnum,
  ExpectedTypeWorkEnum,
  RolesEnum,
  UserBasicData,
} from 'types';
import { BaseEntity, Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class User extends BaseEntity implements UserBasicData {
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
    type: 'set',
    enum: RolesEnum,
  })
  permissions: RolesEnum[];

  @Column({ nullable: true })
  activeTokenId: string | null;

  @Column({ type: 'timestamp' })
  createdAt: string = Date.now().toLocaleString();

  @Column({
    type: 'varchar',
    length: 21,
    nullable: false,
  })
  firstName: string;

  @Column({
    type: 'varchar',
    length: 51,
    nullable: false,
  })
  lastName: string;

  @Column({
    type: 'varchar',
    length: 73,
    nullable: false,
  })
  fullName: string;

  @Column({
    type: 'text',
    default:
      'https://www.deviantart.com/karmaanddestiny/art/Default-user-icon-4-858661084 ',
  })
  avatar: string;

  @Column({
    type: 'varchar',
    length: 50,
    nullable: false,
  })
  company: string;

  @Column({
    unique: true,
    type: 'varchar',
    length: 39,
  })
  githubUsername: string;

  @Column({
    type: 'text',
  })
  portfolioUrls: string[];

  @Column({
    type: 'text',
  })
  projectUrls: string[];

  @Column({
    type: 'text',
    nullable: true,
    default: null,
  })
  bio: string;

  @Column({
    type: 'enum',
    enum: ExpectedTypeWorkEnum,
    default: '4',
  })
  expectedTypeWork: string;

  @Column({
    type: 'varchar',
    length: 60,
  })
  targetWorkCity: string;

  @Column({
    type: 'enum',
    enum: ExpectedContractTypeEnum,
    default: '3',
  })
  expectedContractType: string;

  @Column({
    type: 'float',
    default: 0,
    precision: 7,
    scale: 2,
  })
  expectedSalary: number;

  @Column({
    type: 'boolean',
    default: false,
  })
  canTakeApprenticeship: boolean;

  @Column({
    type: 'int',
    nullable: true,
    precision: 2,
    default: 0,
  })
  monthsOfCommercialExp: number;

  @Column({
    type: 'longtext',
    nullable: true,
    default: null,
  })
  education: string;

  @Column({
    type: 'longtext',
    nullable: true,
    default: null,
  })
  workExperience: string;

  @Column({
    type: 'longtext',
    nullable: true,
    default: null,
  })
  courses: string;

  @Column({
    type: 'text',
  })
  studentStatus: string;

  @Column({
    type: 'int',
    precision: 3,
  })
  maxReservedStudents: number;

  @Column({
    type: 'int',
    precision: 1,
  })
  courseCompletion: number;

  @Column({
    type: 'int',
    precision: 1,
  })
  courseEngagement: number;

  @Column({
    type: 'int',
    precision: 1,
  })
  projectDegree: number;

  @Column({
    type: 'int',
    precision: 1,
  })
  teamProjectDegree: number;

  @Column({
    type: 'text',
  })
  bonusProjectUrls: string[];
}
