import { Injectable } from '@nestjs/common';
import { Logger, RequestContext } from '@vendure/core';
import { loggerCtx } from '../common/constants';
import { BecknRequest } from '../common/types';
import { IncomingHttpHeaders } from 'http';

@Injectable()
export class BecknRequestHandler {
    async handleEvent(ctx: RequestContext) {
        try {
            const becknRequest = this._getBecknRequest(ctx);
            const requestService = this._getRequestService(becknRequest);
        } catch (err: any) {
            Logger.error(err.message, loggerCtx);
            console.log(err.stack);
        }
    }

    _getBecknRequest(ctx: RequestContext): BecknRequest {
        if (!ctx.req || !ctx.req.body || !ctx.req.headers) throw Error('Request Context is empty');
        return {
            headers: this._getSimplifiedStringHeaders(ctx.req?.headers),
            body: ctx.req?.body,
        };
    }

    _getSimplifiedStringHeaders(headers: IncomingHttpHeaders) {
        return Object.entries(headers)
            .map(([k, v]) => [k.toString(), v ? v.toString() : ''])
            .reduce((acc: { [key: string]: string }, [k, v]) => {
                acc[k] = v;
                return acc;
            }, {});
    }

    _getRequestService(becknRequest: BecknRequest) {
        switch (becknRequest.body.context.action) {
            case 'search':
                console.log('Handling search request');
                break;
            default:
                console.log('Action not yet supported');
        }
    }
}
