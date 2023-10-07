export function mean(datums: {value: number}[]) {
	return (
		datums.reduce((agg, datum) => agg + datum.value, 0) / datums.length
	);
}

export function momentum(datums: {value: number}[]) {
	let old = datums[0].value;
	let score = 0;

	for (let i = 1; i < datums.length; i++) {
		const cur = datums[i].value;

		if (cur > old) {
			score++;
		} else {
			score--;
		}

		old = cur;
	}

	return score;
}

export function change(datums: {value: number}[]) {
	const old = datums[0].value;
	const cur = datums[datums.length - 1].value;

	return (old - cur) / datums.length;
}
