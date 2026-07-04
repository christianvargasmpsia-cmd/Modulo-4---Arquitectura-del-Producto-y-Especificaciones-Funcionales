import postmanService from "../services/postman.service.js";

class GetWorkspacesSkill {

    async execute() {

        console.log("=================================");
        console.log("Skill: Obtener Workspaces");
        console.log("=================================\n");

        return await postmanService.getWorkspaces();

    }

}

export default new GetWorkspacesSkill();