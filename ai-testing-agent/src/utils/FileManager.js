import fs from "fs";
import path from "path";

export class FileManager {

    static ensureDirectory(directory) {

        if (!fs.existsSync(directory)) {

            fs.mkdirSync(directory, {
                recursive: true
            });

        }

    }

    static exists(file) {

        return fs.existsSync(file);

    }

    static read(file) {

        return fs.readFileSync(
            file,
            "utf8"
        );

    }

    static readJson(file) {

        return JSON.parse(

            fs.readFileSync(
                file,
                "utf8"
            )

        );

    }

    static write(file, content) {

        this.ensureDirectory(
            path.dirname(file)
        );

        fs.writeFileSync(
            file,
            content,
            "utf8"
        );

    }

    static writeJson(file, object) {

        this.ensureDirectory(
            path.dirname(file)
        );

        fs.writeFileSync(

            file,

            JSON.stringify(
                object,
                null,
                2
            ),

            "utf8"

        );

    }

    static delete(file) {

        if (fs.existsSync(file)) {

            fs.unlinkSync(file);

        }

    }

}