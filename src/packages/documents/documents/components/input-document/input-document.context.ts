import { UMB_DOCUMENT_REPOSITORY_ALIAS } from '../../repository/index.js';
import { UmbPickerInputContext } from '@umbraco-cms/backoffice/picker-input';
import type { UmbControllerHostElement } from '@umbraco-cms/backoffice/controller-api';
import { UMB_DOCUMENT_PICKER_MODAL } from '@umbraco-cms/backoffice/modal';
import type { DocumentTreeItemResponseModel } from '@umbraco-cms/backoffice/backend-api';

export class UmbDocumentPickerContext extends UmbPickerInputContext<DocumentTreeItemResponseModel> {
	constructor(host: UmbControllerHostElement) {
		super(host, UMB_DOCUMENT_REPOSITORY_ALIAS, UMB_DOCUMENT_PICKER_MODAL);
	}
}
