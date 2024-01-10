/* eslint-disable no-console */
import { OnModuleInit } from '@nestjs/common';
import { PluginCommonModule, VendurePlugin } from '@vendure/core';
import { EventBus } from '@vendure/core';

import { BecknRequestEvent } from './beckn-request.event';
import { GenericHandlerService } from './generic-handler.service';
import { WebhookController } from './webhook.controller';
import { WebhookService } from './webhook.service';

@VendurePlugin({
    imports: [PluginCommonModule],
    controllers: [WebhookController],
    providers: [WebhookService, GenericHandlerService],
})
export class BecknVendurePlugin implements OnModuleInit {
    constructor(private eventBus: EventBus, private genericHandlerService: GenericHandlerService) {}
    onModuleInit() {
        this.eventBus.ofType(BecknRequestEvent).subscribe((event: BecknRequestEvent) => {
            this.genericHandlerService.handleEvent(event.ctx);
        });
    }
}
