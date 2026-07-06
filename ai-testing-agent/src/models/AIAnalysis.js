class AIAnalysis {

    constructor({

        summary = "",

        rootCause = "",

        severity = "LOW",

        recommendation = "",

        nextAction = ""

    }) {

        this.summary = summary;

        this.rootCause = rootCause;

        this.severity = severity;

        this.recommendation = recommendation;

        this.nextAction = nextAction;

    }

}

export default AIAnalysis;