import { SchemaReference } from "@bmoor/schema";
import { RequestField, RequestJoin, RequestJoinMapping, RequestSelect, RequestWhereCondition, RequestWhereConditionJoin, RequestWhereExpression } from "../request.interface";

export type QueryStatementSeriesReference = string;

export interface QueryStatementInterface {
    addModel(
        name: SchemaReference,
		settings?: {
			series?: QueryStatementSeriesReference,
			fields?: RequestField[],
			joins?: RequestJoin[],
		}
	): QueryStatementInterface;

    addField(series: QueryStatementSeriesReference, path: string, as?: string): QueryStatementInterface;

    addModelJoin(
		fromSeries: QueryStatementSeriesReference,
		toSeries: QueryStatementSeriesReference,
		mappings: RequestJoinMapping[],
		optional?: boolean,
	): QueryStatementInterface;

    setWhere(where: RequestWhereExpression): QueryStatementInterface;

	setWhereJoin(join: RequestWhereConditionJoin): QueryStatementInterface;

	addCondition(cond: RequestWhereCondition): QueryStatementInterface;

    getSelect(): RequestSelect;

    getWhere(): RequestWhereExpression;

    validate(): string[];
}