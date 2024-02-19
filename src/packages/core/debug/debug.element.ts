import { UMB_CONTEXT_DEBUGGER_MODAL } from './debug-modal/debug-modal.token.js';
import { css, customElement, html, map, property, state, when } from '@umbraco-cms/backoffice/external/lit';
import { contextData, UmbContextDebugRequest } from '@umbraco-cms/backoffice/context-api';
import { UmbLitElement } from '@umbraco-cms/backoffice/lit-element';
import { UMB_MODAL_MANAGER_CONTEXT } from '@umbraco-cms/backoffice/modal';
import type { UmbDebugContextData, UmbDebugContextItemData } from '@umbraco-cms/backoffice/context-api';
import type { UmbModalManagerContext } from '@umbraco-cms/backoffice/modal';

@customElement('umb-debug')
export class UmbDebugElement extends UmbLitElement {
	@property({ type: Boolean })
	dialog = false;

	@state()
	private _contextData = Array<UmbDebugContextData>();

	@state()
	private _debugPaneOpen = false;

	private _modalContext?: UmbModalManagerContext;

	constructor() {
		super();
		this.consumeContext(UMB_MODAL_MANAGER_CONTEXT, (instance) => {
			this._modalContext = instance;
		});
	}

	#update() {
		this.dispatchEvent(
			new UmbContextDebugRequest((contexts: Map<any, any>) => {
				// The Contexts are collected
				// When travelling up through the DOM from this element
				// to the root of <umb-app> which then uses the callback prop
				// of this event that has been raised to assign the contexts
				// back to this property of the WebComponent

				// Massage the data into a simplier array of objects
				// from a function in the context-api.
				this._contextData = contextData(contexts);
				this.requestUpdate('_contextData');
			}),
		);
	}

	#toggleDebugPane() {
		this._debugPaneOpen = !this._debugPaneOpen;
		if (this._debugPaneOpen) {
			this.#update();
		}
	}

	#openDialog() {
		this.#update();

		this._modalContext?.open(this, UMB_CONTEXT_DEBUGGER_MODAL, {
			data: {
				content: this.#renderContextAliases(),
			},
		});
	}

	override render() {
		return html`
			<div id="container">
				<uui-button
					compact
					color="danger"
					look="primary"
					@click=${this.dialog ? this.#openDialog : this.#toggleDebugPane}>
					<uui-icon name="icon-bug"></uui-icon>
					<span>Debug</span>
				</uui-button>
				${when(!this.dialog && this._debugPaneOpen, () => this.#renderContextAliases())}
			</div>
		`;
	}

	#renderContextAliases() {
		return html`
			<div class="events">
				${map(this._contextData, (context) => {
					return html`
						<details>
							<summary><strong>${context.alias}</strong></summary>
							${this.#renderInstance(context.data)}
						</details>
					`;
				})}
			</div>
		`;
	}

	#renderInstance(instance: UmbDebugContextItemData) {
		switch (instance.type) {
			case 'function': {
				return html`<h3>Callable Function</h3>`;
			}

			case 'object': {
				return html`
					<details>
						<summary>Methods</summary>
						<ul>
							${map(instance.methods, (methodName) => html`<li>${methodName}</li>`)}
						</ul>
					</details>

					<details>
						<summary>Properties</summary>
						<ul>
							${map(instance.properties, (property) => {
								switch (property.type) {
									case 'string':
									case 'number':
									case 'boolean':
									case 'object':
										return html`<li>${property.key} <em>(${property.type})</em> = ${property.value}</li>`;

									default:
										return html`<li>${property.key} <em>(${property.type})</em></li>`;
								}
							})}
						</ul>
					</details>
				`;
			}

			case 'primitive': {
				return html`<p>Context is a primitive with value: ${instance.value}</p>`;
			}

			default: {
				return html`<p>Unknown type: ${instance.type}</p>`;
			}
		}
	}

	static override styles = [
		css`
			:host {
				display: inline-flex;
				font-family: monospace;
			}

			#container {
				display: flex;
				flex-direction: column;
				align-items: flex-end;
			}

			uui-icon {
				font-size: 15px;
			}

			.events {
				background-color: var(--uui-color-danger);
				color: var(--uui-color-selected-contrast);
				padding: 1rem;
			}

			summary {
				cursor: pointer;
			}

			details > details {
				margin-left: 1rem;
			}

			ul {
				margin-top: 0;
			}
		`,
	];
}

declare global {
	interface HTMLElementTagNameMap {
		'umb-debug': UmbDebugElement;
	}
}
