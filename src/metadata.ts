import { PluginMetadata } from '@ds-wizard/plugin-sdk/types'

import pkg from '../package.json' with { type: 'json' }

export const pluginMetadata: PluginMetadata = {
    uuid: '6534f8f7-0d43-4c4d-9157-15af17f37649',
    name: 'Replies Importer',
    description: 'Importer for replies in JSON exported from wizard.',
    version: pkg.version,
}
