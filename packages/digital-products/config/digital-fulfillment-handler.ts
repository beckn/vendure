import { FulfillmentHandler, LanguageCode, OrderLine, TransactionalConnection } from '@vendure/core';
import { In } from 'typeorm';

let connection: TransactionalConnection;

/**
 * @description
 * This is a fulfillment handler for digital products which generates a download url
 * for each digital product in the order.
 */
export const digitalFulfillmentHandler = new FulfillmentHandler({
    code: 'digital-fulfillment',
    description: [
        {
            languageCode: LanguageCode.en,
            value: 'Generates product keys for the digital download',
        },
    ],

    args: {},
    init: injector => {
        connection = injector.get(TransactionalConnection);
    },
    createFulfillment: async (ctx, orders, lines) => {
        let downloadUrls: string[] = [];
        let titles: string[] = [];
        let descriptions: string[] = [];
        let durations: string[] = [];
        let statuses: string[] = [];

        const orderLines = await connection.getRepository(ctx, OrderLine).find({
            where: {
                id: In(lines.map(l => l.orderLineId)),
            },
            relations: {
                productVariant: true,
            },
        });
        for (const orderLine of orderLines) {
            if (orderLine.productVariant.customFields.isDigital) {
                // This is a digital product, so generate a download url
                downloadUrls = downloadUrls.concat(orderLine.productVariant.customFields.downloadUrls || []);
                titles = titles.concat(orderLine.productVariant.customFields.titles || []);
                descriptions = descriptions.concat(orderLine.productVariant.customFields.descriptions || []);
                durations = durations.concat(orderLine.productVariant.customFields.durations || []);
                statuses = statuses.concat(orderLine.productVariant.customFields.statuses || []);
            }
        }
        return {
            method: 'Digital Fulfillment',
            trackingCode: 'DIGITAL',
            customFields: {
                downloadUrls: downloadUrls,
                titles: titles,
                descriptions: descriptions,
                durations: durations,
                statuses: statuses,
            },
        };
    },
});
