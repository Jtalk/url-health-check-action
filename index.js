const core = require("@actions/core");
const proc = require("child_process");
const duration = require("duration-js");

function asBoolean(str) {
    return str && ["yes", "true", "y", "1"].includes(str);
}

const processConfig = {
    stdio: "inherit",
    encoding: "utf8",
};

function curl(url, { maxAttempts, retryDelaySeconds, retryAll, followRedirect }) {
    let retrySettings = "";
    if (maxAttempts > 1) {
        retrySettings = `--retry ${maxAttempts} --retry-delay ${retryDelaySeconds} --retry-connrefused`;
    }
    let redirectSettings = followRedirect ? '-L' : '';
    let retryAllSettings = retryAll ? '--retry-all-errors' : '';

    core.info(`Checking ${url}`);
    let command = `curl --fail -sv ${redirectSettings} ${url} ${retrySettings} ${retryAllSettings}`;
    core.debug("Command: " + command);

    let out = proc.execSync(command, processConfig);

    core.info(out);
}

try {
    let urlString = core.getInput("url", {required: true});
    let maxAttemptsString = core.getInput("max-attempts");
    let retryDelay = core.getInput("retry-delay");
    let followRedirectString = core.getInput("follow-redirect");
    let retryAllString = core.getInput("retry-all");

    let urls = urlString.split("|");
    let retryDelaySeconds = duration.parse(retryDelay).seconds();
    let maxAttempts = parseInt(maxAttemptsString);
    let followRedirect = asBoolean(followRedirectString);
    let retryAll = asBoolean(retryAllString);

    urls.forEach(url => {
        curl(url, {maxAttempts, retryDelaySeconds, retryAll, followRedirect})
    });

    core.info("Success");
} catch (e) {
    console.error("Error running action", e);
    core.setFailed(e.message);
}
