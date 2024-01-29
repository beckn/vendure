## Vendure Beckn Plugin

Enables a Vendure store/marketplace to be part of the Beckn commerce network as a Beckn Platform Provider.

## Installation

## From source code

1. Clone `https://github.com/beckn/vendure.git`
2. Copy the packages/beckn-vendure-plugin folder to the src/plugins folder of your Vendure installation.
3. Goto the beckn-vendure-plugin folder and type `npm install --omit=dev`
4. Modify the tsconfig.json file in the folder to make this line as follows `"extends": "../../../tsconfig.json", (basically go to one more parent than what is - this is due to the difference in structure between the src and this. Will be fixed in next release)
5. Run `npm run build`
6. Modify the vendure-config.ts file in the src folder of vendure installation to set the following:

```
import { BecknVendurePlugin } from "./plugins/beckn-vendure-plugin/lib/src/beckn-vendure-plugin";

// this is in the dbConnectionOptions
synchronize: true,


//Add this to plugins folder
BecknVendurePlugin.init({
      bpp_protocol_server_base_url: "http://localhost:6003",
      bpp_id: "vbabu.lr.bpp.1",
      bpp_uri: "https://vbabu-lr-bpp.loca.lt",
      bpp_country: "IND",
      bpp_city: "std:080",
      transformationsFolder: path.join(__dirname, "plugins", "beckn-vendure-plugin", "transformations"),
    }),


```

7. Run `npm run dev` to start vendure shop
