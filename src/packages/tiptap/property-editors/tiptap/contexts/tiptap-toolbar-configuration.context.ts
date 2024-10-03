import type { UmbTiptapToolbarValue } from '../../../extensions/types.js';
import { umbExtensionsRegistry } from '@umbraco-cms/backoffice/extension-registry';
import { UmbArrayState, UmbBooleanState } from '@umbraco-cms/backoffice/observable-api';
import { UmbContextBase } from '@umbraco-cms/backoffice/class-api';
import { UmbContextToken } from '@umbraco-cms/backoffice/context-api';
import { UmbId } from '@umbraco-cms/backoffice/id';
import { UMB_PROPERTY_DATASET_CONTEXT } from '@umbraco-cms/backoffice/property';
import type { UmbControllerHost } from '@umbraco-cms/backoffice/controller-api';

// TODO: [LK] Move this to a shared location.
export type UmbTiptapToolbarExtension = {
	alias: string;
	label: string;
	icon: string;
	dependencies?: Array<string>;
};

// TODO: [LK] Move these to a shared location.
export type UmbTiptapToolbarSortableViewModel<T> = { unique: string; data: T };
export type UmbTiptapToolbarRowViewModel = UmbTiptapToolbarSortableViewModel<Array<UmbTiptapToolbarGroupViewModel>>;
export type UmbTiptapToolbarGroupViewModel = UmbTiptapToolbarSortableViewModel<Array<string>>;

export class UmbTiptapToolbarConfigurationContext extends UmbContextBase<UmbTiptapToolbarConfigurationContext> {
	#extensions = new UmbArrayState<UmbTiptapToolbarExtension>([], (x) => x.alias);
	public readonly extensions = this.#extensions.asObservable();

	// TODO: [LK] Figure out what you're wanting to do with this. Ultimately, I need a way to trigger a reload of the toolbar config.
	#reload = new UmbBooleanState(false);
	public readonly reload = this.#reload.asObservable();

	#extensionsEnabled = new Set<string>();

	#extensionsInUse = new Set<string>();

	#lookup?: Map<string, UmbTiptapToolbarExtension>;

	#toolbar = new UmbArrayState<UmbTiptapToolbarRowViewModel>([], (x) => x.unique);
	public readonly toolbar = this.#toolbar.asObservable();

	constructor(host: UmbControllerHost) {
		super(host, UMB_TIPTAP_TOOLBAR_CONFIGURATION_CONTEXT);

		this.observe(umbExtensionsRegistry.byType('tiptapToolbarExtension'), (extensions) => {
			const _extensions = extensions.map((ext) => ({
				alias: ext.alias,
				label: ext.meta.label,
				icon: ext.meta.icon,
				dependencies: ext.forExtensions,
			}));

			this.#extensions.setValue(_extensions);

			this.#lookup = new Map(_extensions.map((ext) => [ext.alias, ext]));
		});

		this.consumeContext(UMB_PROPERTY_DATASET_CONTEXT, async (dataset) => {
			this.observe(
				await dataset.propertyValueByAlias<Array<string>>('extensions'),
				(extensions) => {
					if (extensions) {
						this.#extensionsEnabled.clear();
						this.#reload.setValue(false);

						this.#extensions
							.getValue()
							.filter((x) => !x.dependencies || x.dependencies.every((z) => extensions.includes(z)))
							.map((x) => x.alias)
							.forEach((alias) => this.#extensionsEnabled.add(alias));

						this.#reload.setValue(true);
					}
				},
				'_observeExtensions',
			);
		});
	}

	public filterExtensions(query: string): Array<UmbTiptapToolbarExtension> {
		return this.#extensions
			.getValue()
			.filter((ext) => ext.alias?.toLowerCase().includes(query) || ext.label?.toLowerCase().includes(query));
	}

	public getExtensionByAlias(alias: string): UmbTiptapToolbarExtension | undefined {
		return this.#lookup?.get(alias);
	}

	public isExtensionEnabled(alias: string): boolean {
		return this.#extensionsEnabled.has(alias);
	}

	public isExtensionInUse(alias: string): boolean {
		return this.#extensionsInUse.has(alias);
	}

	public isValidToolbarValue(value: unknown): value is UmbTiptapToolbarValue {
		if (!Array.isArray(value)) return false;
		for (const row of value) {
			if (!Array.isArray(row)) return false;
			for (const group of row) {
				if (!Array.isArray(group)) return false;
				for (const alias of group) {
					if (typeof alias !== 'string') return false;
				}
			}
		}
		return true;
	}

	public insertToolbarItem(alias: string, toPos: [number, number, number]) {
		const toolbar = [...this.#toolbar.getValue()];
		console.log('insertToolbarItem', toolbar, [alias, toPos]);

		const [rowIndex, groupIndex, itemIndex] = toPos;

		const row = toolbar[rowIndex];
		const rowData = [...row.data];
		const group = rowData[groupIndex];
		const items = [...group.data];

		items.splice(itemIndex, 0, alias);
		this.#extensionsInUse.add(alias);

		rowData[groupIndex] = { unique: group.unique, data: items };
		toolbar[rowIndex] = { unique: row.unique, data: rowData };

		this.#toolbar.setValue(toolbar);
	}

	public insertToolbarGroup(rowIndex: number, groupIndex: number) {
		const toolbar = [...this.#toolbar.getValue()];
		const row = toolbar[rowIndex];
		const groups = [...row.data];
		groups.splice(groupIndex, 0, { unique: UmbId.new(), data: [] });
		toolbar[rowIndex] = { unique: row.unique, data: groups };
		this.#toolbar.setValue(toolbar);
	}

	public insertToolbarRow(rowIndex: number) {
		const toolbar = [...this.#toolbar.getValue()];
		toolbar.splice(rowIndex, 0, { unique: UmbId.new(), data: [{ unique: UmbId.new(), data: [] }] });
		this.#toolbar.setValue(toolbar);
	}

	public removeToolbarItem(from: [number, number, number]) {
		console.log('removeToolbarItem', from);
		// const [rowIndex, groupIndex, itemIndex] = from;

		// const toolbar = [...this.#toolbar.getValue()];

		// const removed = toolbar[rowIndex].data[groupIndex].data.splice(itemIndex, 1);
		// removed.forEach((alias) => this.#extensionsInUse.delete(alias));

		// this.#toolbar.setValue(toolbar);
	}

	public removeToolbarGroup(rowIndex: number, groupIndex: number) {
		const toolbar = [...this.#toolbar.getValue()];

		if (toolbar[rowIndex].data.length > groupIndex) {
			const row = toolbar[rowIndex];
			const groups = [...row.data];
			const removed = groups.splice(groupIndex, 1);
			removed.forEach((group) => group.data.forEach((alias) => this.#extensionsInUse.delete(alias)));
			toolbar[rowIndex] = { unique: row.unique, data: groups };
		}

		// Prevent leaving an empty group
		if (toolbar[rowIndex].data.length === 0) {
			toolbar[rowIndex].data[0] = { unique: UmbId.new(), data: [] };
		}

		this.#toolbar.setValue(toolbar);
	}

	public removeToolbarRow(rowIndex: number) {
		const toolbar = [...this.#toolbar.getValue()];

		if (toolbar.length > rowIndex) {
			const removed = toolbar.splice(rowIndex, 1);
			removed.forEach((row) =>
				row.data.forEach((group) => group.data.forEach((alias) => this.#extensionsInUse.delete(alias))),
			);
		}

		// Prevent leaving an empty row
		if (toolbar.length === 0) {
			toolbar[0] = { unique: UmbId.new(), data: [{ unique: UmbId.new(), data: [] }] };
		}

		this.#toolbar.setValue(toolbar);
	}

	public setToolbar(value?: UmbTiptapToolbarValue | null) {
		if (!this.isValidToolbarValue(value)) {
			value = [[[]]];
		}

		this.#extensionsInUse.clear();
		value.forEach((row) => row.forEach((group) => group.forEach((alias) => this.#extensionsInUse.add(alias))));

		const toolbar = value.map((row) => ({
			unique: UmbId.new(),
			data: row.map((group) => ({ unique: UmbId.new(), data: group })),
		}));

		console.log('set toolbar', [this.isValidToolbarValue(value), value, toolbar, UmbId.new()]);
		this.#toolbar.setValue(toolbar);
	}

	public updateToolbarRow(rowIndex: number, groups: Array<UmbTiptapToolbarGroupViewModel>) {
		console.log('updateToolbarRow', [rowIndex, groups]);
		const toolbar = [...this.#toolbar.getValue()];

		const row = toolbar[rowIndex];
		toolbar[rowIndex] = { unique: row.unique, data: groups };

		this.#toolbar.setValue(toolbar);
	}

	//
	// TODO: [LK] Re-implement the drag-n-drop feature.
	//
}

export const UMB_TIPTAP_TOOLBAR_CONFIGURATION_CONTEXT = new UmbContextToken<UmbTiptapToolbarConfigurationContext>(
	'UmbTiptapToolbarConfigurationContext',
);
