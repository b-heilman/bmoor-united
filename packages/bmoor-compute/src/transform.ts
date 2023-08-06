export function mean(values: number[]) {
	return values.reduce((agg, val) => agg + val, 0) / values.length;
}

export function momentum(values: number[]) {
	let old = values[0];
	let score = 0;

	for (let i = 1; i < values.length; i++) {
		const cur = values[i];

		if (cur > old) {
			score++;
		} else {
			score--;
		}

		old = cur;
	}

	return score;
}

export function change(values: number[]) {
	const old = values[0];
	const cur = values[values.length - 1];

	return (old - cur) / values.length;
}
