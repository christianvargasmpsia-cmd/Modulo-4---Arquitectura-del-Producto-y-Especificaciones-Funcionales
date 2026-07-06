import { Logger } from "../utils/Logger.js";

import PlaywrightGenerator from "../generators/PlaywrightGenerator.js";

import PlaywrightRunner from "../runners/PlaywrightRunner.js";

import ResultAnalyzer from "../analyzers/ResultAnalyzer.js";

import HtmlReporter from "../reporters/HtmlReporter.js";

import MarkdownReporter from "../reporters/MarkdownReporter.js";

import ConsoleReporter from "../reporters/ConsoleReporter.js";

class AITestingAgent {

    async execute(feature) {

        try {

            Logger.title("AI Testing Agent");

            Logger.info("Step 1 - Generating Playwright tests...");

            const spec = await PlaywrightGenerator.generate(feature);

            Logger.success("Tests generated.");

            Logger.info("Step 2 - Executing Playwright...");

            const results = await PlaywrightRunner.run(spec);

            Logger.success("Execution completed.");

            Logger.info("Step 3 - Analyzing results...");

            const analysis = await ResultAnalyzer.analyze(results);

            Logger.success("Analysis completed.");

            Logger.info("Step 4 - Generating reports...");

            await HtmlReporter.generate(results, analysis);

            await MarkdownReporter.generate(results, analysis);

            ConsoleReporter.print(results, analysis);

            Logger.success("Reports generated.");

            return {

                success: true,

                results,

                analysis

            };

        }

        catch (error) {

            Logger.error(error.message);

            return {

                success: false,

                error: error.message

            };

        }

    }

}

export default new AITestingAgent();