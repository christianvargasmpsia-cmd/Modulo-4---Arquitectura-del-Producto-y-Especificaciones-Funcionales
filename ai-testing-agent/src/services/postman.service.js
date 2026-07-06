import axios from "axios";
import postmanConfig from "../config/postman.js";

class PostmanService {

    constructor() {
        this.client = axios.create({
            baseURL: postmanConfig.baseUrl,
            headers: {
                "X-Api-Key": postmanConfig.apiKey
            }
        });
    }

    async getWorkspaces() {

        const response = await this.client.get("/workspaces");

        return response.data.workspaces;
    }
async getCollections(workspaceId) {

    const response = await this.client.get(
        `/collections?workspace=${workspaceId}`
    );

    return response.data.collections;

}
}

export default new PostmanService();