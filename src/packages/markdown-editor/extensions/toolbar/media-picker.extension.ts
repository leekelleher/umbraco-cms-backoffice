import { UmbControllerBase } from '@umbraco-cms/backoffice/class-api';
import { UmbMediaUrlRepository, UMB_MEDIA_PICKER_MODAL } from '@umbraco-cms/backoffice/media';
import { UMB_MODAL_MANAGER_CONTEXT } from '@umbraco-cms/backoffice/modal';
import type { UUIModalSidebarSize } from '@umbraco-cms/backoffice/external/uui';

export class UmbMediaPickerMonacoMarkdownEditorAction extends UmbControllerBase {
	#mediaUrlRepository = new UmbMediaUrlRepository(this);

	getKeybindings() {
		return null; // What keybinding would be good for image?
	}

	async execute({ editor, overlaySize }: { editor: any; overlaySize: UUIModalSidebarSize }) {
		if (!editor) throw new Error('Editor not found');

		const selection = editor.getSelections()[0];
		if (!selection) return;

		const alt = editor.getValueInRange(selection) || 'enter image description here';

		// Focus before opening modal, otherwise cannot regain focus back after modal
		editor.monacoEditor?.focus();

		const modalManager = await this.getContext(UMB_MODAL_MANAGER_CONTEXT);
		const modalContext = modalManager.open(this, UMB_MEDIA_PICKER_MODAL, { modal: { size: overlaySize } });

		modalContext
			?.onSubmit()
			.then(async (value) => {
				if (!value) return;

				const uniques = value.selection;
				const { data: mediaUrls } = await this.#mediaUrlRepository.requestItems(uniques);
				const mediaUrl = mediaUrls?.length ? (mediaUrls[0].url ?? 'URL') : 'URL';

				editor.monacoEditor?.executeEdits('', [
					{
						range: selection,
						text: `![${alt}](${mediaUrl})`,
					},
				]);

				editor.select({
					startColumn: selection.startColumn + 2,
					endColumn: selection.startColumn + alt.length + 2, // +2 because of ![
					endLineNumber: selection.startLineNumber,
					startLineNumber: selection.startLineNumber,
				});
			})
			.catch(() => undefined)
			.finally(() => editor.monacoEditor?.focus());
	}
}

export { UmbMediaPickerMonacoMarkdownEditorAction as api };
