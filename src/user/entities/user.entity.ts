import {
  BaseEntity,
  Column,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import {
  ExpectedContractTypeEnum,
  ExpectedTypeWorkEnum,
  RoleEnum,
  UserBasicData,
} from '../../types';
import { StudentStatus } from '../../types/enums/student.status.enum';

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
  permission: RoleEnum;

  @Column({ nullable: true })
  activeTokenId: string | null;

  @Column({ type: 'boolean', default: true })
  accountBlocked: boolean;

  @Column({ length: 36, nullable: true })
  resetPasswordLink: string | null;

  @Column({ type: 'timestamp' })
  createdAt: string = Date.now().toLocaleString();

  @Column({
    default:
      'https://cdn.pixabay.com/photo/2013/07/13/10/44/man-157699_1280.png',
    length: 255,
  })
  avatar: string;

  // ONLY HR VARIABLES

  @OneToMany(() => User, user => user.assignedHR)
  assignedStudents: User[];

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

  @ManyToOne(() => User, user => user.assignedStudents)
  assignedHR: User;

  @Column({ type: 'datetime', nullable: true, default: null })
  reservationEndDate: Date | null;

  @Column({
    type: 'enum',
    enum: StudentStatus,
    nullable: true,
    default: StudentStatus.AVAILABLE,
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
    default: ExpectedTypeWorkEnum.IRRELEVANT,
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
    default: ExpectedContractTypeEnum['NO PREFERENCES'],
  })
  expectedContractType: ExpectedContractTypeEnum | null;

  @Column({
    type: 'float',
    precision: 7,
    scale: 2,
    nullable: true,
    default: 0,
  })
  expectedSalary: number | null;

  @Column({
    type: 'boolean',
    default: false,
  })
  canTakeApprenticeship: boolean;

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
    nullable: true,
  })
  activationLink: string | null;
}
