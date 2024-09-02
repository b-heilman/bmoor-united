export type RequestParameters = Record<string, unknown>;

export interface RequestField {
	as?: string;
	path: string;
}

export interface RequestModel {
	name: string;
	fields: RequestField[];
}

export interface RequestJoinMapping {
	from: string;
	to: string;
}

export interface RequestJoin {
	optional?: boolean;
	toSeries: string;
	mappings: RequestJoinMapping[];
}

export interface RequestSeries extends RequestModel {
	series?: string;
	joins?: RequestJoin[];
}

export interface RequestSort {
	series: string;
	path: string;
	ascending: boolean;
}

export interface RequestSelect {
	models: RequestSeries[];
	sorts?: RequestSort[];
	offset?: {
		start: string;
		limit: number;
	};
}

export const RequestWhereJoin = {
	or: 'OR',
	and: 'AND',
};

export type RequestWhereConditionJoin = keyof typeof RequestWhereJoin;

export const RequestWhereArrayMethods = {
	in: 'IN',
};

export const RequestWhereScalarMethods = {
	eq: '=',
	lt: '<',
	lte: '<=',
	gt: '>',
	gte: '>=',
};

export interface RequestWhereBaseExpression {
	series: string;
	path: string;
}

export interface RequestWhereArrayExpression
	extends RequestWhereBaseExpression {
	operator: keyof typeof RequestWhereArrayMethods;
	value: unknown[];
}

export interface RequestWhereSingleExpression
	extends RequestWhereBaseExpression {
	operator: keyof typeof RequestWhereScalarMethods;
	value: unknown;
}

export type RequestWhereCondition =
	| RequestWhereArrayExpression
	| RequestWhereSingleExpression
	| RequestWhereExpression;

export interface RequestWhereExpression {
	conditions: RequestWhereCondition[];
	join?: RequestWhereConditionJoin;
}

//----- Action Types -----
export interface RequestCreate {
	model: RequestModel;
	params: RequestParameters[];
}

export interface RequestRead {
	select: RequestSelect;
	where?: RequestWhereExpression;
}

export interface RequestUpdate extends RequestCreate {
	where: RequestWhereExpression;
}

export interface RequestDelete {
	model: {
		name: string;
	};
	where?: RequestWhereExpression;
}
