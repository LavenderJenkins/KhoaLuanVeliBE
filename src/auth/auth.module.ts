import { Module } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from 'src/models/user.model';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { Verify, VerifySchema } from 'src/models/verify.model';
import { SmsService } from 'src/sms/sms.service';
import { QueueService } from 'src/queue/queue.service';
import { BullModule } from '@nestjs/bull';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: Verify.name, schema: VerifySchema },
    ]),

    BullModule.registerQueue({ name: 'main-processor' }),
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtService, SmsService, QueueService],
})
export class AuthModule {}
