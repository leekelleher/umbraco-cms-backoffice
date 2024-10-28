import { UmbContextBase } from '@umbraco-cms/backoffice/class-api';
import { UmbContextToken } from '@umbraco-cms/backoffice/context-api';
import type { UmbControllerHost } from '@umbraco-cms/backoffice/controller-api';

export class UmbBroadcastContext extends UmbContextBase<UmbBroadcastContext> {
	#broadcaster = new BroadcastChannel('umb');
	#receiver = new BroadcastChannel('umb');

	constructor(host: UmbControllerHost) {
		super(host, UMB_BROADCAST_CONTEXT);
	}

	public post(message: any) {
		this.#broadcaster.postMessage(message);
	}

	public receive(listener: (this: BroadcastChannel, ev: BroadcastChannelEventMap['message']) => void) {
		this.#receiver.addEventListener('message', listener);
	}
}

export const UMB_BROADCAST_CONTEXT = new UmbContextToken<UmbBroadcastContext>('UmbBroadcastContext');

export { UmbBroadcastContext as api };

export default UmbBroadcastContext;
