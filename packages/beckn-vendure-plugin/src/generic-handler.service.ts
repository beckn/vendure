/* eslint-disable no-console */
import { HttpService } from '@nestjs/axios';
import { Injectable, Inject, Req, Res } from '@nestjs/common';
import { RequestContext, Logger } from '@vendure/core';
import { lastValueFrom, map } from 'rxjs';

import { axiosErrorHandler } from './common';
import { BECKN_VENDURE_PLUGIN_OPTIONS, loggerCtx } from './constants';
import { BecknVendurePluginOptions } from './types';

interface HandlerContext {
    ctx: RequestContext;
    beckn_request?: any;
    gql_request?: GQLRequest;
    gql_response?: any;
    beckn_response?: any;
    beckn_response_ack?: any;
}

interface GQLRequest {
    headers: [{ string: string }?];
    query: string;
}

@Injectable()
export class GenericHandlerService {
    constructor(@Inject(BECKN_VENDURE_PLUGIN_OPTIONS) private options: BecknVendurePluginOptions) {}
    async handleEvent(ctx: RequestContext) {
        const context: HandlerContext = {
            ctx,
        };
        context.beckn_request = ctx.req?.body;
        if (!context.beckn_request) {
            Logger.error('Could not parse body of Beck Request', loggerCtx);
            return;
        }
        context.gql_request = this._transform_to_graph_ql_request(context);
        if (!context.gql_request) {
            Logger.error('Could not transform to GraphQL Request', loggerCtx);
            return;
        }
        context.gql_response = await this._send_graph_ql_request(context);
        if (!context.gql_response) {
            Logger.error('Could not Send GraphQL Request', loggerCtx);
            return;
        }
        context.beckn_response = this._transform_to_beckn_response(context);
        if (!context.beckn_response) {
            Logger.error('Could not transform GraphQL Response to Beckn response', loggerCtx);
            return;
        }
        context.beckn_response_ack = await this._send_response_to_beckn(context);
        if (!context.beckn_response_ack) {
            Logger.error('Could not send response back to Beckn network', loggerCtx);
            return;
        }
        console.log('Successfully sent response back to beckn network');
    }

    _transform_to_graph_ql_request(context: HandlerContext): GQLRequest {
        const item_to_search: string = context.ctx.req?.body?.message?.intent?.item?.descriptor?.name;
        return {
            headers: [],
            query: `query Search {
            search(input: { term: "${item_to_search}" }) {
                totalItems
                items {
                    sku
                    slug
                    productVariantId
                    productVariantName
                    price {
                        ... on SinglePrice {
                            value
                        }
                        ... on PriceRange {
                            min
                            max
                        }
                    }
                    currencyCode
                }
            }
        }
        `,
        };
    }

    async _send_graph_ql_request(context: HandlerContext) {
        const gql_request = context.gql_request;
        const req = context.ctx.req;
        if (!gql_request || !req) return;
        let headers = {
            'content-type': 'application/json',
        };
        if (gql_request.headers.length > 0) {
            headers = {
                ...headers,
                ...gql_request.headers,
            };
        }
        const shop_url = `${req.protocol}://${req.get('host') || ''}/shop-api`;
        try {
            const httpService = new HttpService();
            const response = await lastValueFrom(
                httpService
                    .post(shop_url, JSON.stringify({ query: gql_request.query }), { headers })
                    .pipe(map(resp => resp.data)),
            );
            return response;
        } catch (err: any) {
            Logger.info(axiosErrorHandler(err).message, loggerCtx);
        }
    }

    _transform_to_beckn_response(context: HandlerContext) {
        // TODO: Will be replaced by Transformations
        const resp_items = [];
        const items = context.gql_response.data.search.items;
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
        const beckn_response = {
            context: context.beckn_request.context,
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
        beckn_response.context.action = 'on_' + (beckn_response.context.action as string);
        beckn_response.context.bpp_id = this.options.bpp_id;
        beckn_response.context.bpp_uri = this.options.bpp_uri;
        beckn_response.context.country = this.options.bpp_country;
        beckn_response.context.city = this.options.bpp_city;
        beckn_response.message.catalog.providers[0].items = resp_items;

        // console.log(JSON.stringify(context.beckn_request, null, 2));
        // console.log(JSON.stringify(context.gql_response.data, null, 2));
        // console.log(JSON.stringify(beckn_response, null, 2));
        return beckn_response;
    }
    async _send_response_to_beckn(context: HandlerContext) {
        const beckn_response = context.beckn_response;
        const headers = {
            'content-type': 'application/json',
        };
        const bpp_ps_url = `${this.options.bpp_protocol_server_base_url}/${
            beckn_response.context?.action as string
        }`;
        try {
            const httpService = new HttpService();
            const response = await lastValueFrom(
                httpService
                    .post(bpp_ps_url, JSON.stringify(beckn_response), { headers })
                    .pipe(map(resp => resp.data)),
            );
            return response;
        } catch (err: any) {
            Logger.info(axiosErrorHandler(err).message, loggerCtx);
        }
    }
}
