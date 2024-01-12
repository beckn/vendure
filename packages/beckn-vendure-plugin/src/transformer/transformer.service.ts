/* eslint-disable no-console */
import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { Logger } from '@vendure/core';
import { lastValueFrom, map } from 'rxjs';

import { axiosErrorHandler } from '../common';
import { loggerCtx } from '../constants';

import { BecknRequest, BecknRespose, Context } from './types';

@Injectable()
export class TransformerService {
    async transform(env: { [key: string]: string }, beckn_request: BecknRequest) {
        const context: Context = { env, beckn_request };
        this.form_graph_ql_request(context);
        await this._send_graph_ql_request(context);
        this._transform_to_beckn_response(context);

        return context.beckn_response;
    }

    form_graph_ql_request(context: Context) {
        const item_to_search: string = context.beckn_request?.body?.message?.intent?.item?.descriptor?.name;
        // console.log(JSON.stringify(context.ctx.req?.body));
        context.graph_ql_request = {
            headers: { 'content-type': 'application/json' },
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

    async _send_graph_ql_request(context: Context) {
        const gql_request = context.graph_ql_request;
        const env = context.env;
        if (!gql_request || !env) return;
        const shop_url = `${env.host_url}/shop-api`;
        try {
            const httpService = new HttpService();
            const response = await lastValueFrom(
                httpService
                    .post(shop_url, JSON.stringify({ query: gql_request.query }), {
                        headers: gql_request.headers,
                    })
                    .pipe(map(resp => resp.data)),
            );
            // console.log(JSON.stringify(response));
            context.gql_response = response;
        } catch (err: any) {
            Logger.info(axiosErrorHandler(err).message, loggerCtx);
        }
    }

    _transform_to_beckn_response(context: Context) {
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
        context.beckn_response = {
            headers,
            body,
        };
    }
}
