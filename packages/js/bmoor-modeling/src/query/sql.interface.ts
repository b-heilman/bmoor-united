export interface SqlSelectRequest {
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

export interface SqlSelectResponse {
	select: string;
	from: string;
	orderBy: string;
	limit: string;
}

export const SqlWhereJoin = {
	or: 'OR',
	and: 'AND',
};

export const SqlWhereArrayMethods = {
	in: 'IN',
};

export const SqlWhereScalarMethods = {
	eq: '=',
	lt: '<',
	lte: '<=',
	gt: '>',
	gte: '>=',
};

export interface SqlWhereBaseExpression {
	series: string;
	path: string;
}

export interface SqlWhereArrayExpression extends SqlWhereBaseExpression {
	operator: keyof typeof SqlWhereArrayMethods;
	value: unknown[];
}

export interface SqlWhereSingleExpression extends SqlWhereBaseExpression {
	operator: keyof typeof SqlWhereScalarMethods;
	value: unknown;
}

export interface SqlWhereExpression {
	ops: (
		| SqlWhereArrayExpression
		| SqlWhereSingleExpression
		| SqlWhereExpression
	)[];
	join?: keyof typeof SqlWhereJoin;
}

export interface SqlWhereRequest {
	params?: SqlWhereExpression;
	filters?: SqlWhereExpression;
}

export interface SqlWhereResponse {
	where: string;
	params: unknown[];
}

export interface SqlQueryRequest extends SqlWhereRequest {
	select: SqlSelectRequest;
}

export interface SqlInsertRequest {
	model: {
		name: string;
		fields: {
			path: string;
		}[];
	};
	params: unknown[];
}

export interface SqlUpdateRequest extends SqlInsertRequest {
	model: {
		name: string;
		fields: {
			path: string;
		}[];
	};
	where: SqlWhereRequest;
}

export interface SqlDeleteRequest {
	model: {
		name: string;
	};
	where: SqlWhereRequest;
}

export interface SqlPrepared {
	sql: string;
	params: unknown[];
}
