import { EmailAdapter } from './email.adapter';
import { Injectable } from '@nestjs/common';

@Injectable()
export class EmailManager {
  constructor(private emailAdapter: EmailAdapter) {}

  async sendEmailConfirmationCode(email: string, code: string) {
    const subject = 'Confirm your email';

    const message =
      ' <h1>Thanks for your registration</h1>\n' +
      ' <p>To finish registration please follow the link below:\n' +
      `     <a href =\'https://somesite.com/confirm-email?code=${code}\'>complete registration</a>\n` +
      ' </p>\n';

    return this.emailAdapter.sendViaEmail(email, subject, message);
  }

  async sendEmailRecoveryCode(email: string, code: string) {
    const subject = 'Password recovery';

    const message = `<h1>Password recovery</h1>
      <p>To finish password recovery please follow the link below:
          <a href =\'https://somesite.com/password-recovery?recoveryCode=${code}\'>recovery password</a>
      </p>`;

    return this.emailAdapter.sendViaEmail(email, subject, message);
  }
}
