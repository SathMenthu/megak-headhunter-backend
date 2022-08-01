import { HandlebarsAdapter } from '@nestjs-modules/mailer/dist/adapters/handlebars.adapter';
import { mailConfig } from '../config/config';

export = {
  /** ------------------- localhost - config ------------------- */
  transport: `smtp://${mailConfig.mailUserName}:${mailConfig.mailPassword}@${mailConfig.mailHost}:${mailConfig.mailPort}`,

  /** ---------------- Outside SMTP Server - config ------------------ */
  // transport: {
  //   host: mailConfig.mailHost,
  //   secure: mailConfig.mailSecure,
  //   port: mailConfig.mailPort,
  //   auth: {
  //     user: mailConfig.adminEmail,
  //     pass: mailConfig.mailPassword,
  //   },
  //   tls: {
  //     rejectUnauthorized: false,
  //   },
  // },
  defaults: {
    from: mailConfig.adminEmail,
  },
  template: {
    dir: 'templates/email',
    adapter: new HandlebarsAdapter(),
    options: {
      strict: true,
    },
  },
  preview: mailConfig.mailPreview, // If you want to see sent email
};
