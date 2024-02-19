import type { ManifestMonacoMarkdownEditorAction } from './monaco-markdown-editor-action.extension.js';

export const manifests: Array<ManifestMonacoMarkdownEditorAction> = [
	{
		type: 'monacoMarkdownEditorAction',
		alias: 'Umb.MonacoMarkdownEditor.Action.MediaPicker',
		name: 'Media Picker Monaco Markdown Editor Action',
		api: () => import('./toolbar/media-picker.extension.js'),
		meta: {
			label: '#buttons_pictureInsert',
			icon: 'icon-picture',
		},
	},
];

// TODO: [LK] The idea is that there'll be a markdown editor "action",
// and a toolbar "extension" (button) that will trigger an action.
// This gives a separation between keyboard shortcuts and toolbar buttons.
export const toolbar = [
	{
		type: 'monacoMarkdownEditorToolbarExtension',
		kind: 'button',
		alias: 'Umb.MonacoMarkdownEditor.Toolbar.MediaPicker',
		forAction: 'Umb.MonacoMarkdownEditor.Action.MediaPicker',
		meta: {
			label: '#buttons_pictureInsert',
			icon: 'icon-picture',
		},
	},
];
