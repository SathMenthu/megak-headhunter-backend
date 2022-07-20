import { RolesEnum } from '../../enums';

export interface UserBasicData {
  id: string;
  email: string;
  password: string;
  permissions: RolesEnum[];
}
