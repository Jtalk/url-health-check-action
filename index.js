const core = require("@actions/core");
const proc = require("child_process");
const duration = require("duration-js");

const processConfig = {
    stdio: "inherit",
    encoding: "utf8",
};

function curl(url, { maxAttempts, retryDelaySeconds }) {
    let retrySettings = "";
    if (maxAttempts > 1) {
        retrySettings = `--retry ${maxAttempts} --retry-delay ${retryDelaySeconds}`;
    }
    core.info(`Checking ${url}`);
    let out = proc.execSync(`curl --fail -sv ${url} ${retrySettings}`, processConfig);
    core.info(out);
}

try {
    let url = core.getInput("url", {required: true});
    let maxAttemptsString = core.getInput("max-attempts");
    let retryDelay = core.getInput("retry-delay");

    let retryDelaySeconds = duration.parse(retryDelay).seconds();
    let maxAttempts = parseInt(maxAttemptsString);

    curl(url, {maxAttempts, retryDelaySeconds});

    core.info("Success")
} catch (e) {
    console.error("Error running action", e);
    core.setFailed(e.message);
}
