/* eslint-disable no-console */
import { OnModuleInit } from '@nestjs/common';
import { PluginCommonModule, VendurePlugin } from '@vendure/core';

@VendurePlugin({
  imports: [PluginCommonModule],
})
export class BecknVendurePlugin implements OnModuleInit {
  onModuleInit() {
    console.log('On Module Init of Beckn Vendure Plugin');
  }
}
