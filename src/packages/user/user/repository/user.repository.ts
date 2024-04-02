import { UmbUserMfaServerDataSource } from './sources/user-mfa.server.data-source.js';
import { UmbUserSetGroupsServerDataSource } from './sources/user-set-group.server.data-source.js';
import { UmbUserRepositoryBase } from './user-repository-base.js';
import { of } from '@umbraco-cms/backoffice/external/rxjs';
import { UmbLocalizationController } from '@umbraco-cms/backoffice/localization-api';

export class UmbUserRepository extends UmbUserRepositoryBase {
	#setUserGroupsSource = new UmbUserSetGroupsServerDataSource(this._host);
	#userMfaSource = new UmbUserMfaServerDataSource(this._host);

	async setUserGroups(userIds: Array<string>, userGroupIds: Array<string>) {
		if (userGroupIds.length === 0) throw new Error('User group ids are missing');
		if (userIds.length === 0) throw new Error('User ids are missing');

		const { error } = await this.#setUserGroupsSource.setGroups(userIds, userGroupIds);

		if (!error) {
			//TODO: Update relevant stores
		}

		return { error };
	}

	/**
	 * Request the MFA providers for a user
	 * @param unique The unique id of the user
	 * @memberof UmbUserRepository
	 */
	async requestMfaProviders(unique: string) {
		const { data, error } = await this.#userMfaSource.requestMfaProviders(unique);
		return { data, error, asObservable: () => of(data ?? []) };
	}

	/**
	 * Disables a MFA provider for a user
	 * @param unique The unique id of the user
	 * @param providerName The name of the provider
	 * @memberof UmbUserRepository
	 */
	async disableMfaProvider(unique: string, providerName: string) {
		const { data, error } = await this.#userMfaSource.disableMfaProvider(unique, providerName);

		const localize = new UmbLocalizationController(this._host);

		if (!error) {
			const notification = { data: { message: localize.term('user_2faProviderIsDisabledMsg') } };
			this.notificationContext?.peek('positive', notification);
		} else {
			const notification = { data: { message: localize.term('user_2faProviderIsNotDisabledMsg') } };
			this.notificationContext?.peek('warning', notification);
		}

		return { data, error };
	}
}
