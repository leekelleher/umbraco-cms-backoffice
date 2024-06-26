import { UMB_MEDIA_DETAIL_REPOSITORY_ALIAS, UMB_MEDIA_ITEM_REPOSITORY_ALIAS } from '../repository/index.js';
import { UMB_MEDIA_ENTITY_TYPE } from '../entity.js';
import { manifests as createManifests } from './create/manifests.js';
import { manifests as moveManifests } from './move-to/manifests.js';
import type { ManifestTypes } from '@umbraco-cms/backoffice/extension-registry';

const entityActions: Array<ManifestTypes> = [
	...createManifests,
	{
		type: 'entityAction',
		alias: 'Umb.EntityAction.Media.Delete',
		name: 'Delete Media Entity Action ',
		kind: 'delete',
		forEntityTypes: [UMB_MEDIA_ENTITY_TYPE],
		meta: {
			itemRepositoryAlias: UMB_MEDIA_ITEM_REPOSITORY_ALIAS,
			detailRepositoryAlias: UMB_MEDIA_DETAIL_REPOSITORY_ALIAS,
		},
	},
];

export const manifests: Array<ManifestTypes> = [...entityActions, ...moveManifests];
