import {
	EventFeaturesWriteMode,
	EventInterface,
	EventJSON,
	EventNodeInformation,
	EventReference,
} from './event.interface';
import {Features} from './features';
import {NodeInterface, NodeReference} from './node.interface';

export class Event implements EventInterface {
	ref: EventReference;
	features: Features;
	nodeInfo: Map<NodeReference, EventNodeInformation>;

	constructor(ref: EventReference, features: Features) {
		this.ref = ref;
		this.features = features;
		this.nodeInfo = new Map();
	}

	setNodeFeatures(
		node: NodeInterface,
		features: Features,
		mode: EventFeaturesWriteMode = EventFeaturesWriteMode.ignore,
	): void {
		let cur = this.nodeInfo.get(node.ref);

		if (!cur) {
			cur = {
				node,
				features,
			};

			this.nodeInfo.set(node.ref, cur);
		} else {
			const baseFeatures = cur.features;

			switch (mode) {
				case EventFeaturesWriteMode.overwrite:
					cur.features = features;
					break;
				case EventFeaturesWriteMode.merge:
					baseFeatures.merge(features);
					break;
				case EventFeaturesWriteMode.verify:
					if (!baseFeatures.equals(features)) {
						throw new Error('change pushed that is not same data');
					}
					break;
				case EventFeaturesWriteMode.fail:
					throw new Error('can not overwrite event features');
				default:
					// First write wins
					break;
			}
		}
	}

	getNodeFeatures(node: NodeInterface | NodeReference): Features {
		return this.nodeInfo.get(typeof node === 'string' ? node : node.ref)
			.features;
	}

	hasNodeFeature(
		node: NodeInterface | NodeReference,
		feature: string,
	): boolean {
		return this.nodeInfo
			.get(typeof node === 'string' ? node : node.ref)
			?.features.has(feature);
	}

	toJSON(): EventJSON {
		const conns = [];

		for (const [key, info] of this.nodeInfo.entries()) {
			if (info.features.hasData()) {
				conns.push({
					nodeRef: key,
					features: info.features.toJSON(),
				});
			}
		}

		const rtn: EventJSON = {
			ref: this.ref,
			connections: conns,
		};

		if (this.features.hasData()) {
			rtn.features = this.features.toJSON();
		}

		return rtn;
	}
}
