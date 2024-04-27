## Convert Search Result to Vendure Catalog Import format

This script converts any Beckn Item search result into a csv format that can be used to import those search items into Vendure shops.
Use this script along with the instructions in [this file](../../Catalog.md) to transfer items from any shop into Vendure.

## Instructions to use the script

This script has been written to migrate from 0.9.4 version of Beckn. To use it with 1.1.0, in the file search_result_to_vendure_csv.ts search for "bpp/providers" and make it "providers"

1. Search any Beckn shop to get item results.
2. Save the results in a file such as items.json
3. From the item.json file, identify the ShopName whose results you want to import. It will be present in the response.message.catalog.["bpp/providers"].[n].descriptor.name key.(for 1.1.0 it will be response.message.catalog.providers[n].desriptor.name)
4. Run the npm run start command with the right parameters to see the csv file created.
5. Use this csv file to import into Vendure using the process described [here](../../Catalog.md)

```
npm install
npm run build
npm run start -- ShopName items.json items.csv
```
