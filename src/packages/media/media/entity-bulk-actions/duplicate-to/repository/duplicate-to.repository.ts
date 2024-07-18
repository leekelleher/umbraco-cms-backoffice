import { UmbDuplicateMediaServerDataSource } from '../../../entity-actions/duplicate-to/repository/media-duplicate.server.data-source.js';
import { UmbRepositoryBase } from '@umbraco-cms/backoffice/repository';
import { UMB_NOTIFICATION_CONTEXT } from '@umbraco-cms/backoffice/notification';
import type {
	UmbBulkDuplicateToRepository,
	UmbBulkDuplicateToRequestArgs,
} from '@umbraco-cms/backoffice/entity-bulk-action';
import type { UmbRepositoryErrorResponse } from '@umbraco-cms/backoffice/repository';
import type { UmbControllerHost } from '@umbraco-cms/backoffice/controller-api';

export class UmbBulkDuplicateToMediaRepository extends UmbRepositoryBase implements UmbBulkDuplicateToRepository {
	#duplicateSource = new UmbDuplicateMediaServerDataSource(this);
	#notificationContext?: typeof UMB_NOTIFICATION_CONTEXT.TYPE;

	constructor(host: UmbControllerHost) {
		super(host);

		this.consumeContext(UMB_NOTIFICATION_CONTEXT, (notificationContext) => {
			this.#notificationContext = notificationContext;
		});
	}

	async requestBulkDuplicateTo(args: UmbBulkDuplicateToRequestArgs): Promise<UmbRepositoryErrorResponse> {
		let count = 0;

		const destination = args.destination;
		for (const unique of args.uniques) {
			const { error } = await this.#duplicateSource.duplicateTo({ unique, destination });

			if (error) {
				const notification = { data: { message: error.message } };
				this.#notificationContext?.peek('danger', notification);
			} else {
				count++;
			}
		}

		if (count > 0) {
			const notification = { data: { message: `Duplicated ${count} media ${count === 1 ? 'item' : 'items'}` } };
			this.#notificationContext?.peek('positive', notification);
		}

		return {};
	}
}

export { UmbBulkDuplicateToMediaRepository as api };
