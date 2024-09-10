import { css, customElement, html, property, state, unsafeCSS } from '@umbraco-cms/backoffice/external/lit';
import { Quill } from '@umbraco-cms/backoffice/external/quill';
import { UmbLitElement } from '@umbraco-cms/backoffice/lit-element';
import { UmbPropertyValueChangeEvent } from '@umbraco-cms/backoffice/property-editor';
import { UmbTextStyles } from '@umbraco-cms/backoffice/style';
import type { QuillOptions } from '@umbraco-cms/backoffice/external/quill';
import type { UmbBlockRteLayoutModel } from '@umbraco-cms/backoffice/block-rte';
import type { UmbBlockValueType } from '@umbraco-cms/backoffice/block';
import type { UmbPropertyEditorConfigCollection } from '@umbraco-cms/backoffice/property-editor';
import type { UmbPropertyEditorUiElement } from '@umbraco-cms/backoffice/extension-registry';

// TODO: [LK] For ease, copied from "src\packages\tiny-mce\property-editors\tiny-mce\property-editor-ui-tiny-mce.element.ts"
interface UmbRichTextEditorValueType {
	markup: string;
	blocks: UmbBlockValueType<UmbBlockRteLayoutModel>;
}

// https://github.com/slab/quill/issues/4250#issuecomment-2258342930
class UmbQuill extends Quill {
	constructor(container: HTMLElement, options: QuillOptions) {
		super(container, options);

		const getNativeSelection = (rootNode: ShadowRoot): Selection | null => {
			try {
				if ('getSelection' in rootNode && typeof rootNode.getSelection === 'function') {
					return rootNode.getSelection();
				} else {
					return window.getSelection();
				}
			} catch {
				return null;
			}
		};

		// Each browser engine has a different implementation for retrieving the Range
		const getNativeRange = (rootNode: ShadowRoot): Range | null => {
			const selection = getNativeSelection(rootNode);
			if (!selection?.anchorNode) return null;

			if (selection && 'getComposedRanges' in selection && typeof selection.getComposedRanges === 'function') {
				// Webkit range retrieval is done with getComposedRanges (see: https://bugs.webkit.org/show_bug.cgi?id=163921)
				return selection.getComposedRanges(rootNode)[0];
			}

			// Chromium based brwosers implement the range API properly in Native Shadow
			// Gecko implements the range API properly in Native Shadow: https://developer.mozilla.org/en-US/docs/Web/API/Selection/getRangeAt
			return selection.getRangeAt(0);
		};

		// Original implementation uses document.active element which does not work in Native Shadow.
		// Replace document.activeElement with shadowRoot.activeElement
		this.selection.hasFocus = () => {
			const rootNode = this.root.getRootNode() as ShadowRoot;
			return rootNode.activeElement === this.root;
		};

		// Original implementation uses document.getSelection which does not work in Native Shadow.
		// Replace document.getSelection with shadow dom equivalent (different for each browser)
		this.selection.getNativeRange = () => {
			const rootNode = this.root.getRootNode() as ShadowRoot;
			const nativeRange = getNativeRange(rootNode);
			// eslint-disable-next-line no-extra-boolean-cast
			return !!nativeRange ? this.selection.normalizeNative(nativeRange) : null;
		};

		// Original implementation relies on Selection.addRange to programatically set the range, which does not work
		// in Webkit with Native Shadow. Selection.addRange works fine in Chromium and Gecko.
		this.selection.setNativeRange = function (startNode, startOffset) {
			// eslint-disable-next-line prefer-rest-params
			let endNode = arguments.length > 2 && arguments[2] !== undefined ? (arguments[2] as Node) : startNode;
			// eslint-disable-next-line prefer-rest-params
			let endOffset = arguments.length > 3 && arguments[3] !== undefined ? (arguments[3] as number) : startOffset;
			// eslint-disable-next-line prefer-rest-params
			const force = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : false;

			if (
				startNode != null &&
				(this.root.parentNode == null || startNode.parentNode == null || (endNode && endNode.parentNode == null))
			) {
				return;
			}

			const selection = document.getSelection();

			if (selection == null) return;

			if (startNode != null && endNode != null) {
				if (!this.hasFocus()) this.root.focus();

				const native = (this.getNativeRange() || {}).native;

				if (
					native == null ||
					force ||
					startNode !== native.startContainer ||
					startOffset !== native.startOffset ||
					endNode !== native.endContainer ||
					endOffset !== native.endOffset
				) {
					if ('tagName' in startNode && startNode.tagName == 'BR') {
						startOffset = ([] as Node[]).indexOf.call(startNode?.parentNode?.childNodes, startNode);
						startNode = startNode.parentNode;
					}

					if ('tagName' in endNode && endNode.tagName == 'BR') {
						endOffset = ([] as Node[]).indexOf.call(endNode?.parentNode?.childNodes, endNode);
						endNode = endNode.parentNode;
					}

					if (startNode && endNode && typeof startOffset === 'number' && typeof endOffset === 'number') {
						selection.setBaseAndExtent(startNode, startOffset, endNode, endOffset);
					}
				}
			} else {
				selection.removeAllRanges();
				this.root.blur();
				container.focus();
			}
		};

		// Subscribe to selection change separately, because emitter in Quill doesn't catch this event in Shadow DOM
		const handleSelectionChange = () => {
			const { activeElement } = container.getRootNode() as ShadowRoot;
			const { tooltip } = this.theme as {
				tooltip?: { root: HTMLElement; textbox: HTMLInputElement; hide: () => void };
			};

			if (!tooltip) return;

			if (
				tooltip.root !== activeElement &&
				tooltip.textbox !== activeElement &&
				!tooltip.root.contains(activeElement) &&
				!this.hasFocus()
			) {
				tooltip.hide();
				document.removeEventListener('selectionchange', handleSelectionChange);
				return;
			}

			this.selection.update();
		};

		// The 'selectionchange' event is not emitted in Shadow DOM, therefore listen for the
		// 'selectstart' event first and then subscribe to the 'selectionchange' event on the document
		container.addEventListener('selectstart', () =>
			document.addEventListener('selectionchange', handleSelectionChange),
		);
	}
}

const elementName = 'umb-property-editor-ui-rte-quill';

@customElement(elementName)
export class UmbPropertyEditorUiRteQuillElementElement extends UmbLitElement implements UmbPropertyEditorUiElement {
	@state()
	private _styles?: string;

	@property({ type: Object })
	value?: UmbRichTextEditorValueType;

	public set config(config: UmbPropertyEditorConfigCollection | undefined) {
		if (!config) return;
		//console.log('config', config);
	}

	constructor() {
		super();
	}

	override async firstUpdated() {
		const { snow } = await import('@umbraco-cms/backoffice/external/quill');
		this._styles = snow;

		const container = this.shadowRoot?.querySelector('#editor') as HTMLElement;

		const options: QuillOptions = {
			modules: {
				toolbar: true,
			},
			placeholder: 'Write your text here...',
			theme: 'snow',
		};

		const quill = new UmbQuill(container, options);
		//console.log('quill', quill);

		const contents = quill.clipboard.convert({ html: this.value?.markup });
		quill.setContents(contents);

		quill.on('text-change', () => {
			//const html = quill.getSemanticHTML();
			const html = quill.root.innerHTML;
			this.value = {
				markup: html,
				blocks: { contentData: [], settingsData: [], layout: { 'Umbraco.RichText': undefined } },
			};
			//console.log('text-change', this.value);
			this.dispatchEvent(new UmbPropertyValueChangeEvent());
		});
	}

	override render() {
		//console.log('render', this.value);
		return html`
			<style>
				${unsafeCSS(this._styles)}
			</style>
			<div id="editor" class="uui-text"></div>
		`;
	}

	static override styles = [
		UmbTextStyles,
		css`
			#editor {
				/* h1, h2, h3, h4, h5, h6 { font-weight: bold; } */
			}
		`,
	];
}

export { UmbPropertyEditorUiRteQuillElementElement as element };

declare global {
	interface HTMLElementTagNameMap {
		[elementName]: UmbPropertyEditorUiRteQuillElementElement;
	}
}
