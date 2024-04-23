import { html, customElement, property, state, map, when } from '@umbraco-cms/backoffice/external/lit';
import { UmbLitElement } from '@umbraco-cms/backoffice/lit-element';
import { UmbPropertyValueChangeEvent } from '@umbraco-cms/backoffice/property-editor';
import type { UmbPropertyEditorConfigCollection } from '@umbraco-cms/backoffice/property-editor';
import type { UmbPropertyEditorUiElement } from '@umbraco-cms/backoffice/extension-registry';
import type { UUISelectEvent } from '@umbraco-cms/backoffice/external/uui';

/**
 * @element umb-property-editor-ui-combobox
 */
@customElement('umb-property-editor-ui-combobox')
export class UmbPropertyEditorUIComboboxElement extends UmbLitElement implements UmbPropertyEditorUiElement {
	#selection: Array<string> = [];

	@property({ type: Array })
	public set value(value: Array<string> | string | undefined) {
		this.#selection = Array.isArray(value) ? value : value ? [value] : [];
	}
	public get value(): Array<string> | undefined {
		return this.#selection;
	}

	public set config(config: UmbPropertyEditorConfigCollection | undefined) {
		if (!config) return;

		const items = config.getValueByAlias('items');

		if (Array.isArray(items) && items.length > 0) {
			this._options =
				typeof items[0] === 'string'
					? items.map((item) => ({ name: item, value: item, selected: item === this.value }))
					: items.map((item) => ({ name: item.name, value: item.value, selected: item.value === this.value }));
		}

		this._multiple = config.getValueByAlias<boolean>('multiple') ?? false;
	}

	@state()
	private _options: Array<Option> = [];

	@state()
	private _multiple: boolean = false;

	#onChange(event: UUISelectEvent) {
		const value = event.target.value as string;
		this.value = value ? [value] : [];
		this.dispatchEvent(new UmbPropertyValueChangeEvent());
	}

	render() {
		return when(
			!this._multiple,
			() => html`<uui-combobox @change=${this.#onChange}>${this.#renderList()}</uui-combobox>`,
			() => this.#renderList(),
		);
	}

	#renderList() {
		return html`
			<uui-combobox-list>
				${map(
					this._options,
					(item) => html`
						<uui-combobox-list-option value=${item.value} ?selected=${item.selected}>
							${item.name}
						</uui-combobox-list-option>
					`,
				)}
			</uui-combobox-list>
		`;
	}
}

export default UmbPropertyEditorUIComboboxElement;

declare global {
	interface HTMLElementTagNameMap {
		'umb-property-editor-ui-combobox': UmbPropertyEditorUIComboboxElement;
	}
}
