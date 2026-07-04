import newmanService from "../services/newman.service.js";

class RunCollectionSkill {

    async execute() {

        console.log("=================================");
        console.log("Skill: Ejecutar Newman");
        console.log("=================================\n");

        const result = await newmanService.runCollection();

        console.log("\nResultado:");

        console.log(`Requests   : ${result.requests}`);
        console.log(`Assertions : ${result.assertions}`);
        console.log(`Failed     : ${result.failed}`);

        return result;

    }

}

export default new RunCollectionSkill();