/* eslint-disable no-console */
import { HttpService } from '@nestjs/axios';
import assert from 'assert';
import { readFile } from 'fs/promises';
import path from 'path';
import { lastValueFrom, map } from 'rxjs';

import { axiosErrorHandler } from '../../common';
import { Environment } from '../../types';
import { assignValue, checkArgsForKeys } from '../common/transform-utils';
import { TransformTask, TransformTaskDef, TransformerContext } from '../types';

export class SendGraphQLRequest implements TransformTask {
    constructor(public taskDef: TransformTaskDef) {}
    private graphqlFilename: string;
    private variablesKey: string;
    private headersKey: string;
    private outputKey: string;

    preCheck(context: TransformerContext): boolean {
        if (!this.taskDef.args || !context.env) throw Error('SendGraphQL requires configuration');

        checkArgsForKeys('SendGraphQLRequest', this.taskDef.args, ['graphqlFilename', 'outputKey']);

        if (!context.requestEnv?.domainSupportFilesFolder)
            throw Error('Domain support files folder needs to be configured');
        this.graphqlFilename = path.join(
            context.requestEnv.domainSupportFilesFolder,
            this.taskDef.args.graphqlFilename,
        );

        this.variablesKey = this.taskDef.args.variablesKey;
        this.headersKey = this.taskDef.args.headersKey;
        this.outputKey = this.taskDef.args.outputKey;
        return true;
    }

    async run(context: TransformerContext): Promise<void> {
        const query = await readFile(this.graphqlFilename, 'utf-8');
        const variables = context[this.variablesKey];
        let headers = { 'content-type': 'application/json' };
        if (this.headersKey) headers = { ...headers, ...context[this.headersKey] };

        const env = context.env;
        const shop_url = `${env.host_url}/shop-api`;
        try {
            const httpService = new HttpService();
            const response = await lastValueFrom(
                httpService
                    .post(
                        shop_url,
                        JSON.stringify({
                            query,
                            variables,
                        }),
                        {
                            headers,
                        },
                    )
                    .pipe(map(resp => resp.data)),
            );
            if (response.errors) {
                throw Error(JSON.stringify(response.errors));
            }
            // console.log(JSON.stringify(response));
            assignValue(context, this.outputKey, response);
        } catch (err: any) {
            throw Error(axiosErrorHandler(err).message);
        }
    }
}