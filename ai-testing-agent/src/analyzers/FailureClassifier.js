class FailureClassifier {

    classify(test) {

        const error = (test.error || "").toLowerCase();

        if (error.includes("timeout")) {

            return "HIGH";

        }

        if (error.includes("500")) {

            return "CRITICAL";

        }

        if (error.includes("network")) {

            return "HIGH";

        }

        if (error.includes("assert")) {

            return "MEDIUM";

        }

        if (error.includes("locator")) {

            return "LOW";

        }

        return "MEDIUM";

    }

}

export default new FailureClassifier();