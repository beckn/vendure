import { Post, Controller, HttpCode, HttpStatus } from '@nestjs/common';

import { Ctx, RequestContext } from '@vendure/core';

@Controller('beckn')
export class BecknController {
    @Post()
    @HttpCode(HttpStatus.OK)
    webhook(@Ctx() ctx: RequestContext) {
        console.log('Called webhook');
    }
}
