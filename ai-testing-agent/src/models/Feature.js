class Feature {

    constructor({

        id = "",

        title = "",

        description = "",

        userStory = "",

        acceptanceCriteria = [],

        tags = []

    }) {

        this.id = id;

        this.title = title;

        this.description = description;

        this.userStory = userStory;

        this.acceptanceCriteria = acceptanceCriteria;

        this.tags = tags;

    }

}

export default Feature;