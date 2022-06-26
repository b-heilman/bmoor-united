export class TokenizerState {
	begin: number;
	end: number;

	constructor(begin) {
		this.begin = begin;
	}

	setEnd(end) {
		this.end = end;
	}
}
