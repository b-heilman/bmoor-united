export function sum(datums: {sum: {value: number} | number}[]) {
	const values = datums.map((v) =>
		typeof v.sum === 'number' ? v.sum : v.sum.value,
	);

	console.log('sum', values);
	return values.reduce((agg, value) => agg + value, 0);
}

export function mean(datums: {mean: {value: number} | number}[]) {
	const values = datums.map((v) =>
		typeof v.mean === 'number' ? v.mean : v.mean.value,
	);

	console.log('mean', values);
	return values.reduce((agg, value) => agg + value, 0) / values.length;
}

/*
export function reduce(
	fn: (agg: number, cur: number, prev: number) => number,
) {
	return function summarizer(datums: {
		reduce: {value: number}[] | number[];
	}) {
		const values = normalize(datums.reduce);

		let old = null;
		let score = 0;

		for (let i = 0; i < values.length; i++) {
			const cur = values[i];

			score = fn(score, cur, old);

			old = cur;
		}

		return score;
	};
}

export const momentum = reduce((agg, cur, old) =>
	old === null ? 0 : cur > old ? agg++ : agg--,
);

export function change(datums: {value: number}[] | number[]) {
	const values = normalize(datums);
	const old = values[0];
	const cur = values[values.length - 1];

	return (old - cur) / values.length;
}
*/
