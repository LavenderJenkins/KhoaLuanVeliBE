import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { NestjsFormDataModule } from 'nestjs-form-data';
import { Resources, ResourcesSchema } from 'src/models/resources.model';
import { AwsModule } from '../aws/aws.module';
import { AwsService } from '../aws/aws.service';
import { UploadController } from './upload.controller';
import { UploadService } from './upload.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      {name: Resources.name, schema: ResourcesSchema}
    ]),
    NestjsFormDataModule,
    AwsModule,
  ],
  controllers: [UploadController],
  providers: [UploadService, AwsService],
})
export class UploadModule {}
