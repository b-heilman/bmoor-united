import {
	CalculationSettings,
	CalculatorValue,
} from './calculator.interface';
import {
	EnvironmentInterface,
	EnvironmentMethodsInterface,
} from './environment.interface';

export class Environment<Reference, Interval>
	implements EnvironmentInterface<Reference, Interval>
{
	cache: Map<Reference, Map<Interval, Record<string, CalculatorValue>>>;
	methods: EnvironmentMethodsInterface;

	constructor(
		methods: EnvironmentMethodsInterface, 
		prepop: Record<string, Record<string, Record<string, CalculatorValue>>> = null
	) {
		this.cache = new Map();
		this.methods = methods;

		if (prepop){
			for(const ref in prepop){
				const intervals = prepop[ref];
				const refMap = new Map();

				this.cache.set(<Reference>ref, refMap);

				for(const interval in intervals){
					refMap.set(interval, intervals[interval]);
				}
			}
		}
	}

	getValue(
		ref: Reference,
		interval: Interval,
		mount: string,
	): CalculatorValue {
		const arr = this.cache.get(ref)?.get(interval);

		if (arr && mount in arr) {
			return arr[mount];
		} else {
			return null;
		}
	}

	setValue(
		ref: Reference,
		interval: Interval,
		mount: string,
		value: CalculatorValue,
	): void {
		let refData = this.cache.get(ref);
		if (!refData) {
			refData = new Map();

			this.cache.set(ref, refData);
		}

		let intervalData = refData.get(interval);
		if (!intervalData) {
			intervalData = {};

			refData.set(interval, intervalData);
		}

		intervalData[mount] = value;
	}

	hasValue(ref: Reference, interval: Interval, mount: string): boolean {
		return this.getValue(ref, interval, mount) !== null;
	}

	canCompute(method: string): boolean {
		return method in this.methods;
	}

	async compute(
		method: string,
		args: CalculatorValue[],
		settings: CalculationSettings,
	): Promise<CalculatorValue> {
		return this.methods[method](args, settings);
	}
}
