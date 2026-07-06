import { Logger } from "../utils/Logger.js";

class ConsoleReporter {

    print(results, analysis) {

        Logger.title("AI Testing Report");

        Logger.info(`Total Tests : ${results.total}`);
        Logger.info(`Passed      : ${results.passed}`);
        Logger.info(`Failed      : ${results.failed}`);
        Logger.info(`Skipped     : ${results.skipped}`);
        Logger.info(`Duration    : ${results.duration} ms`);

        console.log("");

        if (analysis.failures.length === 0) {

            Logger.success("No failures detected.");

            return;

        }

        Logger.warning("Failures:");

        analysis.failures.forEach((failure, index) => {

            console.log("");

            console.log(`${index + 1}. ${failure.name}`);
            console.log(`Severity : ${failure.severity}`);
            console.log(`Error    : ${failure.error}`);

        });

        console.log("");

        Logger.info("Recommendations:");

        analysis.recommendations.forEach(item => {

            console.log(`• ${item.test}`);
            console.log(`  ${item.recommendation}`);
            console.log("");

        });

    }

}

export default new ConsoleReporter();