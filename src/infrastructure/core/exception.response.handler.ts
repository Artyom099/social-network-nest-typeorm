import { ApproachType, InternalCode } from '../utils/enums';
import {
  ForbiddenException,
  InternalServerErrorException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { ContractDto } from './contract.dto';

export class ExceptionResponseHandler {
  private readonly typeExceptionMethod: ApproachType;

  constructor(typeExceptionMethod: ApproachType) {
    if (!(typeExceptionMethod in this)) throw new Error();

    this.typeExceptionMethod = typeExceptionMethod;
  }

  sendExceptionOrResponse(dto: ContractDto<any>) {
    if (dto.hasError()) {
      const ExceptionClass = this[this.typeExceptionMethod](
        this.typeExceptionMethod === ApproachType.tcp ? undefined : dto.code,
      );

      throw new ExceptionClass(
        // this.typeExceptionMethod === ApproachType.tcp ? dto.code : undefined
        dto.code,
        dto.message,
      );
    }
    return dto.payload;
  }

  [ApproachType.http](code: InternalCode) {
    switch (code) {
      case InternalCode.NotFound:
        return NotFoundException;
      case InternalCode.Forbidden:
        return ForbiddenException;
      case InternalCode.Unauthorized:
        return UnauthorizedException;
      case InternalCode.Internal_Server:
        return InternalServerErrorException;
    }
  }
}
