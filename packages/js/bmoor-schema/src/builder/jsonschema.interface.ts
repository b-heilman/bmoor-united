export interface BuilderJSONSchemaObject {
	type: 'object';
	properties: Record<string, BuilderJSONSchemaNode>;
}

export interface BuilderJSONSchemaArray {
	type: 'array';
	items: BuilderJSONSchemaNode;
}

export interface BuilderJSONSchemaLeaf {
	type?: string;
}

export type BuilderJSONSchemaNode =
	| BuilderJSONSchemaObject
	| BuilderJSONSchemaArray
	| BuilderJSONSchemaLeaf;
