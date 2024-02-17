import { Injectable } from '@nestjs/common';

import { EventBus, RequestContext } from '@vendure/core';
import { BecknRequestEvent } from '../common/beckn-request.event';

@Injectable()
export class WebhookService {
    constructor(private eventBus: EventBus) {}
    handleRequest(ctx: RequestContext) {
        this.eventBus.publish(new BecknRequestEvent(ctx));
        return {
            message: {
                ack: {
                    status: 'ACK',
                },
            },
        };
    }
}
