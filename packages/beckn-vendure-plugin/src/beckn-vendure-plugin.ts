/* eslint-disable no-console */
import { OnModuleInit } from '@nestjs/common';
import { LanguageCode, PluginCommonModule, VendurePlugin } from '@vendure/core';
import { EventBus } from '@vendure/core';
import path from 'path';

import { shopApiExtensions } from './api/api-extensions';
import { BecknTransactionResolver } from './api/beckn-transaction.resolver';
import { ProductVariantSellerResolver } from './api/product-variant-seller.resolver';
import { BecknRequestEvent } from './beckn-request.event';
import { BECKN_VENDURE_PLUGIN_OPTIONS } from './constants';
import { BecknTransaction } from './entities/beckn-transaction.entity';
import { GenericHandlerService } from './generic-handler.service';
import { BecknTransactionService } from './services/beckn-transaction-service';
import { TransformerModule } from './transformer/transformer.module';
import { BecknVendurePluginOptions } from './types';
import { WebhookController } from './webhook.controller';
import { WebhookService } from './webhook.service';

@VendurePlugin({
    imports: [PluginCommonModule, TransformerModule],
    entities: [BecknTransaction],
    controllers: [WebhookController],
    shopApiExtensions: {
        schema: shopApiExtensions,
        resolvers: [BecknTransactionResolver, ProductVariantSellerResolver],
    },
    providers: [
        BecknTransactionService,
        WebhookService,
        GenericHandlerService,
        {
            provide: BECKN_VENDURE_PLUGIN_OPTIONS,
            useFactory: () => BecknVendurePlugin.options,
        },
    ],
    configuration: config => {
        config.customFields.Order.push({
            type: 'string',
            name: 'paymentCode',
        });
        config.customFields.Order.push({
            type: 'string',
            name: 'paymentTransactionId',
        });
        config.customFields.Order.push({
            type: 'string',
            name: 'paymentAmount',
        });
        config.customFields.Order.push({
            type: 'string',
            name: 'paymentCurrencyCode',
        });
        config.customFields.Order.push({
            type: 'datetime',
            name: 'paymentTime',
        });
        return config;
    },
    compatibility: '^2.0.0',
})
export class BecknVendurePlugin implements OnModuleInit {
    static options: BecknVendurePluginOptions;

    constructor(private eventBus: EventBus, private genericHandlerService: GenericHandlerService) {}
    onModuleInit() {
        // eslint-disable-next-line @typescript-eslint/no-floating-promises
        this.eventBus.ofType(BecknRequestEvent).subscribe(
            // eslint-disable-next-line @typescript-eslint/no-misused-promises
            async (event: BecknRequestEvent) => {
                await this.genericHandlerService.handleEvent(event.ctx);
            },
        );
    }

    static init(options: BecknVendurePluginOptions) {
        this.options = this.set_default_options(options);
        return BecknVendurePlugin;
    }

    static set_default_options(options: BecknVendurePluginOptions) {
        if (!options.transformationsFolder)
            options.transformationsFolder = path.join(__dirname, '..', '..', 'transformations');
        if (!options.domainTransformationsConfigFile)
            options.domainTransformationsConfigFile = path.join(
                options.transformationsFolder,
                'domain-map.json',
            );
        return options;
    }
}
