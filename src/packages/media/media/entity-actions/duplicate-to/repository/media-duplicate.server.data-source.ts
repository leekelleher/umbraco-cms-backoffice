//import { tryExecuteAndNotify } from '@umbraco-cms/backoffice/resources';
//import { MediaService } from '@umbraco-cms/backoffice/external/backend-api';
import type { UmbControllerHost } from '@umbraco-cms/backoffice/controller-api';
import type { UmbDuplicateToRequestArgs } from '@umbraco-cms/backoffice/tree';

/**
 * Duplicate Media Server Data Source
 * @export
 * @class UmbDuplicateMediaServerDataSource
 */
export class UmbDuplicateMediaServerDataSource {
	#host: UmbControllerHost;

	/**
	 * Creates an instance of UmbDuplicateMediaServerDataSource.
	 * @param {UmbControllerHost} host
	 * @memberof UmbDuplicateMediaServerDataSource
	 */
	constructor(host: UmbControllerHost) {
		this.#host = host;
	}

	/**
	 * Duplicate an item for the given id to the destination unique
	 * @param {UmbDuplicateMediaRequestArgs} args
	 * @return {*}
	 * @memberof UmbDuplicateMediaServerDataSource
	 */
	async duplicateTo(args: UmbDuplicateToRequestArgs) {
		if (!args.unique) throw new Error('Unique is missing');
		if (args.destination.unique === undefined) throw new Error('Destination unique is missing');

		// TODO: [LK] Chat with CMS server team about implementing the `MediaService.postMediaByIdCopy` endpoint.
		console.log('duplicateTo', [this.#host, args]);
		return { error: { message: '' }, data: {} };
		// return tryExecuteAndNotify(
		// 	this.#host,
		// 	MediaService.postMediaByIdCopy({
		// 		id: args.unique,
		// 		requestBody: {
		// 			target: args.destination.unique ? { id: args.destination.unique } : null,
		// 		},
		// 	}),
		// );
	}
}
