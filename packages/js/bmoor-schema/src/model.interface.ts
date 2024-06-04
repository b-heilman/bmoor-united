import { SchemaInterface, SchemaSettings } from "./schema.interface";

export interface ModelSettings<T> extends SchemaSettings {
    fetch: (
        ids: string[],
        // query params, sort, pagination
        filters: Record<string, number|string|boolean>,
        // http headers, db connection info, aws credentials
        settings: Record<string, number|string|boolean>
    ) => Promise<T>
}

export interface ModelInterface<T> extends SchemaInterface {
    fetch: (
        ids: string[],
        // query params, sort, pagination
        filters: Record<string, number|string|boolean>,
        // http headers, db connection info, aws credentials
        settings: Record<string, number|string|boolean>
    ) => Promise<T>
}