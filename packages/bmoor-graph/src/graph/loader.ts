import { Graph } from "../graph";

interface LoaderSettings {

}

class Loader {
    graph: Graph;
    settings: LoaderSettings;

    constructor(graph: Graph, settings: LoaderSettings){
        this.graph = graph;
        this.settings = settings;
    }
}