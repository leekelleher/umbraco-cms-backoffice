import { UmbDocumentTypeTreeRepository } from '../../document-type-tree.repository.js';
import type { UmbCollectionFilterModel, UmbCollectionRepository } from '@umbraco-cms/backoffice/collection';
import { UmbRepositoryBase } from '@umbraco-cms/backoffice/repository';
import type { UmbControllerHost } from '@umbraco-cms/backoffice/controller-api';
import { UMB_ENTITY_CONTEXT, type UmbEntityModel } from '@umbraco-cms/backoffice/entity';

export class UmbDocumentTypeFolderCollectionRepository extends UmbRepositoryBase implements UmbCollectionRepository {
	#treeRepository = new UmbDocumentTypeTreeRepository(this);

	constructor(host: UmbControllerHost) {
		super(host);

		this.consumeContext(UMB_ENTITY_CONTEXT, (entityContext) => {
			console.log(entityContext);
		});
	}

	async requestCollection(filter: UmbCollectionFilterModel) {
		const entityContext = await this.getContext(UMB_ENTITY_CONTEXT);
		if (!entityContext) throw new Error('Entity context not found');

		const entityType = entityContext.getEntityType();
		const unique = entityContext.getUnique();

		if (!entityType) throw new Error('Entity type not found');
		if (unique === undefined) throw new Error('Unique not found');

		const parent: UmbEntityModel = { entityType, unique };

		if (parent.unique === null) {
			return this.#treeRepository.requestTreeRootItems({ skip: filter.skip, take: filter.take });
		} else {
			return this.#treeRepository.requestTreeItemsOf({ parent, skip: filter.skip, take: filter.take });
		}
	}

	override destroy(): void {
		this.#treeRepository.destroy();
		super.destroy();
	}
}

export { UmbDocumentTypeFolderCollectionRepository as api };
