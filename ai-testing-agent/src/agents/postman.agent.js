import getWorkspacesSkill from "../skills/getWorkspaces.skill.js";
import getCollectionsSkill from "../skills/getCollections.skill.js";
import runCollectionSkill from "../skills/runCollection.skill.js";

class PostmanAgent {

    async start() {

        console.clear();

        console.log("=================================");
        console.log("UMSS Market AI Testing Agent");
        console.log("=================================\n");

        // Obtener Workspaces
        const workspaces = await getWorkspacesSkill.execute();

        console.log("Workspaces:\n");

        workspaces.forEach((workspace, index) => {

            console.log(`${index + 1}. ${workspace.name}`);

        });

        // Buscar Workspace UMSS Market
        const workspace = workspaces.find(
            w => w.name === "UMSS Market"
        );

        if (!workspace) {

            console.log("\nWorkspace UMSS Market no encontrado.");

            return;

        }

        console.log("\nWorkspace seleccionado:");

        console.log(workspace.name);

        // Obtener Collections
        const collections = await getCollectionsSkill.execute(
            workspace.id
        );

        console.log("\nCollections encontradas:\n");

        collections.forEach((collection, index) => {

            console.log(`${index + 1}. ${collection.name}`);

        });

        console.log("\n=================================");
        console.log("Ejecutando pruebas...");
        console.log("=================================\n");

        // Ejecutar Newman
        await runCollectionSkill.execute();

        console.log("\n=================================");
        console.log("Proceso finalizado");
        console.log("=================================\n");

    }

}

export default new PostmanAgent();