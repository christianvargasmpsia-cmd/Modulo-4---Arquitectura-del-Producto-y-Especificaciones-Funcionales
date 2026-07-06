import readline from "readline";

import postmanAgent from "./agents/postman.agent.js";
import aiTestingAgent from "./agents/AITestingAgent.js";

const rl = readline.createInterface({

    input: process.stdin,

    output: process.stdout

});

console.clear();

console.log("=================================");
console.log("UMSS MARKET AI TESTING AGENT");
console.log("=================================\n");

console.log("1. Postman Agent");
console.log("2. Playwright AI Testing Agent");
console.log("0. Exit\n");

rl.question("Select option: ", async option => {

    try {

        switch (option) {

            case "1":

                await postmanAgent.start();

                break;

            case "2":

                await aiTestingAgent.execute({

                    id: "1",

                    title: "Login",

                    description:
                        "User logs into the application.",

                    userStory:
                        "As a user I want to log in so I can access my account.",

                    acceptanceCriteria: [

                        "User enters email",

                        "User enters password",

                        "Dashboard is displayed"

                    ]

                });

                break;

            default:

                console.log("Bye.");

        }

    }

    catch (error) {

        console.error(error);

    }

    finally {

        rl.close();

    }

});