import {get} from '@bmoor/object';

import {PrettyArraySettings} from './array.interface';
import {format} from './format';

export function prettyArray(
	// eslint-disable-next-line  @typescript-eslint/no-explicit-any
	arr: any[],
	settings: PrettyArraySettings,
): string {
	const header = [];

	if (settings.header) {
		header.push(
			format(
				settings.heading || settings.header,
				settings.headerFormat || {},
			),
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
							settings.headerFormat || {},
						),
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
