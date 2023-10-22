function normalize(datums: {value: number}[] | number[]): number[] {
	if (datums.length) {
		if (typeof datums[0] == 'object') {
			return datums.map((datum) => datum.value);
		}
	}

	return <number[]>datums;
}

export function mean(datums: {value: number}[] | number[]) {
	const values = normalize(datums);

	return values.reduce((agg, value) => agg + value, 0) / values.length;
}

export function momentum(datums: {value: number}[] | number[]) {
	const values = normalize(datums);

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

export function change(datums: {value: number}[] | number[]) {
	const values = normalize(datums);
	const old = values[0];
	const cur = values[values.length - 1];

	return (old - cur) / values.length;
}
