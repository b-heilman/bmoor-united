import {Action} from '../action';
import {ActionReference} from '../action.interface';
import {DatumInterface} from '../datum.interface';
import {ActionRequireFn, ActionRequireThenFn} from './require.interface';

export class ActionRequire<Interval, Selector> extends Action<
	Interval,
	Selector
> {
	fn: ActionRequireThenFn;
	args: ActionRequireFn<Interval>[];
	requirements: Action<Interval, Selector>[];

	constructor(ref: ActionReference) {
		super(ref);

		this.args = [];
		this.requirements = [];
	}

	require(
		offset: number,
		sub: Action<Interval, Selector>,
	): ActionRequire<Interval, Selector> {
		this.requirements.push(sub);
		this.args.push(async (datum: DatumInterface<Interval>) => {
			const myInterval = this.env.offsetInterval(datum.interval, offset);

			return sub.execute(this.env.intervalSelect(datum, myInterval));
		});

		return this;
	}

	then(fn: ActionRequireThenFn): void {
		this.fn = fn;
	}

	getRequirements(): Action<Interval, Selector>[] {
		return this.requirements;
	}

	async eval(datum: DatumInterface<Interval>): Promise<number> {
		const args = await Promise.all(this.args.map((fn) => fn(datum)));

		return this.fn(...args);
	}
}
