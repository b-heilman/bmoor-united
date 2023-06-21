import {expect} from 'chai';

// import {Weights} from './weighted.interface';
import {Node} from './node';
import {Graph, load, dump} from './graph';
import {Weights} from './weights';

describe('@bmoor/graph', function () {
	describe('Graph building', function () {
		it('should properly build a flat graph', function () {
            const graph = new Graph();

            const node1 = new Node('node-1');
            const node2 = new Node('node-2');
            const node3 = new Node('node-3');
            const node4 = new Node('node-4');

            graph.addNode(node1);
            graph.addNode(node2);
            graph.addNode(node3);
            graph.addNode(node4);

            graph.biConnectNodes(
                new Weights({
                    general: 1
                }),
                'node-1',
                new Weights({
                    value: 1
                }),
                'node-2',
                new Weights({
                    value: 2
                }),
            );

            graph.biConnectNodes(
                new Weights({
                    general: 2
                }),
                'node-3',
                new Weights({
                    value: 3
                }),
                'node-4',
                new Weights({
                    value: 4
                }),
            );

            expect(graph.toJSON()).to.deep.equal({
                "nodes": [
                  {
                    "ref": "node-1",
                    "type": "__DEFAULT__",
                    "tags": [],
                    "parentRef": undefined,
                    "weights": {}
                  },
                  {
                    "ref": "node-2",
                    "type": "__DEFAULT__",
                    "tags": [],
                    "parentRef": undefined,
                    "weights": {}
                  },
                  {
                    "ref": "node-3",
                    "type": "__DEFAULT__",
                    "tags": [],
                    "parentRef": undefined,
                    "weights": {}
                  },
                  {
                    "ref": "node-4",
                    "type": "__DEFAULT__",
                    "tags": [],
                    "parentRef": undefined,
                    "weights": {}
                  }
                ],
                "edges": [
                  {
                    "ref": "node-1:node-2",
                    "weights": {
                      "general": 1
                    },
                    "connections": [
                      {
                        "nodeRef": "node-1",
                        "weights": {
                          "value": 1
                        }
                      },
                      {
                        "nodeRef": "node-2",
                        "weights": {
                          "value": 2
                        }
                      }
                    ]
                  },
                  {
                    "ref": "node-3:node-4",
                    "weights": {
                      "general": 2
                    },
                    "connections": [
                      {
                        "nodeRef": "node-3",
                        "weights": {
                          "value": 3
                        }
                      },
                      {
                        "nodeRef": "node-4",
                        "weights": {
                          "value": 4
                        }
                      }
                    ]
                  }
                ]
              }
            );
        });

        it('should properly build a tiered graph', function () {
            const graph = new Graph();

            const nodeA = new Node('node-a');
            const node1 = new Node('node-1');
            const node2 = new Node('node-2');
            const nodeB = new Node('node-b');
            const node3 = new Node('node-3');
            const node4 = new Node('node-4');

            node1.setParent(nodeA);
            node2.setParent(nodeA);
            node3.setParent(nodeB);
            node4.setParent(node3);

            graph.addNode(nodeA);
            graph.addNode(node1);
            graph.addNode(node2);
            graph.addNode(nodeB);
            graph.addNode(node3);
            graph.addNode(node4);

            expect(graph.toJSON()).to.deep.equal({
                "nodes": [
                    {
                        "ref": "node-a",
                        "type": "__DEFAULT__",
                        "tags": [],
                        "parentRef": undefined,
                        "weights": {}
                      },
                  {
                    "ref": "node-1",
                    "type": "__DEFAULT__",
                    "tags": [],
                    "parentRef": "node-a",
                    "weights": {}
                  },
                  {
                    "ref": "node-2",
                    "type": "__DEFAULT__",
                    "tags": [],
                    "parentRef": "node-a",
                    "weights": {}
                  },
                  {
                    "ref": "node-b",
                    "type": "__DEFAULT__",
                    "tags": [],
                    "parentRef": undefined,
                    "weights": {}
                  },
                  {
                    "ref": "node-3",
                    "type": "__DEFAULT__",
                    "tags": [],
                    "parentRef": "node-b",
                    "weights": {}
                  },
                  {
                    "ref": "node-4",
                    "type": "__DEFAULT__",
                    "tags": [],
                    "parentRef": "node-3",
                    "weights": {}
                  }
                ],
                "edges": []
              }
            );
        });
    });

    describe('Graph::select', function () {
        const graph = load({
            "nodes": [
                {
                "ref": "node-a",
                "type": "team",
                "tags": [],
                "parentRef": undefined,
                "weights": {}
                },
              {
                "ref": "node-1",
                "type": "position",
                "tags": ['wr'],
                "parentRef": "node-a",
                "weights": {}
              },
              {
                "ref": "node-2",
                "type": "position",
                "tags": ['qb'],
                "parentRef": "node-a",
                "weights": {}
              },
              {
                "ref": "node-b",
                "type": "team",
                "tags": [],
                "parentRef": undefined,
                "weights": {}
              },
              {
                "ref": "node-3",
                "type": "position",
                "tags": ['qb'],
                "parentRef": "node-b",
                "weights": {}
              },
              {
                "ref": "node-4",
                "type": "player",
                "tags": [],
                "parentRef": "node-3",
                "weights": {}
              }
            ],
            "edges": []
          });

		it('should allow selection', function () {
            const select1 = graph.select({
                reference: 'node-a',
                type: 'position'
            });

            const select2 = graph.select({
                type: 'position'
            });

            const select3 = graph.select({
                type: 'position',
                tag: 'qb'
            });

            expect(select1.map(node => node.ref)).to.deep.equal([
                'node-1',
                'node-2',
            ]);

            expect(select2.map(node => node.ref)).to.deep.equal([
                'node-1',
                'node-2',
                'node-3',
            ]);

            expect(select3.map(node => node.ref)).to.deep.equal([
                'node-2',
                'node-3',
            ]);
        });
    });

    describe('Graph::getEdgeWeights', function () {
        const graph = load({
            "nodes": [
                {
                "ref": "node-a",
                "type": "team",
                "tags": [],
                "parentRef": undefined,
                "weights": {}
                },
              {
                "ref": "node-1",
                "type": "position",
                "tags": ['wr'],
                "parentRef": "node-a",
                "weights": {}
              },
              {
                "ref": "node-2",
                "type": "position",
                "tags": ['qb'],
                "parentRef": "node-a",
                "weights": {}
              },
              {
                "ref": "node-b",
                "type": "team",
                "tags": [],
                "parentRef": undefined,
                "weights": {}
              },
              {
                "ref": "node-3",
                "type": "position",
                "tags": ['qb'],
                "parentRef": "node-b",
                "weights": {}
              },
              {
                "ref": "node-4",
                "type": "player",
                "tags": [],
                "parentRef": "node-3",
                "weights": {}
              }
            ],
            "edges": [
                {
                  "ref": "node-1:node-2",
                  "weights": {
                    "general": 1
                  },
                  "connections": [
                    {
                      "nodeRef": "node-1",
                      "weights": {
                        "value": 1
                      }
                    },
                    {
                      "nodeRef": "node-2",
                      "weights": {
                        "value": 2
                      }
                    }
                  ]
                },
                {
                  "ref": "node-3:node-4",
                  "weights": {
                    "general": 2
                  },
                  "connections": [
                    {
                      "nodeRef": "node-3",
                      "weights": {
                        "value": 3
                      }
                    },
                    {
                      "nodeRef": "node-4",
                      "weights": {
                        "value": 4
                      }
                    }
                  ]
                }
              ]
          });

		it('should allow selection', function () {
            const select1 = graph.getEdgeWeights('node-1');

            expect(select1.map(edge => ({
                edgeWeights: edge.edgeWeights.toJSON(),
                nodeWeights: edge.nodeWeights.toJSON()
            }))).to.deep.equal([
                {
                    edgeWeights: {
                        general: 1
                    },
                    nodeWeights: {
                        value: 1
                    }
                }
            ]);
        });
    });
});