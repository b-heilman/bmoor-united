import {
	CalculationSettings,
	CalculatorArgumentInterface,
	CalculatorRegistryInterface,
	CalculatorValue,
	CalculatorReferenceTranslator
} from './calculator.interface';
import {ContextInterface} from './context.interface';

export class Calculator<Reference, Interval> {
	ctx: ContextInterface<Reference, Interval>;
	registry: Map<string, CalculatorRegistryInterface<Reference>>;

	constructor(
		ctx: ContextInterface<Reference, Interval>,
		registry: CalculatorRegistryInterface<Reference>[],
	) {
		this.ctx = ctx;
		this.registry = registry.reduce((agg, reg) => {
			agg.set(reg.mount, reg);

			return agg;
		}, new Map());
	}

	async compute(
		ref: Reference,
		interval: Interval,
		mount: string,
		settings: CalculationSettings = {},
	): Promise<CalculatorValue> {
		// Do we have this computed already, or do we need to
		if (this.ctx.env.hasValue(ref, interval, mount)) {
			return this.ctx.env.getValue(ref, interval, mount);
		} else {
			// compute arguments required for this one
			const registry = this.registry.get(mount);
			const args = await Promise.all(
				registry.args.flatMap(
					(arg: CalculatorArgumentInterface<Reference>) => {
						const found = this.ctx.src.getOffset(interval, arg.offset);
						
						settings.history = found.history;

						let nextRef = null;
						if (arg.ref){
							if (typeof(arg.ref) === 'function'){
								nextRef = (<CalculatorReferenceTranslator>arg.ref)(ref);
							} else {
								nextRef = arg.ref;
							}
						} else {
							nextRef = ref;
						}

						if (arg.count){
							const arr = found.history.slice(0, arg.count-1);
							arr.unshift(found.interval)

							return arr.map(interval => this.compute(
								nextRef,
								interval,
								arg.mount,
								settings,
							));
						} else {
							return this.compute(
								nextRef,
								found.interval,
								arg.mount,
								settings,
							);
						}
					},
				),
			);

			// using args, make call to method
			let rtn = null;

			const method = registry.method;
			if (this.ctx.env.canCompute(method)) {
				rtn = this.ctx.env.compute(method, args, settings);
			} else {
				rtn = this.ctx.src.compute(ref, interval, method, args, settings);
			}

			this.ctx.env.setValue(ref, interval, registry.mount, await rtn);

			return rtn;
		}
	}
}
