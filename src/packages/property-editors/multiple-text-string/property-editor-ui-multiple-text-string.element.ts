import { UmbPropertyValueChangeEvent } from '../../core/property-editor/index.js';
import { html, customElement, property, state } from '@umbraco-cms/backoffice/external/lit';
import { UmbLitElement } from '@umbraco-cms/backoffice/lit-element';
import type { UmbChangeEvent } from '@umbraco-cms/backoffice/event';
import type { UmbInputMultipleTextStringElement } from '@umbraco-cms/backoffice/components';
import type { UmbPropertyEditorConfigCollection } from '@umbraco-cms/backoffice/property-editor';
import type { UmbPropertyEditorUiElement } from '@umbraco-cms/backoffice/extension-registry';

/**
 * @element umb-property-editor-ui-multiple-text-string
 */
@customElement('umb-property-editor-ui-multiple-text-string')
export class UmbPropertyEditorUIMultipleTextStringElement extends UmbLitElement implements UmbPropertyEditorUiElement {
	@property({ type: Array })
	value?: Array<string>;

	public set config(config: UmbPropertyEditorConfigCollection | undefined) {
		this._limitMin = config?.getValueByAlias<number>('min') ?? 0;
		this._limitMax = config?.getValueByAlias<number>('max') ?? Infinity;
	}

	/**
	 * Disables the Multiple Text String Property Editor UI
	 * @type {boolean}
	 * @attr
	 * @default false
	 */
	@property({ type: Boolean, reflect: true })
	disabled = false;

	/**
	 * Makes the Multiple Text String Property Editor UI readonly
	 * @type {boolean}
	 * @attr
	 * @default false
	 */
	@property({ type: Boolean, reflect: true })
	readonly = false;

	/**
	 * Makes the Multiple Text String Property Editor UI mandatory
	 * @type {boolean}
	 * @attr
	 * @default false
	 */
	@property({ type: Boolean, reflect: true })
	required = false;

	@state()
	private _limitMin: number = 0;

	@state()
	private _limitMax: number = Infinity;

	#onChange(event: UmbChangeEvent) {
		event.stopPropagation();
		const target = event.currentTarget as UmbInputMultipleTextStringElement;
		this.value = target.items;
		this.dispatchEvent(new UmbPropertyValueChangeEvent());
	}

	render() {
		return html`<umb-input-multiple-text-string
			.items=${this.value ?? []}
			.min=${this._limitMin}
			.max=${this._limitMax}
			?disabled=${this.disabled}
			?readonly=${this.readonly}
			?required=${this.required}
			@change=${this.#onChange}></umb-input-multiple-text-string>`;
	}
}

export default UmbPropertyEditorUIMultipleTextStringElement;

declare global {
	interface HTMLElementTagNameMap {
		'umb-property-editor-ui-multiple-text-string': UmbPropertyEditorUIMultipleTextStringElement;
	}
}
