// https://www.statisticshowto.com/probability-and-statistics/correlation-coefficient-formula/
export function pearsonCorrelation(
	arr1: number[],
	arr2: number[]
): number {
	const length = arr1.length;
	const arr1_avg = arr1.reduce((agg, v) => agg + v, 0) / length;
	const arr2_avg = arr2.reduce((agg, v) => agg + v, 0) / length;

	let sum_values_average = 0;
	let sum1 = 0;
	let sum2 = 0;

	for (let index = 0; index < length; index++) {
		const value1 = arr1[index];
		const value2 = arr2[index];

		const v1 = value1 - arr1_avg;
		const v2 = value2 - arr2_avg;

		sum_values_average += v1 * v2;

		sum1 += Math.pow(v1, 2);
		sum2 += Math.pow(v2, 2);
	}

	const n = length - 1;

	const sum1_avg = sum1 / n;
	const sum2_avg = sum2 / n;

	const sum1_sqrt = Math.sqrt(sum1_avg);
	const sum2_sqrt = Math.sqrt(sum2_avg);

	return sum_values_average / (n * sum1_sqrt * sum2_sqrt);
}
