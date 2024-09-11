import type { UmbInputRteQuillElement } from '../../components/input-quill/input-rte-quill.element.js';
import type { UmbRichTextEditorValueType } from '../../../tiny-mce/property-editors/tiny-mce/property-editor-ui-tiny-mce.element.js';
import { customElement, html, property, state } from '@umbraco-cms/backoffice/external/lit';
import { UmbLitElement } from '@umbraco-cms/backoffice/lit-element';
import { UmbPropertyValueChangeEvent } from '@umbraco-cms/backoffice/property-editor';
import type { UmbPropertyEditorConfigCollection } from '@umbraco-cms/backoffice/property-editor';
import type { UmbPropertyEditorUiElement } from '@umbraco-cms/backoffice/extension-registry';

import '../../components/input-quill/input-rte-quill.element.js';

const elementName = 'umb-property-editor-ui-rte-quill';

@customElement(elementName)
export class UmbPropertyEditorUiRteQuillElementElement extends UmbLitElement implements UmbPropertyEditorUiElement {
	@state()
	private _theme: string = 'snow';

	@property({ type: Boolean, reflect: true })
	readonly = false;

	@property({ type: Object })
	value?: UmbRichTextEditorValueType;

	public set config(config: UmbPropertyEditorConfigCollection | undefined) {
		if (!config) return;
		//console.log('config', config);

		this._theme = config.getValueByAlias('theme') ?? 'snow';
	}

	#onChange(event: CustomEvent & { target: UmbInputRteQuillElement }) {
		//console.log('#onChange', event.target.value);
		this.value = {
			markup: event.target.value ?? '',
			blocks: { contentData: [], settingsData: [], layout: { 'Umbraco.RichText': undefined } },
		};

		this.dispatchEvent(new UmbPropertyValueChangeEvent());
	}

	override render() {
		//console.log('render', this.value);
		return html`<umb-input-rte-quill
			theme=${this._theme}
			.value=${this.value?.markup}
			?readonly=${this.readonly}
			@change=${this.#onChange}></umb-input-rte-quill>`;
	}
}

export { UmbPropertyEditorUiRteQuillElementElement as element };

declare global {
	interface HTMLElementTagNameMap {
		[elementName]: UmbPropertyEditorUiRteQuillElementElement;
	}
}
