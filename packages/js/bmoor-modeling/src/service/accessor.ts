import {ModelKey} from '../datum.interface';
import {
	ExternalKeyReader,
	InternalKeyReader,
	ServiceAccessorInterface,
	ServiceAccessorSettings,
} from './accessor.interface';

export class ServiceAccessor<
	ExternalRead,
	ExternalReference,
	InternalRead,
	InternalReference,
> implements
		ServiceAccessorInterface<
			ExternalRead,
			ExternalReference,
			InternalRead,
			InternalReference
		>
{
	settings: ServiceAccessorSettings;
	getInternalKey: InternalKeyReader<InternalRead, InternalReference>;
	getExternalKey: ExternalKeyReader<ExternalRead, ExternalReference>;

	constructor(settings: ServiceAccessorSettings) {
		this.settings = settings;

		this.getInternalKey = function (/*datum: Internal*/): ModelKey {
			return 'ok';
		};

		this.getExternalKey = function (/*datum: External*/): ModelKey {
			return '';
		};
	}
}
