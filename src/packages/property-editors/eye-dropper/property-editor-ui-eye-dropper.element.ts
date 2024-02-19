import { html, customElement, property, state } from '@umbraco-cms/backoffice/external/lit';
import { UmbLitElement } from '@umbraco-cms/backoffice/lit-element';
import { UmbPropertyValueChangeEvent } from '@umbraco-cms/backoffice/property-editor';
import type { UmbPropertyEditorConfigCollection } from '@umbraco-cms/backoffice/property-editor';
import type { UmbPropertyEditorUiElement } from '@umbraco-cms/backoffice/extension-registry';
import type { UUIColorPickerChangeEvent } from '@umbraco-cms/backoffice/external/uui';

/**
 * @element umb-property-editor-ui-eye-dropper
 */
@customElement('umb-property-editor-ui-eye-dropper')
export class UmbPropertyEditorUIEyeDropperElement extends UmbLitElement implements UmbPropertyEditorUiElement {
	#defaultOpacity = false;

	@property()
	value = '';

	@state()
	private _opacity = this.#defaultOpacity;

	@state()
	private _swatches: string[] = [];

	public set config(config: UmbPropertyEditorConfigCollection | undefined) {
		this._opacity = config?.getValueByAlias('showAlpha') ?? this.#defaultOpacity;

		const showPalette = config?.getValueByAlias('showPalette') ?? false;

		if (!showPalette) {
			// TODO: This is a temporary solution until we have a proper way to get the palette from the config. [LK]
			// NOTE: Duplicated from: https://github.com/umbraco/Umbraco.UI/blob/v1.8.0-rc.3/packages/uui-color-picker/lib/uui-color-picker.element.ts#L157-L174
			this._swatches = [
				'#d0021b',
				'#f5a623',
				'#f8e71c',
				'#8b572a',
				'#7ed321',
				'#417505',
				'#bd10e0',
				'#9013fe',
				'#4a90e2',
				'#50e3c2',
				'#b8e986',
				'#000',
				'#444',
				'#888',
				'#ccc',
				'#fff',
			];
		}
	}

	#onChange(event: UUIColorPickerChangeEvent) {
		this.value = event.target.value;
		this.dispatchEvent(new UmbPropertyValueChangeEvent());
	}

	render() {
		return html`
			<umb-input-eye-dropper
				.opacity=${this._opacity}
				.swatches=${this._swatches}
				value=${this.value}
				@change=${this.#onChange}></umb-input-eye-dropper>
		`;
	}
}

export default UmbPropertyEditorUIEyeDropperElement;

declare global {
	interface HTMLElementTagNameMap {
		'umb-property-editor-ui-eye-dropper': UmbPropertyEditorUIEyeDropperElement;
	}
}
