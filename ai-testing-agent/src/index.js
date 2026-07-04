import postmanAgent from "./agents/postman.agent.js";

postmanAgent.start().catch(error => {

    console.error("\nError:");

    if (error.response) {
        console.error(error.response.data);
    } else {
        console.error(error.message);
    }

});