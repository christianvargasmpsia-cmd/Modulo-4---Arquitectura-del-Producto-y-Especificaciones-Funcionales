import path from "path";

const ROOT = process.cwd();

export const Paths = Object.freeze({

    ROOT,

    COLLECTIONS: path.join(
        ROOT,
        "collections"
    ),

    REPORTS: path.join(
        ROOT,
        "reports"
    ),

    DOCS: path.join(
        ROOT,
        "docs"
    ),

    GENERATED_TESTS: path.join(
        ROOT,
        "generated-tests"
    ),

    PLAYWRIGHT_RESULTS: path.join(
        ROOT,
        "reports",
        "playwright-results.json"
    ),

    AI_REPORT: path.join(
        ROOT,
        "reports",
        "ai-report.md"
    ),

    HTML_REPORT: path.join(
        ROOT,
        "reports",
        "report.html"
    )

});