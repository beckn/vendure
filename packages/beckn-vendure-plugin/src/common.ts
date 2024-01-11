import { ErrorResult } from '@vendure/core';

export const axiosErrorHandler = (error: any) => {
    const { errors, response } = error;
    if (response) {
        const { message } = response.data;
        const status = response.status;
        return {
            message,
            status,
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
