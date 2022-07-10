export class TokenizerState {
	begin: number; // where the scanner should continue for the token
	open: number;  // where the value actually begins
	close: number; // where the value actually ends
	end: number;   // where the scanner should continue for the next token

	constructor(begin) {
		this.begin = begin;
	}

	setOpen(open){
		this.open;
	}

	setClose(close) {
		this.close = close;

		if (this.open === undefined){
			this.open = this.begin;
		}
	}

	setEnd(end) {
		this.end = end;

		if (this.close === undefined){
			this.setClose(end);
		}
	}
}
