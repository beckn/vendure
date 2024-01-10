/* eslint-disable no-console */
import { Injectable } from '@nestjs/common';
import { RequestContext } from '@vendure/core';

@Injectable()
export class WebhookService {
    handleRequest(ctx: RequestContext) {
        console.log('Received Message');
        console.log(JSON.stringify(ctx.req?.body));
    }
}
