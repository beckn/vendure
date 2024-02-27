/* eslint-disable no-console */
import { HttpService } from '@nestjs/axios';
import { Injectable, Inject, Req, Res } from '@nestjs/common';
import { RequestContext, Logger } from '@vendure/core';
import { IncomingHttpHeaders } from 'http';
import { lastValueFrom, map } from 'rxjs';

import { axiosErrorHandler } from './common';
import { BECKN_VENDURE_PLUGIN_OPTIONS, loggerCtx } from './constants';
import { TransformerService } from './transformer/transformer.service';
import { BecknRequest, BecknResponse } from './transformer/types';
import { BecknVendurePluginOptions, Environment } from './types';

@Injectable()
export class GenericHandlerService {
    constructor(
        @Inject(BECKN_VENDURE_PLUGIN_OPTIONS) private options: BecknVendurePluginOptions,
        @Inject(TransformerService) private transformer: TransformerService,
    ) {}

    async handleEvent(ctx: RequestContext) {
        try {
            const env: Environment = this._get_environment(ctx);
            const beckn_request = this._get_beckn_request(ctx);
            const beckn_response = await this.transformer.transform(env, beckn_request);
            if (beckn_response) await this._send_response_to_beckn(env, beckn_response);
        } catch (err: any) {
            Logger.error(err.message, loggerCtx);
            console.log(err.stack);
        }
    }

    async _send_response_to_beckn(env: { [key: string]: string }, beckn_response: BecknResponse) {
        // console.log(JSON.stringify(beckn_response, null, 2));
        const bpp_ps_url = `${this.options.bpp_protocol_server_base_url}/${
            beckn_response.body?.context?.action as string
        }`;
        try {
            const httpService = new HttpService();
            const response = await lastValueFrom(
                httpService
                    .post(bpp_ps_url, JSON.stringify(beckn_response.body), {
                        headers: beckn_response.headers,
                    })
                    .pipe(map(resp => resp.data)),
            );
            return response;
        } catch (err: any) {
            throw Error(axiosErrorHandler(err).message);
        }
    }

    _get_simplified_string_headers(headers: IncomingHttpHeaders) {
        return Object.entries(headers)
            .map(([k, v]) => [k.toString(), v ? v.toString() : ''])
            .reduce((acc: { [key: string]: string }, [k, v]) => {
                acc[k] = v;
                return acc;
            }, {});
    }

    _get_environment(ctx: RequestContext): Environment {
        if (!ctx.req || !ctx.req.body || !ctx.req.headers) throw Error('Request Context is empty');
        return {
            host_url: `${ctx.req.protocol || ''}://${ctx.req.headers.host || ''}`,
            bpp_id: this.options.bpp_id,
            bpp_uri: this.options.bpp_uri,
            bpp_country: this.options.bpp_country,
            bpp_city: this.options.bpp_city,
            transformationsFolder: this.options.transformationsFolder as string,
            versionTransformationsConfigFile: this.options.versionTransformationsConfigFile as string,
        };
    }

    _get_beckn_request(ctx: RequestContext): BecknRequest {
        if (!ctx.req || !ctx.req.body || !ctx.req.headers) throw Error('Request Context is empty');
        return {
            headers: this._get_simplified_string_headers(ctx.req?.headers),
            body: ctx.req?.body,
        };
    }
}
