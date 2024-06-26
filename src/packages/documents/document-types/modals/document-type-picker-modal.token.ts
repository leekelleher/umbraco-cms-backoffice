import { UmbModalToken } from '@umbraco-cms/backoffice/modal';
import type { UmbDocumentTypeTreeItemModel } from '@umbraco-cms/backoffice/document-type';
import {
	type UmbTreePickerModalValue,
	type UmbTreePickerModalData,
	UMB_TREE_PICKER_MODAL_ALIAS,
} from '@umbraco-cms/backoffice/tree';

export type UmbDocumentTypePickerModalData = UmbTreePickerModalData<UmbDocumentTypeTreeItemModel>;
export type UmbDocumentTypePickerModalValue = UmbTreePickerModalValue;

export const UMB_DOCUMENT_TYPE_PICKER_MODAL = new UmbModalToken<
	UmbDocumentTypePickerModalData,
	UmbDocumentTypePickerModalValue
>(UMB_TREE_PICKER_MODAL_ALIAS, {
	modal: {
		type: 'sidebar',
		size: 'small',
	},
	data: {
		treeAlias: 'Umb.Tree.DocumentType',
	},
});
