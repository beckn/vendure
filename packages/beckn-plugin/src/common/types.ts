export interface BecknPluginOptions {
    bpp_protocol_server_base_url: string;
    bpp_id: string;
    bpp_uri: string;
}

export type BecknActions =
    | 'search'
    | 'select'
    | 'init'
    | 'confirm'
    | 'cancel'
    | 'status'
    | 'track'
    | 'udpate'
    | 'rating'
    | 'support';

export interface BecknRequest {
    headers: { [key: string]: string };
    body: {
        message: any;
        context: {
            action: BecknActions;
            [key: string]: any;
        };
    };
}
