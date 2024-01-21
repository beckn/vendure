/* eslint-disable no-console */
import { ErrorResult } from '@vendure/core';
import { readJSON } from 'fs-extra';
import path from 'path';

export const axiosErrorHandler = (error: any) => {
    const { errors, response } = error;
    if (response) {
        return {
            message: JSON.stringify(response.data),
            status: response.status,
        };
    } else if (errors) {
        return {
            message: JSON.stringify(errors),
            status: 503,
        };
    } else {
        // Something happened in setting up the request that triggered an Error
        return { message: error.message };
    }
};

export const assertUnreachable = (x: never, message: string) => {
    throw new Error(message);
};

export function get_simplified_string_headers(headers: any) {
    return Object.entries(headers)
        .map(([k, v]) => [k.toString(), v ? v.toString() : ''])
        .reduce((acc: { [key: string]: string }, [k, v]) => {
            acc[k] = v;
            return acc;
        }, {});
}
