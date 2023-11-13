import { HttpStatus, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import mongoose, { Model } from 'mongoose';
import { ResourceTypeEnum } from 'src/enums';
import { Resources } from 'src/models/resources.model';
import { AwsService } from '../aws/aws.service';
import { FileInterface } from './interfaces/file';
import { ExceptionResponse } from 'src/exceptions/common.exception';

@Injectable()
export class UploadService {
  constructor(
    @InjectModel(Resources.name)
    private readonly uploadModel: Model<Resources>,
    private readonly awsService: AwsService,
  ) {}

  async handleUploadFile(userId: string, files: FileInterface[]) {
    let fileClone: any = files;
    if (!Array.isArray(files)) {
      fileClone = [fileClone];
    }
    if (fileClone.length > 5) {
      throw new ExceptionResponse(
        HttpStatus.BAD_REQUEST,
        'Chỉ được tải tối đa 5 files 1 lần',
      );
    }

    const uploadPromises = [];
    const newFiles = [];

    fileClone.forEach((file) => {
      uploadPromises.push(this.awsService.uploadFileToS3(file));
    });

    const paths = await Promise.all(uploadPromises);

    fileClone.forEach((file, index) => {
      newFiles.push({
        file_name: file.originalName,
        type: ResourceTypeEnum.Image,
        encoding: file.encoding,
        path: paths[index],
        size: file.size,
        is_keep: 1,
        ext: file.fileType.ext,
        created_by: new mongoose.Types.ObjectId(userId),
      });
    });

    await this.uploadModel.insertMany(newFiles);

    return paths;
  }
}
