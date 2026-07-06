import fs from "fs";
import path from "path";

import { Paths } from "../constants/Paths.js";
import { Logger } from "../utils/Logger.js";

class SpecWriter {

    async save(feature, code) {

        if (!fs.existsSync(Paths.GENERATED_TESTS)) {

            fs.mkdirSync(Paths.GENERATED_TESTS, {

                recursive: true

            });

        }

        const fileName =

            feature.title

                .toLowerCase()

                .replace(/\s+/g, "-")

                .replace(/[^a-z0-9-]/g, "") +

            ".spec.js";

        const filePath = path.join(

            Paths.GENERATED_TESTS,

            fileName

        );

        fs.writeFileSync(

            filePath,

            code,

            "utf8"

        );

        Logger.success(`Spec saved: ${fileName}`);

        return filePath;

    }

}

export default new SpecWriter();