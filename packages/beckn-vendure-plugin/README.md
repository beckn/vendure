## Beckn Vendure Plugin

Enables a Vendure store/multi-tenant setup to be part of the Beckn commerce network as a Beckn Platform Provider.

## Installation

## From source code

1. Clone `https://github.com/beckn/vendure.git`
2. Copy the packages/beckn-vendure-plugin folder to the src/plugins folder of your Vendure installation.
3. Goto the beckn-vendure-plugin folder and type `npm install --omit=dev`
4. Run `npm run build`
5. Modify the vendure-config.ts file in the src folder of vendure installation to set the following:

```
import { BecknVendurePlugin } from "./plugins/beckn-vendure-plugin/";

// this is in the dbConnectionOptions
synchronize: true,


//Add this to plugins folder
BecknVendurePlugin.init({
      bpp_protocol_server_base_url: "http://localhost:6003", //bpp client url
      bpp_id: YOUR_BPP_ID,
      bpp_uri: YOUR_BPP_URI",
      bpp_country: "IND",
      bpp_city: "std:080",
      transformationsFolder: path.join(__dirname, "plugins", "beckn-vendure-plugin", "transformations"),
    }),


```

7. Run `npm run dev` to start vendure shop

## Reviews plugin installation

The Beckn Vendure Plugin uses the ReviewsPlugin for ratings functionality.

1. Copy the reviews plugin from `/packages/dev-server/test-plugins` of `vendure` repo to `src/plugins` folder.
2. Run `npm run build`. If you get errors on ui-devkit, run `npm install -D @vendure/ui-devkit`
3. Run `npm run build` and `npm run dev`. It should start without errors.
4. Add `ReviewsPlugin,` to the plugins arrary in vendure-config.ts file.
