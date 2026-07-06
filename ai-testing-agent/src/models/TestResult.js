class TestResult {

    constructor({

        id = "",

        title = "",

        status = "passed",

        duration = 0,

        error = "",

        file = ""

    }) {

        this.id = id;

        this.title = title;

        this.status = status;

        this.duration = duration;

        this.error = error;

        this.file = file;

    }

}

export default TestResult;