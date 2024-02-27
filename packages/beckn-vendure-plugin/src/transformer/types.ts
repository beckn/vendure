import { Environment } from '../types';

export interface BecknRequest {
    headers: { [key: string]: string };
    body: {
        message: any;
        context: {
            action: string;
            [key: string]: any;
        };
    };
}

export interface BecknResponse {
    headers: { [key: string]: string };
    body: any;
}

export interface GraphQLRequest {
    headers: { [key: string]: string };
    query: string;
}

export interface RequestEnvironment {
    version: string;
    action: string;
    versionConfigFile: string;
    versionSupportFilesFolder: string;
}

export interface TransformerContext {
    env: Environment;
    becknRequest: BecknRequest;
    requestEnv?: RequestEnvironment;
    tasksDefList?: TransformTaskDef[];
    [key: string]: any;
}

export interface TransformTaskDef {
    type: SupportedTransformTasks;
    name?: string;
    args?: { [key: string]: string };
    condition?: string;
}

export interface TransformTask {
    taskDef: TransformTaskDef;
    preCheck(context: TransformerContext): boolean;
    run(context: TransformerContext): Promise<void>;
}

export interface VersionMap {
    [key: string]: {
        mapFile: string;
        supportFilesFolder: string;
    };
}

export type SupportedTransformTasks =
    | 'transform-and-add'
    | 'send-graphql-request'
    | 'send-multiple-graphql-requests';
