import { StudentStatus } from '../../enums/student.status.enum';
import { ExpectedContractTypeEnum, ExpectedTypeWorkEnum } from '../../enums';

export interface StudentBasicData {
  reservationEndDate: string | null;
  activationLink: string | null;
  studentStatus: StudentStatus | null;
  githubUsername: string | null;
  portfolioUrls: string[] | null;
  projectUrls: string[] | null;
  bio: string | null;
  expectedTypeWork: ExpectedTypeWorkEnum | null;
  targetWorkCity: string | null;
  expectedContractType: ExpectedContractTypeEnum | null;
  expectedSalary: number | null;
  canTakeApprenticeship: boolean | null | string;
  monthsOfCommercialExp: number | null;
  education: string | null;
  workExperience: string | null;
  courses: string | null;
  courseCompletion: number | null;
  courseEngagement: number | null;
  projectDegree: number | null;
  teamProjectDegree: number | null;
  bonusProjectUrls: string[] | null;
}
