/* eslint-disable no-console */
import { Injectable } from '@nestjs/common';
import { RequestContext } from '@vendure/core';

@Injectable()
export class GenericHandlerService {
    handleEvent(ctx: RequestContext) {
        console.log('Received Message');
        console.log(JSON.stringify(ctx.req?.body));
    }
}
