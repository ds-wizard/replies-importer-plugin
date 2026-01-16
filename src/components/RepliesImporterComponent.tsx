import { ProjectImporterComponentProps } from '@ds-wizard/plugin-sdk/elements'
import { SimpleImporter } from '@ds-wizard/plugin-sdk/ui/SimpleImporter'

import RepliesImporter from '../importers/replies-importer'

export default function RepliesImporterComponent({
    onImport,
}: ProjectImporterComponentProps<null, null>) {
    return (
        <SimpleImporter
            onImport={onImport}
            heading="Replies Importer"
            label="Select a file with replies in JSON"
            description={
                <>
                    <p>
                        To obtain the file for import, go to your source project, create a JSON
                        document using <em>Questionnaire Report</em> template, and download it.
                    </p>
                    <p>
                        Please note that file replies will not be imported (as file contents are not
                        part of the JSON replies export).
                    </p>
                </>
            }
            importData={(importer, json, _km) => {
                const repliesImporter = new RepliesImporter(importer)
                repliesImporter.import(json)
            }}
        />
    )
}
