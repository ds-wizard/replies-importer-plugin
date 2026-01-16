import { ProjectImporterComponentProps } from '@ds-wizard/plugin-sdk/elements'
import { ProjectImporter } from '@ds-wizard/plugin-sdk/project-importer'
import { ChangeEvent, useState } from 'react'

import RepliesImporter from '../importers/replies-importer'

export default function RepliesImporterComponent({
    onImport,
}: ProjectImporterComponentProps<null, null>) {
    const [error, setError] = useState<string | null>(null)

    const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0]
        if (!file) return

        const reader = new FileReader()
        reader.onload = (e) => {
            try {
                const content = e.target?.result
                if (typeof content !== 'string') {
                    throw new Error('File content is not a string')
                }

                const json = JSON.parse(content)
                const importer = new ProjectImporter()
                const repliesImporter = new RepliesImporter(importer)

                repliesImporter.import(json)

                setError(null)
                onImport(importer.getEvents())
            } catch (error) {
                if (typeof error === 'string') {
                    setError(error)
                } else {
                    setError(
                        'Error reading or parsing file. Make sure you selected a valid JSON document.',
                    )
                }
            }
        }
        reader.readAsText(file)
    }

    return (
        <div className="col col-detail mx-auto">
            <div>
                <div className="mb-3">
                    <h2>Replies Importer</h2>
                </div>
                <div className="mb-3">
                    {error && (
                        <div className="alert alert-danger" role="alert" id="error-alert">
                            {error}
                        </div>
                    )}
                    <div className="form-group">
                        <label htmlFor="file-input" className="form-label">
                            Select a file with replies in JSON:
                        </label>
                        <input
                            type="file"
                            id="file-input"
                            accept="application/json"
                            className={`form-control${error ? ' is-invalid' : ''}`}
                            onChange={handleFileChange}
                        />
                    </div>
                    <p className="mt-2 text-muted">
                        To obtain the file for import, go to your source project, create a JSON
                        document using <em>Questionnaire Report</em> template, and download it.
                    </p>
                    <p className="mt-2 text-muted">
                        Please note that file replies will not be imported (as file contents are not
                        part of the JSON replies export).
                    </p>
                </div>
            </div>
        </div>
    )
}
