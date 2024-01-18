/* eslint-disable no-console */
import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { Logger } from '@vendure/core';
import { lastValueFrom, map } from 'rxjs';

import { axiosErrorHandler } from '../common';
import { loggerCtx } from '../constants';
import { Environment } from '../types';

import { TransformTasksRunner } from './transform-tasks-runner';
import { BecknRequest, BecknResponse, TransformerContext } from './types';

@Injectable()
export class TransformerService {
    constructor(private transformTasksRunner: TransformTasksRunner) {}

    async transform(env: Environment, becknRequest: BecknRequest): Promise<BecknResponse> {
        const context: TransformerContext = { env, becknRequest };
        await this.transformTasksRunner.run(context);
        if (!context.becknResponse) throw Error('Could not generate Beckn Response packet');
        return context.becknResponse as BecknResponse;
    }
}
