export const manifests: Array<UmbExtensionManifest> = [
	{
		type: 'globalContext',
		alias: 'Umb.GlobalContext.Broadcast',
		name: 'Broadcast Context',
		api: () => import('./broadcast.context.js'),
	},
];
