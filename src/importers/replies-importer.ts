/* eslint-disable @typescript-eslint/no-explicit-any */
/** TODO: tighten types when time allows. */

import { ProjectImporter } from '@ds-wizard/plugin-sdk/project-importer'

const KEY_ENTITIES = 'entities'
const KEY_VALUE = 'value'
const KEY_TYPE = 'type'
const KEY_ID = 'id'
const KEY_RAW = 'raw'
const KEYS_VERSION = [
    'metamodelVersion',
    'templateMetamodelVersion',
    'documentTemplateMetamodelVersion',
]

function stringifyPath(path: string[]) {
    return path.join('.')
}

function extractKey(data: any, keys: string[]) {
    for (let i = 0; i < keys.length; i++) {
        if (data[keys[i]]) {
            return data[keys[i]]
        }
    }
    return undefined
}

export default class RepliesImporter {
    protected importer: ProjectImporter
    protected error: string | null
    protected metamodelVersion: number = 0
    protected replies: Record<string, any>
    protected km: Record<string, any>
    protected itemUuids: Map<string, string>

    constructor(importer: ProjectImporter) {
        this.importer = importer
        this.error = null
        this.replies = {}
        this.km = {}
        this.itemUuids = new Map()
    }

    extractReply(path: string[]) {
        return this.replies[stringifyPath(path)]
    }

    importAnswer(phase: number, path: string[], newPath: string[], answerUuid: string) {
        const answer = this.km[KEY_ENTITIES]['answers'][answerUuid]
        if (answer === undefined) {
            return
        }
        answer['followUpUuids'].forEach((questionUuid: string) => {
            this.importQuestion(
                phase,
                [...path, answerUuid],
                [...newPath, answerUuid],
                questionUuid,
            )
        })
    }

    importQuestionList(phase: number, path: string[], newPath: string[], question: any) {
        const reply = this.extractReply(path)
        if (reply !== undefined) {
            const items = reply[KEY_VALUE][KEY_VALUE]
            items.forEach((itemUuid: string) => {
                if (phase === 1) {
                    const createdItemUuid = this.importer.addItem(newPath)
                    this.itemUuids.set(itemUuid, createdItemUuid)
                }

                const newItemUuid = this.itemUuids.get(itemUuid)
                if (newItemUuid) {
                    question['itemTemplateQuestionUuids'].forEach((questionUuid: string) => {
                        this.importQuestion(
                            phase,
                            [...path, itemUuid],
                            [...newPath, newItemUuid],
                            questionUuid,
                        )
                    })
                }
            })
        }
    }

    importQuestionValue(phase: number, path: string[], newPath: string[]) {
        if (phase === 1) {
            const reply = this.extractReply(path)
            if (reply !== undefined) {
                this.importer.setReply(newPath, reply[KEY_VALUE][KEY_VALUE])
            }
        }
    }

    importQuestionIntegration(phase: number, path: string[], newPath: string[]) {
        if (phase === 1) {
            const reply = this.extractReply(path)
            if (reply !== undefined) {
                const integrationReply = reply[KEY_VALUE][KEY_VALUE]
                const replyValue = integrationReply[KEY_VALUE]
                const replyType = integrationReply[KEY_TYPE]
                if (replyType === 'IntegrationType' && this.metamodelVersion >= 17) {
                    const replyRaw = integrationReply[KEY_RAW]
                    this.importer.setIntegrationReply(newPath, replyValue, replyRaw)
                } else if (
                    replyType === 'IntegrationLegacyType' ||
                    (replyType === 'IntegrationType' && this.metamodelVersion < 17)
                ) {
                    const replyId = integrationReply[KEY_ID]
                    this.importer.setIntegrationReplyLegacy(newPath, replyValue, replyId)
                } else {
                    this.importer.setReply(newPath, replyValue)
                }
            }
        }
    }

    importQuestionOptions(phase: number, path: string[], newPath: string[], question: any) {
        if (phase === 1) {
            const reply = this.extractReply(path)
            if (reply !== undefined) {
                this.importer.setReply(newPath, reply[KEY_VALUE][KEY_VALUE])
            }
        }
        question['answerUuids'].forEach((answerUuid: string) => {
            this.importAnswer(phase, path, newPath, answerUuid)
        })
    }

    importQuestionMultiChoice(phase: number, path: string[], newPath: string[]) {
        if (phase === 1) {
            const reply = this.extractReply(path)
            if (reply !== undefined) {
                this.importer.setReply(newPath, reply[KEY_VALUE][KEY_VALUE])
            }
        }
    }

    importQuestionItemSelect(phase: number, path: string[], newPath: string[]) {
        if (phase === 2) {
            const reply = this.extractReply(path)
            if (reply !== undefined) {
                const itemUuid = reply[KEY_VALUE][KEY_VALUE]
                const newItemUuid = this.itemUuids.get(itemUuid)
                if (newItemUuid) {
                    this.importer.setItemSelectReply(newPath, newItemUuid)
                }
            }
        }
    }

    importQuestion(phase: number, path: string[], newPath: string[], questionUuid: string) {
        const question = this.km[KEY_ENTITIES]['questions'][questionUuid]
        if (question === undefined) {
            return
        }
        switch (question['questionType']) {
            case 'OptionsQuestion':
                this.importQuestionOptions(
                    phase,
                    [...path, questionUuid],
                    [...newPath, questionUuid],
                    question,
                )
                break
            case 'ValueQuestion':
                this.importQuestionValue(phase, [...path, questionUuid], [...newPath, questionUuid])
                break
            case 'ListQuestion':
                this.importQuestionList(
                    phase,
                    [...path, questionUuid],
                    [...newPath, questionUuid],
                    question,
                )
                break
            case 'IntegrationQuestion':
                this.importQuestionIntegration(
                    phase,
                    [...path, questionUuid],
                    [...newPath, questionUuid],
                )
                break
            case 'MultiChoiceQuestion':
                this.importQuestionMultiChoice(
                    phase,
                    [...path, questionUuid],
                    [...newPath, questionUuid],
                )
                break
            case 'ItemSelectQuestion':
                this.importQuestionItemSelect(
                    phase,
                    [...path, questionUuid],
                    [...newPath, questionUuid],
                )
                break
        }
    }

    importChapter(phase: number, chapterUuid: string) {
        const chapter = this.km[KEY_ENTITIES]['chapters'][chapterUuid]
        if (chapter === undefined) {
            return
        }
        chapter['questionUuids'].forEach((questionUuid: string) => {
            this.importQuestion(phase, [chapterUuid], [chapterUuid], questionUuid)
        })
    }

    importProject(phase: number) {
        this.km['chapterUuids'].forEach((chapterUuid: string) => {
            this.importChapter(phase, chapterUuid)
        })
    }

    loadData(data: any) {
        try {
            const metamodelVersion = parseFloat(extractKey(data, KEYS_VERSION))
            this.metamodelVersion = metamodelVersion
            if (4 <= metamodelVersion && metamodelVersion < 18.0) {
                if (metamodelVersion >= 14) {
                    this.km = data['knowledgeModel']
                    this.replies = data['questionnaire']['replies']
                } else {
                    this.km = data['knowledgeModel']
                    this.replies = data['questionnaireReplies']
                }

                return true
            }
            this.error = `Unsupported metamodel version: ${metamodelVersion}`
        } catch {
            this.error = 'Unknown metamodel version (wrong JSON file).'
        }
        return false
    }

    import(data: any) {
        if (!this.loadData(data)) {
            throw this.error ? this.error : 'Unsupported data provided.'
        }
        this.importProject(1) // Phase 1: import all and create items
        this.importProject(2) // Phase 2: import item select (new item UUIDs prepared)
    }
}
