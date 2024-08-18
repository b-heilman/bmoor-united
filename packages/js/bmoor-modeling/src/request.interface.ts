export interface RequestCreate {
	model: {
		name: string;
		fields: {
			path: string;
		}[];
	};
	params: Record<string, unknown>[];
}

export interface RequestSelect {
	models: {
		name: string;
		series?: string;
		fields: {
			as?: string;
			path: string;
		}[];
		joins?: {
			optional?: boolean;
			toSeries: string;
			mappings: {
				from: string;
				to: string;
			}[];
		}[];
	}[];
	sorts?: {
		series: string;
		path: string;
		ascending: boolean;
	}[];
	offset?: {
		start: string;
		limit: number;
	};
}

export const RequestWhereJoin = {
	or: 'OR',
	and: 'AND',
};

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

export interface RequestWhereExpression {
	ops: (
		| RequestWhereArrayExpression
		| RequestWhereSingleExpression
		| RequestWhereExpression
	)[];
	join?: keyof typeof RequestWhereJoin;
}

export interface RequestWhere {
	params?: RequestWhereExpression;
	filters?: RequestWhereExpression;
}

export interface RequestRead extends RequestWhere {
	select: RequestSelect;
}

export interface RequestUpdate extends RequestCreate {
	where: RequestWhere;
}

export interface RequestDelete extends RequestWhere {
	model: {
		name: string;
	};
}
