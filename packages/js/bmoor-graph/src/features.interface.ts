export type FeatureReference = string;
export type FeatureValue = number | Promise<number> | boolean;
export type FeatureValues = Record<FeatureReference, FeatureValue>;
