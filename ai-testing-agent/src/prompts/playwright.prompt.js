class PlaywrightPrompt {

    build(feature) {

        return `
You are a Senior QA Automation Engineer with expertise in Playwright.

Your task is to generate a COMPLETE Playwright test.

Requirements:

- Return ONLY JavaScript code.
- Do NOT use markdown.
- Do NOT explain the code.
- Use Playwright Test.
- Follow Playwright best practices.
- Add meaningful test names.
- Use expect() assertions.
- Wait correctly for elements.
- Generate clean, readable code.

Feature

Title:
${feature.title}

Description:
${feature.description}

User Story:
${feature.userStory}

Acceptance Criteria:

${feature.acceptanceCriteria
    .map(item => `- ${item}`)
    .join("\n")}

Generate ONLY the Playwright code.
`;

    }

}

export default new PlaywrightPrompt();