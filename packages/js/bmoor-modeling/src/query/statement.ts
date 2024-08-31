import { 
    RequestField, 
    RequestJoin, 
    RequestJoinMapping, 
    RequestSelect, 
    RequestSeries, 
    RequestWhereExpression
} from "../request.interface";

export class Statement {
    refs: Record<string, RequestSeries>;
    select: RequestSelect;
    where: RequestWhereExpression;

    constructor(base){
        this.refs = {};
        this.select = {
            models: []
        };

        this.where = {
            conditions: []
        };
    }

    addModel(name, series = null, fields: RequestField[], joins: RequestJoin[] = []){
        if (series === null){
            series = name;
        }

        if (this.refs[series]){
            throw new Error('Duplicate series added');
        }

        const model: RequestSeries = {
            name,
            series,
            fields,
            joins
        };

        this.refs[series] = model;

        this.select.models.push(model);

        return this;
    }

    addField(series, path, as?){
        this.refs[series].fields.push({
            as,
            path
        });

        return this;
    }

    addJoin(fromSeries, toSeries, mappings: RequestJoinMapping[], optional: boolean = false){
        this.refs[fromSeries].joins.push({
            optional,
            toSeries,
            mappings
        });

        return this;
    }

    setWhere(){
        
    }

    addCondition(){

    }
}