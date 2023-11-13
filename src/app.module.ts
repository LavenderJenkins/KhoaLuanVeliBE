import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthModule } from './auth/auth.module';
import { ChatModule } from './chat/chat.module';
import { ConfigModuleModule } from './config-module/config-module.module';
import { ConfigServiceProvider } from './config-module/config-module.service';
import { RedisConnectionModule } from './redis-connection/redis-connection.module';
import { SocketModule } from './socket/socket.module';
import { UserModule } from './user/user.module';
import { UploadModule } from './upload/upload.module';
import { AwsModule } from './aws/aws.module';
import { DocumentModule } from './document/document.module';
import { SmsModule } from './sms/sms.module';
import { QueueModule } from './queue/queue.module';

@Module({
  imports: [
    // env
    ConfigModule.forRoot({ isGlobal: true }),

    // jwt
    JwtModule.registerAsync({
      imports: [ConfigModuleModule],
      useFactory: (config: ConfigServiceProvider) => config.createJwtOptions(),
      inject: [ConfigServiceProvider],
    }),

    // mongo
    MongooseModule.forRootAsync({
      imports: [ConfigModuleModule],
      useFactory: (config: ConfigServiceProvider) => config.createMongoOptions(),
      inject: [ConfigServiceProvider]
    }),
    
    // MongoDBModule,
    RedisConnectionModule,
    QueueModule,
    SocketModule,
    AuthModule,
    UserModule,
    ChatModule,
    AwsModule,
    UploadModule,
    SmsModule,
    DocumentModule,
  ],
})
export class AppModule {}
