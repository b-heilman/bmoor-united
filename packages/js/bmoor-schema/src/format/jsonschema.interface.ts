
export interface JSONSchemaObject {
    type: "object",
    properties: Record<string, JSONSchemaNode>
}

export interface JSONSchemaArray {
    type: "array",
    items: JSONSchemaNode
}

export interface JSONSchemaLeaf {
    type?: string,
}

export type JSONSchemaNode = JSONSchemaObject | JSONSchemaArray | JSONSchemaLeaf
/**
{
  "type": "object",
    "properties": {
      "name": {
        "type": "string"
      },
      "rank": {
        "type": "integer"
      },
      "born": {
        "type": "string",
        "format": "date-time"
      },
      "luckyNumbers": {
        "type": "array",
        "items": {
          "type": "integer"
        }
      }
    }
  }
  **/