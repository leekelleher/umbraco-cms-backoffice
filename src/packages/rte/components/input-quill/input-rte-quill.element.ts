import { UmbQuill } from './umb-quill.class.js';
import { css, customElement, html, property, state, unsafeCSS } from '@umbraco-cms/backoffice/external/lit';
import { UmbChangeEvent } from '@umbraco-cms/backoffice/event';
import { UmbLitElement } from '@umbraco-cms/backoffice/lit-element';
import { UmbTextStyles } from '@umbraco-cms/backoffice/style';
import { UMB_EMBEDDED_MEDIA_MODAL, UMB_MODAL_MANAGER_CONTEXT } from '@umbraco-cms/backoffice/modal';
import { UMB_MEDIA_PICKER_MODAL } from '@umbraco-cms/backoffice/media';
import type { QuillOptions } from '@umbraco-cms/backoffice/external/quill';

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
