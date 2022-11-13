
class Node {
    ref: string;
}

class Edge {
    from: Node;
    to: Node;

    directed: boolean;
    weights?: Record<string, number>;
    metadata?: Record<string, string>;
}