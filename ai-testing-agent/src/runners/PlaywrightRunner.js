import { exec } from "child_process";
import { promisify } from "util";
import path from "path";
import RunnerResult from "./RunnerResult.js";
import { Logger } from "../utils/Logger.js";

const execute = promisify(exec);

class PlaywrightRunner {

    async run(specFile = null) {

        Logger.title("Playwright Runner");

        try {

            let command = "npx playwright test";

            if (specFile) {

    const relativePath = path
        .relative(process.cwd(), specFile)
        .replace(/\\/g, "/");

    command += ` ${relativePath}`;

}

            command += " --reporter=json";

            Logger.info(`Executing: ${command}`);

            const { stdout, stderr } = await execute(command);

            if (stderr && stderr.trim() !== "") {

                console.log("\n========== PLAYWRIGHT STDERR ==========\n");
                console.log(stderr);
                console.log("\n=======================================\n");

            }

            Logger.success("Execution finished.");

            return this.parse(stdout);

        }
        catch (error) {

            Logger.error("Playwright execution failed.");

            console.log("\n========== PLAYWRIGHT ERROR ==========\n");

            console.log("Message:");
            console.log(error.message);

            if (error.stdout) {

                console.log("\nSTDOUT:\n");
                console.log(error.stdout);

            }

            if (error.stderr) {

                console.log("\nSTDERR:\n");
                console.log(error.stderr);

            }

            console.log("\n======================================\n");

            throw error;

        }

    }

    parse(jsonOutput) {

        const report = new RunnerResult();

        if (!jsonOutput) {

            return report;

        }

        try {

            const data = JSON.parse(jsonOutput);

            report.duration = data.duration || 0;

            if (data.suites) {

                this.processSuites(data.suites, report);

            }

        }
        catch (error) {

            Logger.warning("Unable to parse Playwright JSON output.");

        }

        return report;

    }

    processSuites(suites, report) {

        for (const suite of suites) {

            if (suite.specs) {

                for (const spec of suite.specs) {

                    for (const test of spec.tests) {

                        const result = test.results?.[0] || {};

                        report.total++;

                        switch (result.status) {

                            case "passed":

                                report.passed++;
                                break;

                            case "failed":

                                report.failed++;
                                break;

                            default:

                                report.skipped++;

                        }

                        report.tests.push({

                            id: report.total,

                            title: test.title,

                            status: result.status || "unknown",

                            duration: result.duration || 0,

                            error: result.error?.message || "",

                            file: spec.file || ""

                        });

                    }

                }

            }

            if (suite.suites) {

                this.processSuites(

                    suite.suites,

                    report

                );

            }

        }

    }

}

export default new PlaywrightRunner();