import { DOCUMENT_TYPE_ROOT_ENTITY_TYPE } from '../index.js';
import { UmbDocumentTypeTreeServerDataSource } from './document-type.tree.server.data-source.js';
import { UMB_DOCUMENT_TYPE_TREE_STORE_CONTEXT } from './document-type.tree.store.js';
import { UmbDocumentTypeTreeItemModel, UmbDocumentTypeTreeRootModel } from './types.js';
import { UmbEntityTreeRepositoryBase } from '@umbraco-cms/backoffice/tree';
import { type UmbControllerHost } from '@umbraco-cms/backoffice/controller-api';
import { UmbApi } from '@umbraco-cms/backoffice/extension-api';

export class UmbDocumentTypeTreeRepository
	extends UmbEntityTreeRepositoryBase<UmbDocumentTypeTreeItemModel, UmbDocumentTypeTreeRootModel>
	implements UmbApi
{
	constructor(host: UmbControllerHost) {
		super(host, UmbDocumentTypeTreeServerDataSource, UMB_DOCUMENT_TYPE_TREE_STORE_CONTEXT);
	}

	async requestTreeRoot() {
		const data = {
			id: null,
			type: DOCUMENT_TYPE_ROOT_ENTITY_TYPE,
			name: 'Document Types',
			icon: 'icon-folder',
			hasChildren: true,
		};

		return { data };
	}
}