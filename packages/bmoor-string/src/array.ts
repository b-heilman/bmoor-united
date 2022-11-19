import {get} from '@bmoor/object';

import {format} from './format';
import {PrettyInteface} from './array.interface';

// eslint-disable-next-line  @typescript-eslint/no-explicit-any
export function pretty(arr: any[], settings: PrettyInteface): string {
	const header = [];

	if (settings.header) {
		header.push(
			format(
				settings.heading || settings.header,
				settings.headerFormat || {}
			)
		);
	}

	for (const [key, column] of Object.entries(settings.columns)) {
		header.push(format(column.heading || key, column));
	}

	return (
		'h:\t' +
		header.join(settings.separator) +
		'\n' +
		arr
			.map((value, index) => {
				const row = [];

				if (settings.header) {
					row.push(
						format(
							get(value, settings.header),
							settings.headerFormat || {}
						)
					);
				}

				for (const [key, column] of Object.entries(settings.columns)) {
					row.push(format(get(value, key), column));
				}

				return `${index}:\t${row.join(settings.separator)}`;
			})
			.join('\n')
	);
}
