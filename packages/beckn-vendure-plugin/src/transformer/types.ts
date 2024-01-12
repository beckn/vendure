export interface BecknRequest {
    headers: { [key: string]: string };
    body: any;
}

export interface BecknRespose {
    headers: { [key: string]: string };
    body: any;
}

export interface GraphQLRequest {
    headers: { [key: string]: string };
    query: string;
}

export interface Context {
    env?: { [key: string]: string };
    beckn_request?: BecknRequest;
    graph_ql_request?: GraphQLRequest;
    gql_response?: any;
    beckn_response?: BecknRespose;
}
