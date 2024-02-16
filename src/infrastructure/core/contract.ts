import { InternalCode } from '../utils/enums';

export class Contract<T> {
  constructor(
    public code: InternalCode,
    public payload: T | null = null,
    public message: string | null = null,
  ) {}

  hasError() {
    return this.code <= 0;
  }
}
