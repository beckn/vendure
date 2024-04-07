/* eslint-disable no-console */
import { OnModuleInit } from '@nestjs/common';
import { Asset, LanguageCode, PluginCommonModule, VendurePlugin } from '@vendure/core';
import { EventBus } from '@vendure/core';
import path from 'path';

import { shopApiExtensions } from './api/api-extensions';
import { BecknTransactionResolver } from './api/beckn-transaction.resolver';
import { ProductVariantResolver } from './api/product-variant.resolver';
import { BecknRequestEvent } from './beckn-request.event';
import { BECKN_VENDURE_PLUGIN_OPTIONS } from './constants';
import { BecknTransaction } from './entities/beckn-transaction.entity';
import { GenericHandlerService } from './generic-handler.service';
import { BecknTransactionService } from './services/beckn-transaction-service';
import { TransformerModule } from './transformer/transformer.module';
import { BecknVendurePluginOptions } from './types';
import { WebhookController } from './webhook.controller';
import { WebhookService } from './webhook.service';
import { DigitalFulfillmentResolver } from './api/digital-fulfillment-resolver';
import { DigitalFulfillmentService } from './services/digital-fulfillment-service';

@VendurePlugin({
    imports: [PluginCommonModule, TransformerModule],
    entities: [BecknTransaction],
    controllers: [WebhookController],
    shopApiExtensions: {
        schema: shopApiExtensions,
        resolvers: [BecknTransactionResolver, ProductVariantResolver, DigitalFulfillmentResolver],
    },
    providers: [
        BecknTransactionService,
        WebhookService,
        GenericHandlerService,
        DigitalFulfillmentService,
        {
            provide: BECKN_VENDURE_PLUGIN_OPTIONS,
            useFactory: () => BecknVendurePlugin.options,
        },
    ],
    configuration: config => {
        config.customFields.Order.push(
            {
                type: 'string',
                name: 'paymentCode',
            },
            {
                type: 'string',
                name: 'paymentTransactionId',
            },
            {
                type: 'string',
                name: 'paymentAmount',
            },
            {
                type: 'string',
                name: 'paymentCurrencyCode',
            },
            {
                type: 'datetime',
                name: 'paymentTime',
            },
        );
        config.customFields.Seller.push(
            {
                type: 'text',
                name: 'shortDescription',
            },
            {
                type: 'text',
                name: 'longDescription',
            },
            {
                type: 'string',
                name: 'phoneNumber',
            },
            {
                type: 'string',
                name: 'email',
            },
            {
                type: 'string',
                name: 'url',
            },
            {
                type: 'text',
                name: 'address',
            },
            {
                type: 'string',
                name: 'taxId',
            },
            {
                type: 'relation',
                name: 'images',
                entity: Asset,
                list: true,
            },
        );
        config.customFields.OrderLine.push(
            {
                type: 'datetime',
                name: 'startTime',
            },
            {
                type: 'datetime',
                name: 'endTime',
            },
        );
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
        if (!options.versionTransformationsConfigFile)
            options.versionTransformationsConfigFile = path.join(
                options.transformationsFolder,
                'version-map.json',
            );
        return options;
    }
}
