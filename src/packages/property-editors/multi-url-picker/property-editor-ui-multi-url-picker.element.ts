import { customElement, html, property, state } from '@umbraco-cms/backoffice/external/lit';
import { UmbLitElement } from '@umbraco-cms/backoffice/lit-element';
import { UmbPropertyValueChangeEvent } from '@umbraco-cms/backoffice/property-editor';
import { UMB_PROPERTY_CONTEXT } from '@umbraco-cms/backoffice/property';
import type { UmbInputMultiUrlElement } from '@umbraco-cms/backoffice/components';
import type { UmbLinkPickerLink } from '@umbraco-cms/backoffice/modal';
import type { UmbPropertyEditorConfigCollection } from '@umbraco-cms/backoffice/property-editor';
import type { UmbPropertyEditorUiElement } from '@umbraco-cms/backoffice/extension-registry';
import type { UUIModalSidebarSize } from '@umbraco-cms/backoffice/external/uui';

/**
 * @element umb-property-editor-ui-multi-url-picker
 */
@customElement('umb-property-editor-ui-multi-url-picker')
export class UmbPropertyEditorUIMultiUrlPickerElement extends UmbLitElement implements UmbPropertyEditorUiElement {
	@property({ type: Array })
	value: Array<UmbLinkPickerLink> = [];

	public set config(config: UmbPropertyEditorConfigCollection | undefined) {
		if (!config) return;

		this._hideAnchor = config.getValueByAlias('hideAnchor') ?? false;
		this._ignoreUserStartNodes = config.getValueByAlias<boolean>('ignoreUserStartNodes') ?? false;
		this._minNumber = Number(config.getValueByAlias('minNumber')) ?? 0;
		this._maxNumber = Number(config.getValueByAlias('maxNumber')) ?? Infinity;
		this._overlaySize = config.getValueByAlias<UUIModalSidebarSize>('overlaySize') ?? 'small';
	}

	@state()
	private _overlaySize?: UUIModalSidebarSize;

	@state()
	private _hideAnchor?: boolean;

	@state()
	private _ignoreUserStartNodes?: boolean;

	@state()
	private _minNumber? = 0;

	@state()
	private _maxNumber? = Infinity;

	@state()
	private _alias?: string;

	@state()
	private _variantId?: string;

	constructor() {
		super();

		this.consumeContext(UMB_PROPERTY_CONTEXT, (context) => {
			this.observe(context.alias, (alias) => (this._alias = alias));
			this.observe(context.variantId, (variantId) => (this._variantId = variantId?.toString() || 'invariant'));
		});
	}

	#onChange(event: CustomEvent & { target: UmbInputMultiUrlElement }) {
		this.value = event.target.urls;
		this.dispatchEvent(new UmbPropertyValueChangeEvent());
	}

	render() {
		return html`
			<umb-input-multi-url
				.alias=${this._alias}
				.ignoreUserStartNodes=${this._ignoreUserStartNodes}
				.max=${this._maxNumber}
				.min=${this._minNumber}
				.overlaySize=${this._overlaySize}
				.urls=${this.value ?? []}
				.variantId=${this._variantId}
				?hide-anchor=${this._hideAnchor}
				@change=${this.#onChange}>
			</umb-input-multi-url>
		`;
	}
}

export default UmbPropertyEditorUIMultiUrlPickerElement;

declare global {
	interface HTMLElementTagNameMap {
		'umb-property-editor-ui-multi-url-picker': UmbPropertyEditorUIMultiUrlPickerElement;
	}
}
