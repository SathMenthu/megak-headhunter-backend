import { DataSource } from 'typeorm';
import {GLOBAL_CONFIG} from 'config';
const {DB} = GLOBAL_CONFIG;

export const databaseProviders = [
    {
      provide: 'DATA_SOURCE',
      useFactory: async () => {
        const dataSource = new DataSource({
          type: 'mysql',
          host: DB.host || 'localhost',
          port: DB.port || 3306,
          username: DB.username || 'root',
          password: DB.password,
          database: DB.database || 'test',  
          synchronize: GLOBAL_CONFIG.isDev ? true : false,
          logging: GLOBAL_CONFIG.isDev ? true : false,
          bigNumberStrings: DB.bigNumberStrings,
          
          entities: [
              __dirname + '/../**/*.entity{.ts,.js}',
          ],
        });
  
        return dataSource.initialize();
      },
    },
  ];
