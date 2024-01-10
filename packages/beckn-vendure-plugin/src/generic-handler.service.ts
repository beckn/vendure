/* eslint-disable no-console */
import { HttpService } from '@nestjs/axios';
import { Injectable, Inject, Req, Res } from '@nestjs/common';
import { RequestContext } from '@vendure/core';

import { BECKN_VENDURE_PLUGIN_OPTIONS } from './constants';
import { BecknVendurePluginOptions } from './types';
import { lastValueFrom, map } from 'rxjs';

interface HandlerContext {
    ctx: RequestContext;
    beckn_request?: any;
    gql_request?: GQLRequest;
    gql_response?: any;
    beckn_response?: any;
    beckn_response_ack?: any;
}

interface GQLRequest {
    authorization: string;
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
        context.gql_request = this._transform_to_graph_ql_request(context);
        context.gql_response = await this._send_graph_ql_request(context);
        context.beckn_response = this._transform_to_beckn_response(context);
        context.beckn_response_ack = this._send_response_to_beckn(context);
    }
    _transform_to_graph_ql_request(context: HandlerContext): GQLRequest {
        const item_to_search: string = context.ctx.req?.body?.message?.intent?.item?.descriptor?.name;
        return {
            authorization: '',
            query: `query Search {
            search(input: { term: "${item_to_search}" }) {
                totalItems
                items {
                    sku
                    slug
                    productId
                    productName
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
        const headers = {
            'content-type': 'application/json',
            authorization: gql_request.authorization,
        };
        console.log(gql_request.query);
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
            console.log(JSON.stringify(err.response.data));
        }
    }

    _transform_to_beckn_response(context: HandlerContext) {
        const gql_response = context.gql_response;
        console.log(JSON.stringify(gql_response));
    }
    _send_response_to_beckn(context: HandlerContext) {
        console.log('Send response to Beckn');
    }
}
