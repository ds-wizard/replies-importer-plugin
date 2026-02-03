import { PluginBuilder } from '@ds-wizard/plugin-sdk/core'
import { Plugin } from '@ds-wizard/plugin-sdk/types'

import RepliesImporterComponent from './components/RepliesImporterComponent'
import { pluginMetadata } from './metadata'

export default function (_settingsInput: unknown, _userSettingsInput: unknown): Plugin {
    const plugin: Plugin = PluginBuilder.createWithNoSettings(pluginMetadata)
        .addProjectImporter(
            'Replies',
            'replies-importer',
            'x-replies-importer',
            RepliesImporterComponent,
        )
        .createPlugin()

    return plugin
}
