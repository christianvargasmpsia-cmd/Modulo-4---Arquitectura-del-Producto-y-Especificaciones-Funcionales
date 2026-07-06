class RecommendationEngine {

    generate(failure) {

        const error = (failure.error || "").toLowerCase();

        if (error.includes("timeout")) {

            return "Increase timeout or verify backend response time.";

        }

        if (error.includes("500")) {

            return "Review the API endpoint and server logs.";

        }

        if (error.includes("network")) {

            return "Check network connectivity and service availability.";

        }

        if (error.includes("assert")) {

            return "Verify the expected values in the test assertions.";

        }

        if (error.includes("locator")) {

            return "Review the Playwright selectors used in the test.";

        }

        return "Review the stack trace and application logs.";

    }

}

export default new RecommendationEngine();