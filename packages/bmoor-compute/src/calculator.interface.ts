export type CalculatorValue = number;

// eslint-disable-next-line  @typescript-eslint/no-explicit-any
export type CalculationSettings = Record<string, any>;

export type CalculatorReferenceTranslator = (string) => string; // allows for relative reference

export interface CalculatorArgumentInterface<Reference> {
	ref?: Reference | CalculatorReferenceTranslator;
	offset: number;
	count?: number;
	mount: string;
}

export interface CalculatorRegistryInterface<Reference> {
	mount: string;
	method: string;
	args: CalculatorArgumentInterface<Reference>[];
	settings: CalculationSettings;
}
