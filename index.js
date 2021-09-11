const core = require("@actions/core");
const exec = require("@actions/exec");
const duration = require("duration-js");

async function curl(
  url,
  { maxAttempts, retryDelaySeconds, retryAll, followRedirect }
) {
  const options = ["--fail", "-sv"];
  if (maxAttempts > 1) {
    options.push(
      "--retry",
      maxAttempts,
      "--retry-delay",
      retryDelaySeconds,
      "--retry-connrefused"
    );
  }
  if (followRedirect) {
    options.push("-L");
  }
  if (retryAll) {
    options.push("--retry-all-errors");
  }

  core.info(`Checking ${url}`);
  core.debug(`Command: curl ${options.join(" ")}`);

  return exec.exec("curl", options);
}

async function run() {
  const urlString = core.getInput("url", { required: true });
  const maxAttemptsString = core.getInput("max-attempts");
  const retryDelay = core.getInput("retry-delay");
  const followRedirect = core.getBooleanInput("follow-redirect");
  const retryAll = core.getBooleanInput("retry-all");

  const urls = urlString.split("|");
  const retryDelaySeconds = duration.parse(retryDelay).seconds();
  const maxAttempts = parseInt(maxAttemptsString);

  for (const url of urls) {
    // We don't need to do it in parallel, we're going to have to
    // wait for all of them anyway
    await curl(url, {
      maxAttempts,
      retryDelaySeconds,
      retryAll,
      followRedirect,
    });
  }

  core.info("Success");
}

run().catch((e) => {
  core.setFailed(e.message);
});
