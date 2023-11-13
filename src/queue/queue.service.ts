import { Injectable, Logger } from "@nestjs/common";
import { InjectQueue } from "@nestjs/bull";
import { Queue } from "bull";
import { CatchException } from "../exceptions/common.exception";

@Injectable()
export class QueueService {
  logger = new Logger('QueueService');
  constructor(@InjectQueue("main-processor") private readonly mainQueue: Queue) {}

  async addJob(name: string, data: any, delay: number): Promise<void> {
    try {
      await this.mainQueue.add(name, data, { delay });
    } catch (e) {
      throw new CatchException(e)
    }
  }
}
