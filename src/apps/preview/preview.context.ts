import { UMB_APP_CONTEXT } from '../app/app.context.js';
import { tryExecute } from '@umbraco-cms/backoffice/resources';
import { PreviewService } from '@umbraco-cms/backoffice/external/backend-api';
import { UmbBooleanState, UmbStringState } from '@umbraco-cms/backoffice/observable-api';
import { UmbContextBase } from '@umbraco-cms/backoffice/class-api';
import { UmbContextToken } from '@umbraco-cms/backoffice/context-api';
import type { UmbControllerHost } from '@umbraco-cms/backoffice/controller-api';

export class UmbPreviewContext extends UmbContextBase<UmbPreviewContext> {
	#serverUrl: string = '';

	#iframeReady = new UmbBooleanState(false);
	public readonly iframeReady = this.#iframeReady.asObservable();

	#previewUrl = new UmbStringState(undefined);
	public readonly previewUrl = this.#previewUrl.asObservable();

	private _culture?: string | null;
	private _unique?: string | null;

	constructor(host: UmbControllerHost) {
		super(host, UMB_PREVIEW_CONTEXT);
		this.#init();
	}

	async #init() {
		const appContext = await this.getContext(UMB_APP_CONTEXT);
		this.#serverUrl = appContext.getServerUrl();

		const searchParams = new URLSearchParams(window.location.search);

		this._culture = searchParams.get('culture');
		this._unique = searchParams.get('id');

		if (!this._unique) {
			console.error('No unique ID found in query string.');
			return;
		}

		// HACK: [LK] Temporarily hard-coded the numeric ID in the path for now.
		this.#previewUrl.setValue(`${this.#serverUrl}/1233${this._culture ? `?culture=${this._culture}` : ''}`);
		//this.#previewUrl.setValue(`${this.#serverUrl}/${this._unique}${this._culture ? `?culture=${this._culture}` : ''}`);
	}

	// TODO: [LK] Copied from the old code; review this.
	#setCookie(cname: string, cvalue: string, exminutes: number) {
		const date = new Date();
		date.setTime(date.getTime() + exminutes * 60 * 1000);
		document.cookie = `${cname}=${cvalue};expires=${date.toUTCString()};path=/`;
	}

	// TODO: [LK] I need to review how `UmbPreviewSessionAmount` should work.
	startPreview() {
		let amountOfPreviewSessions = Number(localStorage.getItem('UmbPreviewSessionAmount')) || 0;
		amountOfPreviewSessions++;
		localStorage.setItem('UmbPreviewSessionAmount', amountOfPreviewSessions.toString());
	}

	async exitPreview() {
		let amountOfPreviewSessions = Number(localStorage.getItem('UmbPreviewSessionAmount')) | 0;
		amountOfPreviewSessions--;
		localStorage.setItem('UmbPreviewSessionAmount', amountOfPreviewSessions.toString());

		// We are good to end preview mode.
		if (amountOfPreviewSessions <= 0) {
			await tryExecute(PreviewService.deletePreview());
		}

		// HACK: [LK] Hardcode for now.
		// TODO: [LK] Review what should happen here. Do we need to still call the `preview/end?redir` URL?
		//window.top.location.href = "../preview/end?redir=" + encodeURIComponent(getPageURL());
		window.location.href = `section/content/workspace/document/edit/${this._unique}`;
	}

	getIFrameWrapper(): HTMLElement | undefined {
		return this.getHostElement().shadowRoot?.querySelector('#wrapper') as HTMLElement;
	}

	iframeLoaded(iframe: HTMLIFrameElement) {
		// TODO: [LK] We may need to implement `hideUmbracoPreviewBadge()`.
		this.#fixExternalLinks(iframe);
		this.#iframeReady.setValue(true);
	}

	// NOTE: `iframe.contentDocument` only works on SameOrigin. [LK]
	#fixExternalLinks(iframe: HTMLIFrameElement) {
		const links = iframe.contentDocument?.getElementsByTagName('a');
		if (!links) return;
		Array.from(links)
			.filter((a) => a.hostname !== location.hostname && !a.target)
			.forEach((a) => (a.target = '_top'));
	}

	openWebsite() {
		this.#setCookie('UMB-WEBSITE-PREVIEW-ACCEPT', 'true', 5);
		const url = this.#previewUrl.getValue() as string;
		window.open(url, '_blank');
	}

	async updateIFrame(args?: { culture?: string; className?: string; height?: string; width?: string }) {
		if (!args) return;

		const wrapper = this.getIFrameWrapper();
		if (!wrapper) return;

		if (args.culture) {
			this.#iframeReady.setValue(false);

			const searchParams = new URLSearchParams(window.location.search);
			searchParams.set('culture', args.culture);
			const newRelativePathQuery = window.location.pathname + '?' + searchParams.toString();
			history.pushState(null, '', newRelativePathQuery);

			// HACK: [LK] Temporarily hard-coded the numeric ID in the path for now.
			this.#previewUrl.setValue(`${this.#serverUrl}/1233?culture=${args.culture}`);
		}

		if (args.className) wrapper.className = args.className;
		if (args.height) wrapper.style.height = args.height;
		if (args.width) wrapper.style.width = args.width;
	}
}

export const UMB_PREVIEW_CONTEXT = new UmbContextToken<UmbPreviewContext>('UmbPreviewContext');
