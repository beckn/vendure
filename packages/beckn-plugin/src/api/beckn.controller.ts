import { Post, Controller, HttpCode, HttpStatus } from '@nestjs/common';

import { Ctx, RequestContext } from '@vendure/core';
import { WebhookService } from '../services/webhook.service';

@Controller('beckn')
export class BecknController {
    constructor(private webhookService: WebhookService) {}

    @Post()
    @HttpCode(HttpStatus.OK)
    webhook(@Ctx() ctx: RequestContext) {
        return this.webhookService.handleRequest(ctx);
    }
}
