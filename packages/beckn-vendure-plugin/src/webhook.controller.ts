/* eslint-disable no-console */
import { Controller, Post, HttpCode, HttpStatus } from '@nestjs/common';
import { Ctx, RequestContext } from '@vendure/core';

import { WebhookService } from './webhook.service';

@Controller('beckn')
export class WebhookController {
    constructor(private webhookService: WebhookService) {}
    @Post()
    @HttpCode(HttpStatus.OK)
    webhook(@Ctx() ctx: RequestContext) {
        console.log("Received webhook")
        this.webhookService.handleRequest(ctx);
    }
}
