import { css, customElement, html, nothing, property, repeat, state, when } from '@umbraco-cms/backoffice/external/lit';
import { contextData, UmbContextDebugRequest } from '@umbraco-cms/backoffice/context-api';
import { UmbLitElement } from '@umbraco-cms/backoffice/lit-element';
import { UmbTextStyles } from '@umbraco-cms/backoffice/style';
import { UMB_CONTEXT_DEBUGGER_MODAL, UMB_MODAL_MANAGER_CONTEXT } from '@umbraco-cms/backoffice/modal';
import type { DebugContextData, DebugContextItemData } from '@umbraco-cms/backoffice/context-api';
import type { TemplateResult } from '@umbraco-cms/backoffice/external/lit';
import type { UmbModalManagerContext } from '@umbraco-cms/backoffice/modal';

@customElement('umb-debug')
export class UmbDebugElement extends UmbLitElement {
	@property({ type: Boolean })
	visible = false;

	@property({ type: Boolean })
	dialog = false;

	@state()
	private _contextData = Array<DebugContextData>();

	@state()
	private _debugPaneOpen = false;

	private _modalContext?: UmbModalManagerContext;

	constructor() {
		super();
		this.consumeContext(UMB_MODAL_MANAGER_CONTEXT, (instance) => {
			this._modalContext = instance;
		});
	}

	private _update() {
		this.dispatchEvent(
			new UmbContextDebugRequest((contexts: Map<any, any>) => {
				// The Contexts are collected
				// When travelling up through the DOM from this element
				// to the root of <umb-app> which then uses the callback prop
				// of the this event tha has been raised to assign the contexts
				// back to this property of the WebComponent

				// Massage the data into a simplier array of objects
				// From a function in the context-api '
				this._contextData = contextData(contexts);
				this.requestUpdate('_contextData');
			}),
		);
	}

	#toggleDebugPane() {
		this._debugPaneOpen = !this._debugPaneOpen;
		if (this._debugPaneOpen) {
			this._update();
		}
	}

	private _openDialog() {
		this._update();

		this._modalContext?.open(this, UMB_CONTEXT_DEBUGGER_MODAL, {
			data: {
				content: html`${this.#renderContextAliases()}`,
			},
		});
	}

	render() {
		if (!this.visible) return nothing;
		return this.dialog ? this.#renderDialog() : this.#renderPanel();
	}

	#renderDialog() {
		return html`
			<div>
				<uui-badge color="danger" look="primary" @click=${this._openDialog}>
					<uui-icon name="icon-bug"></uui-icon>
					<span>Debug</span>
				</uui-badge>
			</div>
		`;
	}

	#renderPanel() {
		return html`
			<div id="container">
				<uui-button color="danger" look="primary" @click=${this.#toggleDebugPane}>
					<uui-icon name="icon-bug"></uui-icon>
					<span>Debug</span>
				</uui-button>
				${when(this._debugPaneOpen, () => html`<div class="events">${this.#renderContextAliases()}</div>`)}
			</div>
		`;
	}

	#renderContextAliases() {
		return repeat(
			this._contextData,
			(context) => context.alias,
			(context) => {
				return html`
					<details>
						<summary><strong>${context.alias}</strong></summary>
						${this.#renderInstance(context.data)}
					</details>
				`;
			},
		);
	}

	#renderInstance(instance: DebugContextItemData) {
		const instanceTemplates: TemplateResult[] = [];

		if (instance.type === 'function') {
			return instanceTemplates.push(html`<h3>Callable Function</h3>`);
		} else if (instance.type === 'object') {
			if (instance.methods?.length) {
				instanceTemplates.push(html`
					<details>
						<summary>Methods</summary>
						<ul>
							${instance.methods?.map((methodName) => html`<li>${methodName}</li>`)}
						</ul>
					</details>
				`);
			}

			const props: TemplateResult[] = [];
			instance.properties?.forEach((property) => {
				switch (property.type) {
					case 'string':
					case 'number':
					case 'boolean':
					case 'object':
						props.push(html`<li>${property.key} <em>(${property.type})</em> = ${property.value}</li>`);
						break;

					default:
						props.push(html`<li>${property.key} <em>(${property.type})</em></li>`);
						break;
				}
			});

			instanceTemplates.push(html`
				<details>
					<summary>Properties</summary>
					<ul>
						${props}
					</ul>
				</details>
			`);
		} else if (instance.type === 'primitive') {
			instanceTemplates.push(html`<p>Context is a primitive with value: ${instance.value}</p>`);
		}

		return instanceTemplates;
	}

	static styles = [
		UmbTextStyles,
		css`
			:host {
				float: right;
				font-family: monospace;
				position: relative;
				z-index: 10000;
			}

			#container {
				display: flex;
				flex-direction: column;
				align-items: flex-end;
			}

			uui-badge {
				cursor: pointer;
				gap: 0.5rem;
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
