import { PluginCommonModule, VendurePlugin } from '@vendure/core';
import { BecknPluginOptions } from './types';
import { BecknController } from './api/beckn.controller';
import { WebhookService } from './services/webhook.service';

@VendurePlugin({
    imports: [PluginCommonModule],
    controllers: [BecknController],
    providers: [WebhookService],
})
export class BecknPlugin {
    static options: BecknPluginOptions;

    static init(options: BecknPluginOptions) {
        console.log(options);
        return BecknPlugin;
    }
}
