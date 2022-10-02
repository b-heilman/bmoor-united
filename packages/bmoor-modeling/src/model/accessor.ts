import {
	ModelAccessorInterface,
	ModelAccessorSettings,
	InternalKeyReader,
	DeltaKeyReader,
	ExternalKeyReader
} from './accessor.interface';

export class ModelAccessor<External, Delta, Internal>
	implements ModelAccessorInterface<External, Delta, Internal>
{
	settings: ModelAccessorSettings;
	getInternalKey: InternalKeyReader<Internal>;
	getExternalKey: ExternalKeyReader<External>;
	getDeltaKey: DeltaKeyReader<Delta>;

	constructor(settings: ModelAccessorSettings) {
		this.settings = settings;

		this.getInternalKey = function (/*datum: Internal*/) {
			return 'ok';
		};
		this.getExternalKey = function (/*datum: External*/) {
			return '';
		};
		this.getDeltaKey = function (/*datum: Delta*/) {
			return '';
		};
	}
}
