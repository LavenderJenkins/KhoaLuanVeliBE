import { Module } from "@nestjs/common";
import { QueueService } from "./queue.service";
import { BullModule } from "@nestjs/bull";
import { ConfigModuleModule } from "../config-module/config-module.module";
import { ConfigServiceProvider } from "../config-module/config-module.service";
import { QueueProcessor } from "./queue.processor";
import { MongooseModule } from "@nestjs/mongoose";
import { Verify, VerifySchema } from "src/models/verify.model";

@Module({
  imports: [
    //queue
    BullModule.forRootAsync({
      imports: [ConfigModuleModule],
      useFactory: (config: ConfigServiceProvider) => config.createBullOptions(),
      inject: [ConfigServiceProvider]
    }),
    BullModule.registerQueue(
      {name: "main-processor"}
    ),

    MongooseModule.forFeature([
      {name: Verify.name, schema: VerifySchema},
    ])
  ],
  providers: [QueueService, QueueProcessor],
  exports: [QueueModule, QueueService, QueueProcessor]
})
export class QueueModule {}
