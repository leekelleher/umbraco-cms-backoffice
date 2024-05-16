import { mustache } from '@umbraco-cms/backoffice/external/mustache';
import { DOMPurify } from '@umbraco-cms/backoffice/external/dompurify';
import { Marked } from '@umbraco-cms/backoffice/external/marked';
import type { UmbLitElement } from '@umbraco-cms/backoffice/lit-element';
import type { UmbController } from '@umbraco-cms/backoffice/controller-api';

const LabelTemplateControllerAlias = Symbol();

export class UmbLabelTemplateController implements UmbController {
	#host;
	#marked;
	#domPurifyConfig: DOMPurify.Config;

	// Considerations
	// https://underscorejs.org/#template
	// https://github.com/jvitela/mustache-wax
	// https://github.com/justinfagnani/jexpr
	// https://github.com/angular/angular.js/blob/v1.8.3/src/ng/interpolate.js#L240



	constructor(host: UmbLitElement) {
		this.#host = host;
		this.#host.addUmbController(this);

		// https://marked.js.org/using_advanced

		this.#marked = new Marked({ gfm: true, breaks: true });

		// https://github.com/cure53/DOMPurify/tree/main/demos#what-is-this
		// https://github.com/cure53/DOMPurify?tab=readme-ov-file#can-i-configure-dompurify

		this.#domPurifyConfig = {
			CUSTOM_ELEMENT_HANDLING: {
				tagNameCheck: /^uui-|umb-/,
				attributeNameCheck: /color|look/,
				allowCustomizedBuiltInElements: true,
			},
		};

		DOMPurify.addHook('afterSanitizeAttributes', function (node) {
			// set all elements owning target to target=_blank
			if ('target' in node) {
				node.setAttribute('target', '_blank');
			}
		});
	}

	readonly controllerAlias = LabelTemplateControllerAlias;

	transform(input: string, obj?: any): string | null | undefined {
		if (!input) return undefined;

		const localized = this.#host.localize.string(input);
		const mustached = obj ? mustache.render(localized, obj) : localized;
		const markdowned = this.#marked.parse(mustached) as string;
		const sanitized = markdowned ? (DOMPurify.sanitize(markdowned, this.#domPurifyConfig) as string) : mustached;

		return sanitized;
	}

	hostConnected() {
		console.log('labelTemplate.hostConnected');
	}

	hostDisconnected() {
		console.log('labelTemplate.hostDisconnected');
		DOMPurify.removeHook('afterSanitizeAttributes');
	}

	destroy() {
		console.log('labelTemplate.destroy');
		this.#host?.removeUmbController(this);
		DOMPurify.removeHook('afterSanitizeAttributes');
	}
}
