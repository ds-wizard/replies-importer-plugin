import { Plugin } from '@ds-wizard/plugin-sdk/types'
import { PluginBuilder } from '@ds-wizard/plugin-sdk/core'
import { pluginMetadata } from './metadata'
import RepliesImporterComponent from './components/RepliesImporterComponent'

export default function (_settingsInput: unknown, _userSettingsInput: unknown): Plugin {
    const plugin: Plugin = PluginBuilder.createWithNoSettings(pluginMetadata)
        .addProjectImporter(
            'Replies Importer',
            'replies-importer',
            'x-replies-importer',
            RepliesImporterComponent,
        )
        .createPlugin()

    return plugin
}
