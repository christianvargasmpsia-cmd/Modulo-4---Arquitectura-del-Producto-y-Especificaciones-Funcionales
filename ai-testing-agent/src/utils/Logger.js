export class Logger {

    static line() {

        console.log("--------------------------------------------------");

    }

    static info(message) {

        console.log(`ℹ️  ${message}`);

    }

    static success(message) {

        console.log(`✅ ${message}`);

    }

    static warning(message) {

        console.log(`⚠️  ${message}`);

    }

    static error(message) {

        console.error(`❌ ${message}`);

    }

    static title(message) {

        console.log("\n");
        console.log("==================================================");
        console.log(`🚀 ${message}`);
        console.log("==================================================");

    }

}