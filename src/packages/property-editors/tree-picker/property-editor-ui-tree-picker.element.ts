import { html, customElement, property, state } from '@umbraco-cms/backoffice/external/lit';
import { observeMultiple } from '@umbraco-cms/backoffice/observable-api';
import { UmbLitElement } from '@umbraco-cms/backoffice/lit-element';
import { UmbDynamicRootRepository } from '@umbraco-cms/backoffice/dynamic-root';
import { UmbPropertyValueChangeEvent } from '@umbraco-cms/backoffice/property-editor';
import { UMB_ENTITY_WORKSPACE_CONTEXT } from '@umbraco-cms/backoffice/workspace';
import type { UmbInputTreeElement } from '@umbraco-cms/backoffice/tree';
import type { UmbPropertyEditorConfigCollection } from '@umbraco-cms/backoffice/property-editor';
import type { UmbPropertyEditorUiElement } from '@umbraco-cms/backoffice/extension-registry';
import type { UmbTreePickerSource } from '@umbraco-cms/backoffice/components';
import type { UmbDocumentWorkspaceContext } from '@umbraco-cms/backoffice/document';

/**
 * @element umb-property-editor-ui-tree-picker
 */
@customElement('umb-property-editor-ui-tree-picker')
export class UmbPropertyEditorUITreePickerElement extends UmbLitElement implements UmbPropertyEditorUiElement {
	@property({ type: Array })
	value: UmbInputTreeElement['items'] = [];

	@state()
	type: UmbTreePickerSource['type'] = 'content';

	@state()
	startNodeId?: string | null;

	@state()
	min = 0;

	@state()
	max = Infinity;

	@state()
	allowedContentTypeIds?: string | null;

	@state()
	showOpenButton?: boolean;

	@state()
	ignoreUserStartNodes?: boolean;

	#dynamicRoot?: UmbTreePickerSource['dynamicRoot'];

	#dynamicRootRepository = new UmbDynamicRootRepository(this);

	#workspaceContext?: typeof UMB_ENTITY_WORKSPACE_CONTEXT.TYPE;

	public set config(config: UmbPropertyEditorConfigCollection | undefined) {
		if (!config) return;

		const startNode = config.getValueByAlias<UmbTreePickerSource>('startNode');
		if (startNode) {
			this.type = startNode.type;
			this.startNodeId = startNode.id;
			this.#dynamicRoot = startNode.dynamicRoot;
		}

		this.min = Number(config.getValueByAlias('minNumber')) || 0;
		this.max = Number(config.getValueByAlias('maxNumber')) || Infinity;

		this.allowedContentTypeIds = config.getValueByAlias('filter');
		this.showOpenButton = config.getValueByAlias('showOpenButton');
		this.ignoreUserStartNodes = config.getValueByAlias('ignoreUserStartNodes');
	}

	constructor() {
		super();

		this.consumeContext(UMB_ENTITY_WORKSPACE_CONTEXT, (workspaceContext) => {
			this.#workspaceContext = workspaceContext;
		});
	}

	connectedCallback() {
		super.connectedCallback();

		this.#setStartNodeId();
	}

	async #setStartNodeId() {
		if (this.startNodeId) return;
		if (this.type !== 'content') return;

		// NOTE: Since the `startNode` can only be configured for documents (content),
		// then we can assume the workspace context is a document workspace context. [LK]
		const documentWorkspaceContext = this.#workspaceContext as UmbDocumentWorkspaceContext;
		if (!documentWorkspaceContext) return;
		this.observe(
			observeMultiple([documentWorkspaceContext.unique, documentWorkspaceContext.parentUnique]),
			async ([unique, parentUnique]) => {
				if (unique) {
					const result = await this.#dynamicRootRepository.postDynamicRootQuery(
						this.#dynamicRoot,
						unique,
						parentUnique,
					);
					if (result && result.length > 0) {
						this.startNodeId = result[0];
					}
				}
			},
		);
	}

	#onChange(event: CustomEvent & { target: UmbInputTreeElement }) {
		this.value = event.target.items;
		this.dispatchEvent(new UmbPropertyValueChangeEvent());
	}

	render() {
		return html`<umb-input-tree
			.items=${this.value}
			.type=${this.type}
			.startNodeId=${this.startNodeId ?? ''}
			.min=${this.min}
			.max=${this.max}
			.allowedContentTypeIds=${this.allowedContentTypeIds ?? ''}
			?showOpenButton=${this.showOpenButton}
			?ignoreUserStartNodes=${this.ignoreUserStartNodes}
			@change=${this.#onChange}></umb-input-tree>`;
	}
}

export default UmbPropertyEditorUITreePickerElement;

declare global {
	interface HTMLElementTagNameMap {
		'umb-property-editor-ui-tree-picker': UmbPropertyEditorUITreePickerElement;
	}
}
