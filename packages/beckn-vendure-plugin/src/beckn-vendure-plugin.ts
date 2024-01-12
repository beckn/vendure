/* eslint-disable no-console */
import { OnModuleInit } from '@nestjs/common';
import { PluginCommonModule, VendurePlugin } from '@vendure/core';
import { EventBus } from '@vendure/core';
import path from 'path';

import { BecknRequestEvent } from './beckn-request.event';
import { BECKN_VENDURE_PLUGIN_OPTIONS } from './constants';
import { GenericHandlerService } from './generic-handler.service';
import { TransformerModule } from './transformer/transformer.module';
import { BecknVendurePluginOptions } from './types';
import { WebhookController } from './webhook.controller';
import { WebhookService } from './webhook.service';

@VendurePlugin({
    imports: [PluginCommonModule, TransformerModule],
    controllers: [WebhookController],
    providers: [
        WebhookService,
        GenericHandlerService,
        {
            provide: BECKN_VENDURE_PLUGIN_OPTIONS,
            useFactory: () => BecknVendurePlugin.options,
        },
    ],
})
export class BecknVendurePlugin implements OnModuleInit {
    static options: BecknVendurePluginOptions;

    constructor(private eventBus: EventBus, private genericHandlerService: GenericHandlerService) {}
    onModuleInit() {
        this.eventBus.ofType(BecknRequestEvent).subscribe((event: BecknRequestEvent) => {
            this.genericHandlerService.handleEvent(event.ctx);
        });
    }

    static init(options: BecknVendurePluginOptions) {
        this.options = this.set_default_options(options);
        return BecknVendurePlugin;
    }

    static set_default_options(options: BecknVendurePluginOptions) {
        if (!options.transformationsFolder)
            options.transformationsFolder = path.join(__dirname, '..', '..', 'transformations');
        if (!options.domainMapFilename)
            options.domainMapFilename = path.join(options.transformationsFolder, 'domain-map.json');
        return options;
    }
}
