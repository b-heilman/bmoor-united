
export class Weights {
    data: Record<string, number>;

    constructor(){
        this.data = {};
    }

    set(mount: string, value: number){
        this.data[mount] = value;
    }

    get(mount: string, def: number = null): number {
        return mount in this.data ? this.data[mount] : def;
    }

    sum(mount: string, value: number) {
        if (mount in this.data){
            this.data[mount] += value;
        } else {
            this.data[mount] = value
        }
    }
    /*
    This won't work for a tier+1 aggregate...  If you have 6 children
    (e.g. 1 - 2 - 3 structure), count will be 2, not 6 
    count(mount: string, value: number) {
        if (value){
            if (mount in this.data){
                this.data[mount] += 1;
            } else {
                this.data[mount] = 1
            }
        }
    }
    */
    keys(){
        return Object.keys(this.data);
    }
}