import { PluginCommonModule, VendurePlugin } from '@vendure/core';
import { BecknPluginOptions } from './types';

@VendurePlugin({
    imports: [PluginCommonModule],
})
export class BecknPlugin {
    static options: BecknPluginOptions;

    static init(options: BecknPluginOptions) {
        console.log(options);
        return BecknPlugin;
    }
}
