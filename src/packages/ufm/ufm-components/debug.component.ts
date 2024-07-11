import { UmbUfmComponentBase } from './ufm-component-base.js';

export class UmbUfmDebugComponent extends UmbUfmComponentBase {
	render() {
		return `<umb-debug visible dialog></umb-debug>`;
	}
}

export { UmbUfmDebugComponent as api };
