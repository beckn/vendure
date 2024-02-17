import { PluginCommonModule, VendurePlugin } from '@vendure/core';
import { BecknPluginOptions } from './types';
import { BecknController } from './api/beckn.controller';

@VendurePlugin({
    imports: [PluginCommonModule],
    controllers: [BecknController],
})
export class BecknPlugin {
    static options: BecknPluginOptions;

    static init(options: BecknPluginOptions) {
        console.log(options);
        return BecknPlugin;
    }
}
