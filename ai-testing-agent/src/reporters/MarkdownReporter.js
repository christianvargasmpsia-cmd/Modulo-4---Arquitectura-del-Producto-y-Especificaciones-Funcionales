import { FileManager } from "../utils/FileManager.js";
import { Paths } from "../constants/Paths.js";

class MarkdownReporter {

    async generate(results, analysis) {

        let markdown = `# AI Testing Report

## Summary

| Metric | Value |
|--------|------:|
| Total | ${results.total} |
| Passed | ${results.passed} |
| Failed | ${results.failed} |
| Skipped | ${results.skipped} |
| Duration | ${results.duration} ms |

---

## Failed Tests
`;

        if (analysis.failures.length === 0) {

            markdown += "\nNo failures detected.\n";

        }

        else {

            analysis.failures.forEach(failure => {

                markdown += `
### ${failure.name}

- Severity: ${failure.severity}
- Error: ${failure.error}

`;

            });

        }

        markdown += `

---

## Recommendations

`;

        analysis.recommendations.forEach(item => {

            markdown += `- **${item.test}**

${item.recommendation}

`;

        });

        FileManager.write(

            Paths.AI_REPORT,

            markdown

        );

    }

}

export default new MarkdownReporter();