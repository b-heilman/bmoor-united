export type ModelKey = string | number;

export type UpdateDelta<ExternalReference, ExternalUpdate> = {
	ref: ExternalReference;
	delta: ExternalUpdate;
};
