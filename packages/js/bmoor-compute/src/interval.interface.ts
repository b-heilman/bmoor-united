type OrderT = number;

export type IntervalReference = string;

export interface IntervalInterface<
	ReferenceRef = IntervalReference,
	Order = OrderT,
> {
	ref: ReferenceRef;
	order: Order;
}
