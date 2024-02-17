import { OnModuleInit } from '@nestjs/common';

import { EventBus, PluginCommonModule, VendurePlugin } from '@vendure/core';
import { BecknPluginOptions } from './common/types';
import { BecknController } from './api/beckn.controller';
import { WebhookService } from './services/webhook.service';
import { BecknRequestHandler } from './services/beckn-request-handler.service';
import { BecknRequestEvent } from './common/beckn-request.event';

@VendurePlugin({
    imports: [PluginCommonModule],
    controllers: [BecknController],
    providers: [WebhookService, BecknRequestHandler],
})
export class BecknPlugin implements OnModuleInit {
    constructor(private eventBus: EventBus, private becknRequestHandler: BecknRequestHandler) {}
    onModuleInit() {
        // eslint-disable-next-line @typescript-eslint/no-floating-promises
        this.eventBus.ofType(BecknRequestEvent).subscribe(
            // eslint-disable-next-line @typescript-eslint/no-misused-promises
            async (event: BecknRequestEvent) => {
                await this.becknRequestHandler.handleEvent(event.ctx);
            },
        );
    }

    static options: BecknPluginOptions;

    static init(options: BecknPluginOptions) {
        this.options = options;
        return BecknPlugin;
    }
}
