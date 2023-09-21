import {CreateUserInputModel} from '../input/create.user.input.model';

export type CreateUserDTO = {
  id: string,
  InputModel: CreateUserInputModel;
  salt: string;
  hash: string;
  expirationDate: Date;
  confirmationCode: string;
  isConfirmed: boolean;
}