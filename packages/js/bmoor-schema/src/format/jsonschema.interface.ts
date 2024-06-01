export interface JSONSchemaObject {
	type: 'object';
	properties: Record<string, JSONSchemaNode>;
}

export interface JSONSchemaArray {
	type: 'array';
	items: JSONSchemaNode;
}

export interface JSONSchemaLeaf {
	type?: string;
}

export type JSONSchemaNode =
	| JSONSchemaObject
	| JSONSchemaArray
	| JSONSchemaLeaf;
