/* eslint-disable no-console */
import { HttpService } from '@nestjs/axios';
import assert from 'assert';
import { lastValueFrom, map } from 'rxjs';

import { axiosErrorHandler } from '../../common';
import { Environment } from '../../types';
import { TransformTask, TransformTaskDef, TransformerContext } from '../types';

export class SendGraphQLRequest implements TransformTask {
    constructor(public taskDef: TransformTaskDef) {}
    private inputKey: string;
    private outputKey: string;

    preCheck(context: TransformerContext): boolean {
        this.inputKey = this.taskDef.args?.input || 'graphqlRequest';
        this.outputKey = this.taskDef.args?.output || 'graphqlResponse';
        return true;
    }

    async run(context: TransformerContext): Promise<void> {
        const graphqlRequest = context[this.inputKey];
        const env = context.env;
        if (!graphqlRequest || !env) return;
        const shop_url = `${env.host_url}/shop-api`;
        try {
            const httpService = new HttpService();
            const response = await lastValueFrom(
                httpService
                    .post(
                        shop_url,
                        JSON.stringify({
                            query: graphqlRequest.query,
                            variables: graphqlRequest.variables,
                        }),
                        {
                            headers: graphqlRequest.headers,
                        },
                    )
                    .pipe(map(resp => resp.data)),
            );
            if (response.errors) {
                throw Error(JSON.stringify(response.errors));
            }
            // console.log(JSON.stringify(response));
            context[this.outputKey] = response;
        } catch (err: any) {
            throw Error(axiosErrorHandler(err).message);
        }
    }
}
