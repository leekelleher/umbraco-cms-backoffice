import { manifests as extensions } from './extensions/manifests.js';
import { manifests as propertyEditors } from './property-editors/manifests.js';

export const manifests: Array<UmbExtensionManifest> = [...extensions, ...propertyEditors];
