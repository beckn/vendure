import { HttpService } from '@nestjs/axios';
import assert from 'assert';
import { lastValueFrom, map } from 'rxjs';

import { axiosErrorHandler } from '../../common';
import { Environment } from '../../types';
import { TransformTask, TransformTaskDef } from '../types';

export class SendGraphQLRequest implements TransformTask {
    constructor(public taskDef: TransformTaskDef) {}
    private inputKey: string;
    private outputKey: string;
    async preCheck(context: any): Promise<boolean> {
        this.inputKey = this.taskDef.args?.input || 'graphql_request';
        this.outputKey = this.taskDef.args?.output || 'graphql_response';
        return true;
    }

    async run(context: any): Promise<void> {
        const gql_request = context[this.inputKey];
        const env = context.env as Environment;
        if (!gql_request || !env) return;
        const shop_url = `${env.host_url}/shop-api`;
        try {
            const httpService = new HttpService();
            const response = await lastValueFrom(
                httpService
                    .post(shop_url, JSON.stringify({ query: gql_request.query }), {
                        headers: gql_request.headers,
                    })
                    .pipe(map(resp => resp.data)),
            );
            // console.log(JSON.stringify(response));
            context[this.outputKey] = response;
        } catch (err: any) {
            throw Error(axiosErrorHandler(err).message);
        }
    }
}
