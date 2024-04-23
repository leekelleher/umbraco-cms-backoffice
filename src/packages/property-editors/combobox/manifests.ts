import type { ManifestPropertyEditorUi } from '@umbraco-cms/backoffice/extension-registry';

export const manifest: ManifestPropertyEditorUi = {
	type: 'propertyEditorUi',
	alias: 'Umb.PropertyEditorUi.Combobox',
	name: 'Combobox Property Editor UI',
	element: () => import('./property-editor-ui-combobox.element.js'),
	meta: {
		label: 'Combobox',
		icon: 'icon-list',
		group: 'pickers',
		settings: {
			properties: [
				{
					alias: 'items',
					label: 'Add options',
					propertyEditorUiAlias: 'Umb.PropertyEditorUi.MultipleTextString',
				},
			],
		},
	},
};
