function addEvent(node: Node, event: Event) {
	const intervalData = node.getIntervalData(event.interval);

	// and event should be added to the lowest child, it will be
	// bubbled up to all the parent nodes.  I want to make sure
	// I protect from event collisions.
	if (intervalData.event) {
		if (intervalData.event !== event) {
			console.log(
				'existing:',
				node.ref,
				JSON.stringify(intervalData.event),
			);
			throw new Error('interval collision: ' + JSON.stringify(event));
		}
	} else {
		intervalData.event = event;

		event.addNode(node);

		if (intervalData.parent) {
			// TODO: define the interface properly so I don't need to do this
			addEvent(<Node>intervalData.parent, event);
		}
	}

	return intervalData;
}

addEdge(event: Event, weights: WeightData): Node {
    const intervalData = addEvent(this, event);

    intervalData.edgeWeights = new Weights(weights);

    return this;
}

getEvent(interval: Interval): Event {
    return <Event>this.getIntervalData(interval).event;
}

hasEdge(interval: Interval): boolean {
    return (
        this.hasIntervalData(interval) &&
        'edgeWeights' in this.getIntervalData(interval)
    );
}

getEdge(interval: Interval): Weights {
    return this.getIntervalData(interval).edgeWeights;
}

getEvents(other?: Node, intervals?: Interval[]): Event[] {
    if (other) {
        const rtn = [];

        if (!intervals) {
            intervals = Array.from(this.intervals.keys());
        }

        for (const interval of intervals) {
            const intervalData = this.getIntervalData(interval);

            if (
                intervalData.event &&
                intervalData.event.nodes.get(other.type)?.includes(other)
            ) {
                rtn.push(intervalData.event);
            }
        }

        return rtn;
    } else {
        return <Event[]>Array.from(this.intervals.values())
            .map((nd) => nd.event)
            .filter((event) => !!event);
    }
}

getRelated(interval: Interval, tag?: NodeTag): Node[] {
    const rtn = [];
    const intervalData = this.getIntervalData(interval);

    if (intervalData.event) {
        const nodes = intervalData.event.nodes.get(this.type);

        for (const node of nodes) {
            if (node !== this && (!tag || node.tags.includes(tag))) {
                rtn.push(node);
            }
        }
    }

    return rtn;
}