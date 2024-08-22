export interface SqlSelectResponse {
	select: string;
	from: string;
	orderBy: string;
	limit: string;
}

export interface SqlWhereResponse {
	where: string;
	params: unknown[];
}

export interface SqlPrepared {
	sql: string;
	params: unknown[];
}
