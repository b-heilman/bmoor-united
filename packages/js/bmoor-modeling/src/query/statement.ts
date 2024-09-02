import {SchemaReference} from '@bmoor/schema';

import {
	RequestField,
	RequestJoin,
	RequestJoinMapping,
	RequestSelect,
	RequestSeries,
	RequestWhereCondition,
	RequestWhereConditionJoin,
	RequestWhereExpression,
} from '../request.interface';
import { QueryStatementInterface, QueryStatementSeriesReference } from './statement.interface';

export class QueryStatement implements QueryStatementInterface{
	refs: Record<string, RequestSeries>;
	select: RequestSelect;
	where: RequestWhereExpression;

	constructor(
		base: SchemaReference,
		settings?: {
            series?: QueryStatementSeriesReference,
            fields?: RequestField[],
            joins?: RequestJoin[],
        }
	) {
		this.refs = {};
		this.select = {
			models: [],
		};

		this.where = {
			conditions: [],
		};

		this.addModel(base, settings);
	}

	addModel(
		name: SchemaReference,
        settings?: {
            series?: QueryStatementSeriesReference,
            fields?: RequestField[],
            joins?: RequestJoin[],
        }
	) {
        let series = name;
        let fields = [];
        let joins = [];

        if (!settings){
            settings = {series: name, fields: [], joins: []}
        }

		if (settings.series){
            series = settings.series;
        }

        if (settings.fields){
            fields = settings.fields;
        }

        if (settings.joins){
            joins = settings.joins;
        }

		if (this.refs[series]) {
			throw new Error('Duplicate series added');
		}

		const model: RequestSeries = {
			name,
			series,
			fields,
			joins,
		};

		this.refs[series] = model;

		this.select.models.push(model);

		return this;
	}

	addField(series: QueryStatementSeriesReference, path: string, as?: string) {
		this.refs[series].fields.push({
			as,
			path,
		});

		return this;
	}

	addModelJoin(
		fromSeries: QueryStatementSeriesReference,
		toSeries: QueryStatementSeriesReference,
		mappings: RequestJoinMapping[],
		optional: boolean = false,
	) {
		this.refs[fromSeries].joins.push({
			optional,
			toSeries,
			mappings,
		});

		return this;
	}

	setWhere(where: RequestWhereExpression) {
		this.where = where;

		return this;
	}

	setWhereJoin(join: RequestWhereConditionJoin) {
		this.where.join = join;

		return this;
	}

	addCondition(cond: RequestWhereCondition) {
		this.where.conditions.push(cond);

		return this;
	}

    getSelect(): RequestSelect {
        return this.select;
    }

    getWhere(): RequestWhereExpression {
        return this.where;
    }

    validate(): string[] {
        const keys = Object.keys(this.refs);

        if (keys.length === 1){
            return [];
        }

        const joined = keys.reduce((agg, ref) => {
            const seriesInfo = this.refs[ref];

            if (seriesInfo.joins.length){
                agg[ref] = true;

                seriesInfo.joins.forEach(rJoin => {
                    agg[rJoin.toSeries] = true;
                });
            } else if (!(ref in agg)){
                agg[ref] = false;
            }
            
            return agg;
        }, {});

        console.log(joined);

        return Object.keys(joined).filter(ref => !joined[ref])
            .map(ref => `Series ${ref} is detached`);
    }
}
