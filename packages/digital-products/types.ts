import {
    CustomProductVariantFields,
    CustomFulfillmentFields,
    CustomShippingMethodFields,
} from '@vendure/core/dist/entity/custom-entity-fields';

declare module '@vendure/core/dist/entity/custom-entity-fields' {
    interface CustomProductVariantFields {
        isDigital: boolean;
        downloadUrls: string[] | null;
        titles: string[] | null;
        descriptions: string[] | null;
        durations: string[] | null;
        statuses: string[] | null;
    }
    interface CustomShippingMethodFields {
        isDigital: boolean;
    }
    interface CustomFulfillmentFields {
        downloadUrls: string[] | null;
        titles: string[] | null;
        descriptions: string[] | null;
        durations: string[] | null;
        statuses: string[] | null;
    }
}
