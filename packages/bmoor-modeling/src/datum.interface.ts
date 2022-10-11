export type ModelKey = string | number;

export type ModelUpdate<ExternalReference, ExternalUpdate> = {
	ref: ExternalReference;
	delta: ExternalUpdate;
};
