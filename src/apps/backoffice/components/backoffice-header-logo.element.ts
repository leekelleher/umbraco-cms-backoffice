import { UMB_BACKOFFICE_CONTEXT } from '../backoffice.context.js';
import { css, customElement, html, query, state, when } from '@umbraco-cms/backoffice/external/lit';
import { UmbLitElement } from '@umbraco-cms/backoffice/lit-element';
import { UmbTextStyles } from '@umbraco-cms/backoffice/style';
import type { UUIPopoverContainerElement } from '@umbraco-cms/backoffice/external/uui';

import './xslt-macro.js';

@customElement('umb-backoffice-header-logo')
export class UmbBackofficeHeaderLogoElement extends UmbLitElement {
	@state()
	private _version?: string;

	#max = Infinity;

	constructor() {
		super();

		this.consumeContext(UMB_BACKOFFICE_CONTEXT, (context) => {
			this.observe(
				context.version,
				(version) => {
					if (!version) return;
					this._version = version;
					this.#max = Number.parseInt(version) ?? Infinity;
				},
				'_observeVersion',
			);
		});
	}

	@state()
	private _count = 0;

	@state()
	private _progress = 0;

	@state()
	private _showThing = false;

	@query('#logo-popover')
	private _popoverContainerElement?: UUIPopoverContainerElement;

	#onClick() {
		if (this._count > this.#max) {
			this._count = 1;
		}

		this._count++;
		this._progress = (this._count / this.#max) * 100;

		if (this._count === this.#max) {
			this._showThing = true;
			this._popoverContainerElement?.hidePopover();
		}
	}

	render() {
		return html`
			<uui-button id="logo" look="primary" label="Umbraco" compact popovertarget="logo-popover">
				<img src="/umbraco/backoffice/assets/umbraco_logomark_white.svg" alt="Umbraco" />
			</uui-button>
			<uui-popover-container id="logo-popover" placement="bottom-start">
				<umb-popover-layout>
					<div id="modal">
						<img src="/umbraco/backoffice/assets/umbraco_logo_blue.svg" alt="Umbraco" loading="lazy" />
						<uui-button @click=${this.#onClick}>${this._version}</uui-button>
						<a href="https://umbraco.com" target="_blank" rel="noopener">Umbraco.com</a>
					</div>
					<uui-progress-bar progress=${this._progress}></uui-progress-bar>
				</umb-popover-layout>
			</uui-popover-container>
			${when(this._showThing, () => html`<umb-bouncing-logo id="thing" speed="8"></umb-bouncing-logo>`)}
		`;
	}

	static styles = [
		UmbTextStyles,
		css`
			#logo {
				display: var(--umb-header-logo-display, inline);
				--uui-button-background-color: transparent;
				--uui-button-padding-top-factor: 1;
				--uui-button-padding-bottom-factor: 0.5;
				margin-right: var(--uui-size-space-2);
			}

			#logo > img {
				height: var(--uui-size-10);
				width: var(--uui-size-10);
			}

			#modal {
				padding: var(--uui-size-space-6);
				display: flex;
				flex-direction: column;
				align-items: center;
				gap: var(--uui-size-space-3);
				min-width: var(--uui-size-100);
			}

			uui-progress-bar {
				display: block;
				--uui-color-positive: var(--uui-color-current);
			}

			#thing {
				z-index: 999999;
				position: absolute;
				top: 0;
				bottom: 0;
				left: 0;
				right: 0;
			}
		`,
	];
}

declare global {
	interface HTMLElementTagNameMap {
		'umb-backoffice-header-logo': UmbBackofficeHeaderLogoElement;
	}
}
