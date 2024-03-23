import { CreateUserInputModel } from '../input/create.user.input.model';

export type CreateUserDTO = {
  id: string;
  inputModel: CreateUserInputModel;
  salt: string;
  hash: string;
  expirationDate: Date;
  confirmationCode: string;
  isConfirmed: boolean;
};
