# Instructions for docker based deployment of Vendure and beckn_vendure_plugin

## Setup domain name and nginx configuration

-   Setup a domain name for the shop to point to this machine
-   Configure nginx as reverse proxy to proxy_pass to port 3000

## Setup a database container on the machine

-   Create a folder for vendure-db

```
$ mkdir vendure-db
$ cd vendure-db
```

-   Create docker-compose.yml file as under

```
version: '3.8'
services:
    venduredb:
        container_name: venduredb
        image: postgres:15
        environment:
            - POSTGRES_USER=postgres
            - POSTGRES_PASSWORD=becknonix
        volumes:
            - vendure-db:/var/lib/postgresql/data
        ports:
            - 5432:5432
        networks:
            - vendure
volumes:
    vendure-db:
        name: vendure-db

networks:
    vendure:
        driver: bridge
        name: vendure
```

-   Run the database container

```
$ docker-compose up -d
```

-   Create a database for vendure

```
`docker exec -it venduredb psql -U postgres`
`$ CREATE DATABASE vendure`
```

## Install Vendure

1. Install vendure using `npx @vendure/create@2.1.9 vendure`

    a. Chose `postgres` as the database

    b. Gave `venduredb` as the host address for database. Credentials to match dockercompose.yml within vendure-db

    c. The installation will not be able to do database transactions as the connection with db cannot yet be established

2. Modify dockercompose.yml to match the network and database credentials. Remove the database service as it is already up

```
version: "3"
services:
  server:
    build:
      context: .
      dockerfile: Dockerfile
    ports:
      - 3000:3000
    command: ["npm", "run", "start:server"]
    volumes:
      - /usr/src/app
    environment:
      DB_HOST: venduredb
      DB_PORT: 5432
      DB_NAME: vendure
      DB_USERNAME: postgres
      DB_PASSWORD: becknonix
    networks:
      - vendure
  worker:
    build:
      context: .
      dockerfile: Dockerfile
    command: ["npm", "run", "start:worker"]
    volumes:
      - /usr/src/app
    environment:
      DB_HOST: venduredb
      DB_PORT: 5432
      DB_NAME: vendure
      DB_USERNAME: postgres
      DB_PASSWORD: becknonix
    networks:
      - vendure

networks:
    vendure:
         driver: bridge
         name: vendure
         external: true
```

3. `docker compose up` and the server should start, though going to UI will give connection error with server due to API path being wrong.

## Modify Vendure config for the API Path etc

-   Modify vendure-config.ts file in src folder to add the store url

```
        AssetServerPlugin.init({
            route: 'assets',
            assetUploadDir: path.join(__dirname, '../static/assets'),
            // For local dev, the correct value for assetUrlPrefix should
            // be guessed correctly, but for production it will usually need
            // to be set manually to match your production url.
            assetUrlPrefix: IS_DEV ? undefined : 'https://bpp-unified-vendure-onix.becknprotocol.io/assets/',
        })

        AdminUiPlugin.init({
            hostname: 'bpp-unified-vendure-onix.becknprotocol.io',
            route: 'admin',
            port: 3002
            //adminUiConfig: {
            //    apiPort: 3000,
            //},
        }),
```

## Install the beckn-vendure-plugin and dependencies

1. Clone the beckn/vendure repo and copy the beckn-vendure-plugin and related plugins into the new vendure install

```

cp -R ~/repos/beckn-vendure-plugin-repo/packages/beckn-vendure-plugin/ .
cp -R ~/repos/beckn-vendure-plugin-repo/packages/reviews/ .
cp -R ~/repos/beckn-vendure-plugin-repo/packages/digital-products/ .

```

2. Add the dependencies of the plugins to base package.json

```
"@nestjs/axios": "^3.0.0",
"json-diff": "1.0.6",
"jsonata": "2.0.3"
"@vendure/ui-devkit": "^2.1.7",
```

3. Configure the plugins in the vendure-config.ts and set db synchronize to true

```
import { ReviewsPlugin } from './plugins/reviews/reviews-plugin';
import { DigitalProductsPlugin } from './plugins/digital-products/digital-products.plugin';
import { BecknVendurePlugin } from './plugins/beckn-vendure-plugin/src/beckn-vendure-plugin';

synchronize: true,


ReviewsPlugin,
DigitalProductsPlugin,
BecknVendurePlugin.init({
            bpp_protocol_server_base_url: 'https://bpp-ps-client-onix.becknprotocol.io',
            bpp_id: 'bpp-ps-network-onix.becknprotocol.io',
            bpp_uri: 'https://bpp-ps-network-onix.becknprotocol.io',
            bpp_country: 'IND',
            bpp_city: 'std:080',
            transformationsFolder: path.join("src", 'plugins', 'beckn-vendure-plugin', 'transformations'),
        }),

```

4. Add the following path to exclude section of tsconfig.json

```
"src/plugins/**/e2e/*","src/plugins/**/vitest.config.ts"
```
