/* eslint-disable no-console */
import { Injectable, Inject } from '@nestjs/common';
import { RequestContext } from '@vendure/core';

import { BECKN_VENDURE_PLUGIN_OPTIONS } from './constants';
import { BecknVendurePluginOptions } from './types';

@Injectable()
export class GenericHandlerService {
    constructor(@Inject(BECKN_VENDURE_PLUGIN_OPTIONS) private options: BecknVendurePluginOptions) {}
    handleEvent(ctx: RequestContext) {
        console.log('Received Message');
        console.log(JSON.stringify(ctx.req?.body));
        console.log(this.options);
    }
}
