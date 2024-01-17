import assert from 'assert';

import { TransformTask, TransformTaskDef } from '../types';

export class CreateBecknResponse implements TransformTask {
    constructor(public taskDef: TransformTaskDef) {}
    private inputKey: string;
    private outputKey: string;
    async preCheck(context: any): Promise<boolean> {
        this.inputKey = this.taskDef.args?.input || 'graphql_response';
        this.outputKey = this.taskDef.args?.output || 'beckn_response';
        return true;
    }
    async run(context: any): Promise<void> {
        // TODO: Will be replaced by Transformations
        const resp_items = [];
        const items = context[this.inputKey].data.search.items;
        for (const item of items) {
            const resp_item = {
                id: item.productVariantId,
                descriptor: {
                    name: item.productVariantName,
                },
                matched: true,
                price: {
                    listed_value: (item.price.value / 100).toFixed(2).toString(),
                    currency: item.currencyCode,
                    value: (item.price.value / 100).toFixed(2).toString(),
                },
            };
            resp_items.push(resp_item);
        }
        const headers = {
            'content-type': 'application/json',
        };
        const body = {
            context: context.beckn_request?.body?.context,
            message: {
                catalog: {
                    descriptor: {
                        name: 'Vendure Shop Catalog',
                    },
                    providers: [
                        {
                            id: 'Vendure_Default_Shop_Token',
                            descriptor: {
                                name: 'Default Vendure Shop',
                            },
                            items: resp_items,
                        },
                    ],
                },
            },
        };
        body.context.action = 'on_' + (body.context.action as string);
        body.context.bpp_id = context.env?.bpp_id;
        body.context.bpp_uri = context.env?.bpp_uri;
        body.context.country = context.env?.bpp_country;
        body.context.city = context.env?.bpp_city;
        body.message.catalog.providers[0].items = resp_items;
        context[this.outputKey] = {
            headers,
            body,
        };
    }
}
