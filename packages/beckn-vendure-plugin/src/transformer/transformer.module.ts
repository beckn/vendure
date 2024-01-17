import { Module } from '@nestjs/common';

import { TransformTasksRunner } from './transform-tasks-runner';
import { TransformerService } from './transformer.service';

@Module({
    providers: [TransformerService, TransformTasksRunner],
    exports: [TransformerService],
})
export class TransformerModule {}
