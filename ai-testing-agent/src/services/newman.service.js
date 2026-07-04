import newman from "newman";
import path from "path";
import { fileURLToPath } from "url";

class NewmanService {

    constructor() {
        const __filename = fileURLToPath(import.meta.url);
        const __dirname = path.dirname(__filename);

        // Ruta absoluta al proyecto ai-testing-agent
        this.projectRoot = path.resolve(__dirname, "../../");
    }

    async runCollection() {

       const collectionPath = path.join(
    this.projectRoot,
    "collections",
    "openapi-collection.json"
);
        const reportsPath = path.join(
            this.projectRoot,
            "reports"
        );

        return new Promise((resolve, reject) => {

            newman.run(
                {
                    collection: collectionPath,

                    reporters: [
                        "cli",
                        "json"
                    ],

                    reporter: {
                        json: {
                            export: path.join(
                                reportsPath,
                                "newman-report.json"
                            )
                        }
                    }

                },

                (error, summary) => {

                    if (error) {
                        return reject(error);
                    }

                    resolve({
                        requests: summary.run.stats.requests.total,
                        assertions: summary.run.stats.assertions.total,
                        failed: summary.run.failures.length,
                        summary
                    });

                }

            );

        });

    }

}

export default new NewmanService();