import axios from "axios";
import postmanConfig from "../config/postman.js";

class PostmanService {

    constructor() {

        this.client = axios.create({
            baseURL: postmanConfig.baseUrl,
            headers: {
                "X-Api-Key": postmanConfig.apiKey,
                "Content-Type": "application/json"
            }
        });

    }


    // ==========================================================
    // OBTENER WORKSPACES
    // ==========================================================

    async getWorkspaces() {

        const response =
            await this.client.get("/workspaces");

        return response.data.workspaces;

    }


    // ==========================================================
    // OBTENER COLLECTIONS
    // ==========================================================

    async getCollections(workspaceId) {

        const response =
            await this.client.get(
                `/collections?workspace=${workspaceId}`
            );

        return response.data.collections;

    }


    // ==========================================================
    // OBTENER COLLECTION COMPLETA
    // ==========================================================

    async getCollection(collectionUid) {

        const response =
            await this.client.get(
                `/collections/${collectionUid}`
            );

        return response.data.collection;

    }


    // ==========================================================
    // ACTUALIZAR COLLECTION
    // ==========================================================

    async updateCollection(collectionUid, collection) {

        const response =
            await this.client.put(
                `/collections/${collectionUid}`,
                {
                    collection
                }
            );

        return response.data;

    }

}


export default new PostmanService();