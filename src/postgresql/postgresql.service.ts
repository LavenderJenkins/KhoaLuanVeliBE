import {
  Global,
  Injectable,
  Logger,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';
import { Client, QueryArrayResult } from 'pg';
import { RetryTime } from 'src/enums';

@Global()
@Injectable()
export class PostgresqlService implements OnModuleInit, OnModuleDestroy {
  private postgresClient: Client;
  logger = new Logger('PostgreSQL-Service');

  async onModuleInit() {
    await this.connectPostgreSQL();
  }

  async onModuleDestroy() {
    await this.postgresClient.end();
  }

  async connectPostgreSQL() {
    let isConnected: Boolean = false;
    let retryTime = RetryTime.Init;
    const maxRetry = RetryTime.Ten;

    while (!isConnected && retryTime < maxRetry) {
      try {
        this.logger.log('Connecting to PostgreSQL...');
        this.postgresClient = new Client({
          host: process.env.POSTGRES_HOST,
          port: parseInt(process.env.POSTGRES_PORT),
          user: process.env.POSTGRES_USER,
          password: process.env.POSTGRES_PASSWORD,
          database: process.env.POSTGRES_DATABASE,
          connectionTimeoutMillis: 5000,
          keepAlive: true,
          
        });
        await this.postgresClient.connect();
        isConnected = true;
        this.logger.log('Connect to PostgreSQL successfully');
      } catch (e) {
        isConnected = false;
        retryTime++;
        this.logger.error(`Error connecting to PostgreSQL at ${retryTime} times: ${e}`);
      }
    }
  }

  async query(text: string, values?: any[]): Promise<QueryArrayResult> {
    const result: QueryArrayResult = await this.postgresClient.query(
      text,
      values,
    );
    return result;
  }
}
