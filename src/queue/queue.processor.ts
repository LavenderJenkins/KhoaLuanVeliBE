import { Process, Processor } from "@nestjs/bull";
import { Logger } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Job } from "bull";
import { Model } from "mongoose";
import { Verify } from "src/models/verify.model";

@Processor("main-processor")
export class QueueProcessor {
  private readonly logger = new Logger(QueueProcessor.name);
  constructor(
    @InjectModel(Verify.name)
    private readonly verifyModel: Model<Verify>,
  ) {
  }

  @Process('delete-expired-otp')
  async handleJob(job: Job<any>): Promise<void> {
    this.logger.log('Start processing job');
    // Xử lý công việc ở đây
    const verify: Verify = job.data;
    await this.verifyModel.findByIdAndDelete(verify._id);

    this.logger.log('Finished processing job');
  }

}