import postmanService from "../services/postman.service.js";

class GetCollectionsSkill {

    async execute(workspaceId) {

        console.log("=================================");
        console.log("Skill: Obtener Collections");
        console.log("=================================\n");

        return await postmanService.getCollections(workspaceId);

    }

}

export default new GetCollectionsSkill();