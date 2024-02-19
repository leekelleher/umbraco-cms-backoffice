import type { UmbDocumentCollectionItemModel } from '../../../types.js';
import { css, customElement, html, property } from '@umbraco-cms/backoffice/external/lit';
import { UmbLitElement } from '@umbraco-cms/backoffice/lit-element';
import { UMB_WORKSPACE_MODAL, UmbModalRouteRegistrationController } from '@umbraco-cms/backoffice/modal';
import type { UmbTableColumnLayoutElement, UmbTableColumn, UmbTableItem } from '@umbraco-cms/backoffice/components';

@customElement('umb-document-table-column-name')
export class UmbDocumentTableColumnNameElement extends UmbLitElement implements UmbTableColumnLayoutElement {
	@property({ type: Object, attribute: false })
	column!: UmbTableColumn;

	@property({ type: Object, attribute: false })
	item!: UmbTableItem;

	@property({ attribute: false })
	value!: UmbDocumentCollectionItemModel;

	#documentEditorModal: UmbModalRouteRegistrationController;

	constructor() {
		super();

		this.#documentEditorModal = new UmbModalRouteRegistrationController(this, UMB_WORKSPACE_MODAL)
			.addAdditionalPath('document/edit/:unique')
			.onSetup((params) => {
				console.log('onSetup', params);
				return { data: { entityType: 'document', preset: { unique: params.unique } } };
			})
			.onSubmit((value) => {
				console.log('onSubmit', value);
			});
	}

	#onClick(event: Event) {
		event.stopPropagation();

		this.#documentEditorModal?.open({ unique: this.value.unique });
	}

	render() {
		return html`<uui-button
			look="default"
			color="default"
			compact
			label=${this.value.name}
			@click=${this.#onClick}></uui-button>`;
	}

	static styles = [
		css`
			uui-button {
				text-align: left;
			}
		`,
	];
}

export default UmbDocumentTableColumnNameElement;

declare global {
	interface HTMLElementTagNameMap {
		'umb-document-table-column-name': UmbDocumentTableColumnNameElement;
	}
}
