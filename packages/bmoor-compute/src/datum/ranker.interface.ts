export type DatumRankerSettings<NodeSelector> = {
	select: NodeSelector; // run this against the datum to select what else it's compared to
	asc?: boolean;
	buckets?: number;
};
