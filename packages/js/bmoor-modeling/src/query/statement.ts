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

export class Statement {
	refs: Record<string, RequestSeries>;
	select: RequestSelect;
	where: RequestWhereExpression;

	constructor(
		base: SchemaReference,
		series = null,
		fields: RequestField[] = [],
		joins: RequestJoin[] = [],
	) {
		this.refs = {};
		this.select = {
			models: [],
		};

		this.where = {
			conditions: [],
		};

		this.addModel(base, series, fields, joins);
	}

	addModel(
		name: SchemaReference,
		series = null,
		fields: RequestField[] = [],
		joins: RequestJoin[] = [],
	) {
		if (series === null) {
			series = name;
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

	addField(series, path, as?) {
		this.refs[series].fields.push({
			as,
			path,
		});

		return this;
	}

	addModelJoin(
		fromSeries,
		toSeries,
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
}
