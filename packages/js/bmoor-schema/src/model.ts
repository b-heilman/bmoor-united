import { ModelInterface, ModelSettings } from "./model.interface";
import { Schema } from "./schema";

/**
 * A very basic class that gives a way to interact with a schema.  A more
 * complex model will be in bmoor-model.
 */
export class Model<T> extends Schema implements ModelInterface<T> {
    fetcher;

    constructor(settings: ModelSettings<T>){
        super(settings)

        this.fetcher = settings.fetch;
    }

    async fetch (
        ids: string[],
        // query params, sort, pagination
        filters: Record<string, number|string|boolean>,
        // http headers, db connection info, aws credentials
        settings: Record<string, number|string|boolean>
    ): Promise<T> {
        return this.fetcher(ids, filters, settings);
    }
}