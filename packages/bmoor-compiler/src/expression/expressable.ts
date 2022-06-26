
type RandomFunction = 
// TODO: Expressable should be interface
export class Expressable<T> {
	type: string;
	rank: number;
	method: (...args: any) => T;

	constructor(type, method: (...args: any) => T, rank=null){
		this.type = type;
		this.rank =  rank;
		this.method = method;
	}

	abstract eval(...args: any[]): T

	prepare(): (...args: any) => T {
		return (...args: any[]) => {
			return this.eval(...args);
		};
	}

	toJSON() {
		return {type: this.type, method: this.method.name};
	}

	toString() {
		return `{"type":"${this.type}", "method":"${this.method.name}"}`;
	}
}