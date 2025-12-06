import type {FormatInterface} from './format.interface.ts';

export function format(
	value: number | string,
	settings: FormatInterface = {
		type: 'string',
		align: 'left',
	},
): string {
	const type = settings.type || typeof value;

	let rtn = '';

	if (type === 'number') {
		// If we want no precision
		if (settings.precision === 0) {
			value = parseInt(<string>value);
		}
	}

	const align = settings.align || 'left';
	const length = settings.length || 0;

	if (type === 'number') {
		if (settings.precision) {
			rtn = parseFloat(<string>value).toFixed(settings.precision);
		} else {
			rtn = '' + value;
		}

		// TODO: length management
	} else if (value) {
		rtn = '' + value;

		// string
		if (length) {
			if ((<string>value).length > length) {
				if (align === 'left') {
					rtn = (<string>value).substring(0, length);
				} else {
					rtn = (<string>value).slice(-length);
				}
			}
		}
	} else {
		rtn = '';
	}

	if (align === 'left') {
		while (rtn.length < length) {
			rtn += ' ';
		}
	} else {
		// align === 'right'
		while (rtn.length < length) {
			rtn = ' ' + rtn;
		}
	}

	return rtn;
}
