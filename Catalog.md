## How to import a catalog to Vendure shop

### Setting up a new shop

Use the following steps in admin UI to setup a shop in Vendure

1. Login using the superadmin credentials
2. Create a new Seller
3. Create a new channel and associate it with the seller. Note down the channel token string.
4. For future steps, make sure you select the newly created shop in the top left
5. Create a default Stock Location
6. Create a default shipping method
7. Create a default payment method
8. Create catalog files in the format shown in the [sample.csv](./misc/sample.csv)
9. Find the postman file [here](./misc/ImportProducts.postman_collection.json) and perform the following steps
   a. Create a postman environment with the following four variables
   i. base_url - https://bpp-unified-vendure-dev.becknprotocol.io (The address of the vendure server)
   ii. vendure-admin-token - You can leave this blank. It will be filled automatically by the login process
   iii. admin-username - Vendure superadmin or store admin username
   iv. admin-password - Vendure superadmin or store admin password
   b. Send the Login request. It will return with response like this if it succeeds. Also the vendure-admin-token variable will be filled with the admin token
   ```
   {
     "data": {
         "login": {
             "id": "1",
             "identifier": "superadmin"
         }
     }
   }
   ```
   c. Open the ImportProducts request. In the Headers section fill the vendure-token variable with the channel token of the shop (See step 3 above)
   d. In the body, in the variable called 0, attach the catalog csv file.
   e. Send the request and you should get a response with the number of products that have been added to Vendure.
10. If you are importing data from an existing shop, refer to the [readme](./misc/catalog_from_search/README.md) file for how to do it.
