import { FieldInterface } from "../field.interface";
import { TypingInterface } from "../typing.interface";
import { JSONSchemaNode, JSONSchemaObject } from "./jsonschema.interface";

export class FormatJSONSchema {
    root: JSONSchemaObject;
    typing: TypingInterface;

    constructor(typing: TypingInterface){
        this.root = {
            type: "object",
            properties: {}
        };
    }

    addField(field: FieldInterface){
        const chain = field.getPathChain();

        let cur: JSONSchemaNode  = this.root;

        for (const link of chain){
            if ('properties' in cur){
                if (link.type === 'object'){
                    if (!(link.reference in cur.properties)){
                        cur.properties[link.reference] = {
                            type: "object",
                            properties: {}
                        }
                    }

                    cur = cur.properties[link.reference]
                } else if (link.type === 'array'){
                    if (!(link.reference in cur.properties)){
                        cur.properties[link.reference] = {
                            type: "array",
                            items: {}
                        }
                    }

                    cur = cur.properties[link.reference]
                } else {
                    cur.properties[link.reference] = {
                        type: link.fieldType
                    }
                }
            } else if ('items' in cur){
                if (link.type === 'object'){
                    if (!cur.items.type){
                        Object.assign(cur.items, {
                            type: 'object',
                            properties: {}
                        });
                    }
                } else if (link.type === 'array'){
                    if (!cur.items.type){
                        Object.assign(cur.items, {
                            type: 'array',
                            items: {}
                        });
                    }
                } else {
                    // TODO: need to decode this
                    cur.items.type = link.fieldType;
                }

                cur = cur.items;
            }
        }
    }

    toJSON(){
        return this.root;
    }
}