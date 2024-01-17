export interface BecknRequest {
    headers: { [key: string]: string };
    body: any;
}

export interface BecknResponse {
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
    graphql_request?: GraphQLRequest;
    gql_response?: any;
    beckn_response?: BecknResponse;
}

export interface TransformTaskDef {
    type: SupportedTransformTasks;
    args?: { [key: string]: string };
    condition?: string;
}

export interface TransformTask {
    taskDef: TransformTaskDef;
    preCheck(context: any): Promise<boolean>;
    run(context: any): Promise<void>;
}

export type SupportedTransformTasks =
    | 'create-graphql-query'
    | 'send-graphql-request'
    | 'create-beckn-response';
