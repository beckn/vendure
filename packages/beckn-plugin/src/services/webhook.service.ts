import { Injectable } from '@nestjs/common';

import { RequestContext } from '@vendure/core';

@Injectable()
export class WebhookService {
    handleRequest(ctx: RequestContext) {
        return {
            message: {
                ack: {
                    status: 'ACK',
                },
            },
        };
    }
}
