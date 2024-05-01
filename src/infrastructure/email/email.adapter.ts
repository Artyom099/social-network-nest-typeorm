import nodemailer from 'nodemailer';
import { Inject, Injectable } from '@nestjs/common';
import { AppConfig } from '../../config/app-config';

@Injectable()
export class EmailAdapter {
  constructor(@Inject(AppConfig.name) private appConfig: AppConfig) {}

  async sendViaEmail(email: string, subject: string, message: string) {
    const { EMAIL_HOST, EMAIL_USER, EMAIL_PASSWORD } =
      this.appConfig.settings.email;

    const transporter = nodemailer.createTransport({
      host: EMAIL_HOST,
      port: 465,
      secure: true,
      auth: {
        user: EMAIL_USER,
        pass: EMAIL_PASSWORD,
      },
    });

    return transporter.sendMail({
      from: `Blog Platform <${EMAIL_USER}>`, // sender address
      to: email, // list of receivers
      subject: subject, // Subject line
      html: message, // html body
    });
  }

  async sendViaGmail(email: string, subject: string, message: string) {
    const { EMAIL_HOST, EMAIL_USER, EMAIL_PASSWORD } =
      this.appConfig.settings.email;

    try {
      const transporter = nodemailer.createTransport({
        host: EMAIL_HOST,
        // port: 587,
        secure: true,
        auth: {
          user: EMAIL_USER,
          pass: EMAIL_PASSWORD,
        },
      });

      return transporter.sendMail({
        from: `Blog Platform <${EMAIL_USER}>`,
        to: email,
        subject: subject,
        html: message,
      });
    } catch (e) {
      console.error({ email_error: e });
    }
  }
}
