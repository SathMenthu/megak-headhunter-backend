import { HandlebarsAdapter } from '@nestjs-modules/mailer/dist/adapters/handlebars.adapter';
import { mailConfig } from '../config/config';

export = {
  transport: {
    host: mailConfig.mailHost,
    secure: mailConfig.mailSecure,
    port: mailConfig.mailPort,
    auth: {
      user: mailConfig.adminEmail,
      pass: mailConfig.mailPassword,
    },
    tls: {
      rejectUnauthorized: mailConfig.mailTlsRejectUnauthorized,
    },
  },
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
  preview: mailConfig.mailPreview, // If you want to see sent emails
};
