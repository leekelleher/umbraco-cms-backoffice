import type { ManifestPropertyEditorUi, ManifestTypes } from '@umbraco-cms/backoffice/extension-registry';

const manifest: ManifestPropertyEditorUi = {
	type: 'propertyEditorUi',
	alias: 'Umb.PropertyEditorUi.Rte.Quill',
	name: 'Rich Text Editor [Quill] Property Editor UI',
	element: () => import('./property-editor-ui-rte-quill.element.js'),
	meta: {
		label: 'Rich Text Editor [Quill]',
		propertyEditorSchemaAlias: 'Umbraco.RichText',
		icon: 'icon-browser-window',
		group: 'richContent',
		supportsReadOnly: true,
		settings: {
			properties: [],
		},
	},
};

export const manifests: Array<ManifestTypes> = [manifest];
