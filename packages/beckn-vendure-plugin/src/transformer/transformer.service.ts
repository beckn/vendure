/* eslint-disable no-console */
import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { Logger } from '@vendure/core';
import { lastValueFrom, map } from 'rxjs';

import { axiosErrorHandler } from '../common';
import { loggerCtx } from '../constants';

import { TransformTasksRunner } from './transform-tasks-runner';
import { BecknRequest, BecknResponse, Context } from './types';

@Injectable()
export class TransformerService {
    constructor(private transformTasksRunner: TransformTasksRunner) {}

    async transform(env: { [key: string]: string }, beckn_request: BecknRequest): Promise<BecknResponse> {
        const context: Context = { env, beckn_request };
        await this.transformTasksRunner.run(context);
        if (!context.beckn_response) Error('Could not generate Beckn Response packet');
        return context.beckn_response as BecknResponse;
    }
}
