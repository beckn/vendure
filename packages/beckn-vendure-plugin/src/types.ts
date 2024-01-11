export interface BecknVendurePluginOptions {
    bpp_protocol_server_base_url: string;
    bpp_id: string;
    bpp_uri: string;
    bpp_country: string;
    bpp_city: string;

    transformationsFolder?: string;
    domainMapFilename?: string;
}
