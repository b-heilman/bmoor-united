type IntervalT = string;
type OrderT = number;

export interface IntervalInterface<
	ReferenceRef = IntervalT,
	Order = OrderT,
> {
	ref: ReferenceRef;
	order: Order;
}
