import { Plugin } from '@ds-wizard/plugin-sdk/types'
import { UserSettingsDataCodec } from './data/user-settings-data'
import { SettingsDataCodec } from './data/settings-data'
import { PluginBuilder } from '@ds-wizard/plugin-sdk/core'
import { pluginMetadata } from './metadata'

export default function (settingsInput: unknown, userSettingsInput: unknown): Plugin {
    // Use settings for plugin initialization or delete
    // If you don't use settings change function arguments to _settingsInput and _userSettingsInput
    const settings = SettingsDataCodec.parseOrInit(settingsInput)
    const userSettings = UserSettingsDataCodec.parseOrInit(userSettingsInput)

    const plugin: Plugin = PluginBuilder.create(
        pluginMetadata,
        SettingsDataCodec,
        UserSettingsDataCodec,
    )
        // Initialize your plugin components here
        .createPlugin()

    return plugin
}
