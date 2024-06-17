import { UmbContextToken } from '@umbraco-cms/backoffice/context-api';
import type { UmbControllerHost } from '@umbraco-cms/backoffice/controller-api';
import { UmbArrayState } from '@umbraco-cms/backoffice/observable-api';
import { UmbStoreBase } from '@umbraco-cms/backoffice/store';

export type UmbModelType = 'dialog' | 'sidebar';

export type UmbCurrentUserHistoryItem = {
	//unique: string;
	path: string;
	label: string | Array<string>;
	icon?: string;
};

export class UmbCurrentUserHistoryStore extends UmbStoreBase<UmbCurrentUserHistoryItem> {
	public readonly history = this._data.asObservable();
	public readonly latestHistory = this._data.asObservablePart((historyItems) => historyItems.slice(-10));

	constructor(host: UmbControllerHost) {
		super(
			host,
			UMB_CURRENT_USER_HISTORY_STORE_CONTEXT.toString(),
			new UmbArrayState<UmbCurrentUserHistoryItem>([], (x) => x.path),
		);

		// if (!('navigation' in window)) return;
		// (window as any).navigation.addEventListener('navigate', (event: any) => {
		// 	console.log('navigate', event);
		// 	const url = new URL(event.destination.url);
		// 	const historyItem = {
		// 		unique: new UmbId().toString(),
		// 		path: url.pathname,
		// 		label: event.destination.url.split('/').pop(),
		// 	};
		// 	this.push(historyItem);
		// });

		const hostElement = host.getHostElement();
		hostElement.addEventListener('umb:current-user-history', (event: Event) => {
			const historyItem = (event as CustomEvent).detail as UmbCurrentUserHistoryItem;
			console.log('received:current-user-history', historyItem);
			this.push(historyItem);
		});
	}

	/**
	 * Pushes a new history item to the history array
	 * @public
	 * @param {UmbCurrentUserHistoryItem} historyItem
	 * @memberof UmbCurrentUserHistoryStore
	 */
	public push(historyItem: UmbCurrentUserHistoryItem): void {
		// This prevents duplicate entries in the history array.
		const history = this._data.getValue().filter((x) => x.path !== historyItem.path);
		this._data.setValue([...history, historyItem]);

		document.title = `Edit: ${historyItem.label} \u00ab Content \u00ab Umbraco`;
	}

	/**
	 * Clears the history array
	 * @public
	 * @memberof UmbCurrentUserHistoryStore
	 */
	public clear() {
		this._data.setValue([]);
	}
}

export const UMB_CURRENT_USER_HISTORY_STORE_CONTEXT = new UmbContextToken<UmbCurrentUserHistoryStore>(
	'UmbCurrentUserHistoryStore',
);

// Default export for the globalContext manifest:
export default UmbCurrentUserHistoryStore;
