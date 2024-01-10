/* eslint-disable no-console */
import { OnModuleInit } from '@nestjs/common';
import { PluginCommonModule, VendurePlugin } from '@vendure/core';

import { WebhookController } from './webhook.controller';
import { WebhookService } from './webhook.service';

@VendurePlugin({
    imports: [PluginCommonModule],
    controllers: [WebhookController],
    providers: [WebhookService],
})
export class BecknVendurePlugin implements OnModuleInit {
    onModuleInit() {
        console.log('On Module Init of Beckn Vendure Plugin');
    }
}
