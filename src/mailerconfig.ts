import { HandlebarsAdapter } from '@nestjs-modules/mailer/dist/adapters/handlebars.adapter';
import { mailConfig } from '../config/config';

export = {
  transport: `smtp://${mailConfig.mailUserName}:${mailConfig.mailPassword}@${mailConfig.mailHost}:${mailConfig.mailPort}`,
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
};
