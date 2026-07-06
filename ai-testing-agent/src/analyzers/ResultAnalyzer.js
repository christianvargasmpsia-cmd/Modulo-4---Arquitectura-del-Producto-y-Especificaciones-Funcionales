import FailureClassifier from "./FailureClassifier.js";
import RecommendationEngine from "./RecommendationEngine.js";

class ResultAnalyzer {

    async analyze(results) {

        const failedTests = results.tests.filter(

            test => test.status === "failed"

        );

        const failures = failedTests.map(test => ({

            name: test.title,

            file: test.file,

            error: test.error,

            severity: FailureClassifier.classify(test)

        }));

        const recommendations = failures.map(failure => ({

            test: failure.name,

            recommendation:
                RecommendationEngine.generate(failure)

        }));

        return {

            summary: {

                total: results.total,

                passed: results.passed,

                failed: results.failed,

                skipped: results.skipped,

                duration: results.duration

            },

            failures,

            recommendations

        };

    }

}

export default new ResultAnalyzer();