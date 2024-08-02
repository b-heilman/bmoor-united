
export interface HubLink<MetaT = Record<string, string>> {
    from: string;
	fromPath: string; // local
	to: string; // name
	toPath: string; // remote
	metadata: MetaT;
}