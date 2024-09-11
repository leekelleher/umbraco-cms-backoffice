import { css, customElement, html, property, state, unsafeCSS } from '@umbraco-cms/backoffice/external/lit';
import { Quill } from '@umbraco-cms/backoffice/external/quill';
import { UmbChangeEvent } from '@umbraco-cms/backoffice/event';
import { UmbLitElement } from '@umbraco-cms/backoffice/lit-element';
import { UmbTextStyles } from '@umbraco-cms/backoffice/style';
import { UMB_EMBEDDED_MEDIA_MODAL, UMB_MODAL_MANAGER_CONTEXT } from '@umbraco-cms/backoffice/modal';
import { UMB_MEDIA_PICKER_MODAL } from '@umbraco-cms/backoffice/media';
import type { QuillOptions } from '@umbraco-cms/backoffice/external/quill';

// TODO: [LK] Move this to a separate class file.
// TODO: [LK] Give credit to https://github.com/slab/quill/issues/4250#issuecomment-2258342930
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

const elementName = 'umb-input-rte-quill';

@customElement(elementName)
export class UmbInputRteQuillElement extends UmbLitElement {
	@state()
	private _styles?: string;

	@property({ type: Boolean, reflect: true })
	public set readonly(value) {
		this.#readonly = value;
		if (this.#editor) {
			this.#editor.enable(!value);
		}
	}
	public get readonly() {
		return this.#readonly;
	}
	#readonly = false;

	@property()
	theme: string = 'snow';

	@property()
	value?: string;

	#editor?: UmbQuill;

	constructor() {
		super();

		// TODO: [LK] Need to figure out a cleaner way to register icons.
		const icons = Quill.import('ui/icons') as Record<string, string>;
		icons['umb-media'] = '<umb-icon name="icon-picture" color="color-red"></umb-icon>';
		icons['umb-embed'] = '<umb-icon name="icon-tv" color="color-blue"></umb-icon>';
		Quill.register('ui/icons', icons, true);
	}

	override async firstUpdated() {
		switch (this.theme) {
			case 'bubble': {
				const { bubble } = await import('@umbraco-cms/backoffice/external/quill');
				this._styles = bubble;
				break;
			}
			case 'default':
			case 'snow':
			default: {
				const { snow } = await import('@umbraco-cms/backoffice/external/quill');
				this._styles = snow;
				break;
			}
		}

		const container = this.shadowRoot?.querySelector('#editor') as HTMLElement;

		// TODO: [LK] Populate the toolbar buttons from the data-type configuration.
		const toolbarOptions = {
			container: [
				[
					{ header: [] },
					'bold',
					'italic',
					'underline',
					'strike',
					'blockquote',
					'code-block',
					'link',
					'image',
					'video',
					'formula',
					{ list: 'ordered' },
					{ list: 'bullet' },
					{ list: 'check' },
					{ script: 'sub' },
					{ script: 'super' },
					{ indent: '-1' },
					{ indent: '+1' },
					{ direction: 'rtl' },
					{ size: [] },
					{ color: [] },
					{ background: [] },
					{ font: [] },
					{ align: [] },
					'clean',
				],
				['umb-media', 'umb-embed'],
			],
			// TODO: [LK] Move the handlers to their own extension type plugins.
			handlers: {
				'umb-media': async () => {
					const selection = this.#editor?.getSelection();
					if (selection) {
						const modalManager = await this.getContext(UMB_MODAL_MANAGER_CONTEXT);
						const modalHandler = modalManager.open(this, UMB_MEDIA_PICKER_MODAL, {});
						if (!modalHandler) return;
						const result = await modalHandler.onSubmit();
						if (!result) return;
						console.log('umb-media', result);

						this.#editor?.insertText(selection.index, result.selection.join(', '), 'user');
					}
				},
				'umb-embed': async () => {
					const selection = this.#editor?.getSelection();
					if (selection) {
						const modalManager = await this.getContext(UMB_MODAL_MANAGER_CONTEXT);
						const modalHandler = modalManager.open(this, UMB_EMBEDDED_MEDIA_MODAL, {
							data: { url: 'https://www.youtube.com/watch?v=J---aiyznGQ' },
						});
						if (!modalHandler) return;
						const result = await modalHandler.onSubmit();
						if (!result) return;
						console.log('umb-embed', result);

						this.#editor?.insertText(selection.index, result.url, 'user');
					}
				},
			},
		};

		const options: QuillOptions = {
			modules: {
				toolbar: toolbarOptions,
			},
			readOnly: this.readonly,
			theme: this.theme,
		};

		this.#editor = new UmbQuill(container, options);
		//console.log('quill', this.#editor);

		const contents = this.#editor.clipboard.convert({ html: this.value });
		this.#editor.setContents(contents);

		this.#editor.on('text-change', () => {
			this.value = this.#editor?.root.innerHTML ?? this.#editor?.getSemanticHTML() ?? '';
			this.dispatchEvent(new UmbChangeEvent());
		});
	}

	override render() {
		return html`
			<style>
				${unsafeCSS(this._styles)}
			</style>
			<div id="editor" class="uui-text"></div>
		`;
	}

	static override readonly styles = [
		UmbTextStyles,
		css`
			#editor {
				/* h1, h2, h3, h4, h5, h6 { font-weight: bold; } */
				blockquote {
					float: none;
				}

				blockquote:before,
				blockquote:after {
					line-height: 1rem;
				}
			}
		`,
	];
}

export { UmbInputRteQuillElement as element };

declare global {
	interface HTMLElementTagNameMap {
		[elementName]: UmbInputRteQuillElement;
	}
}
