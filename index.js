import * as core from "@actions/core";
import duration from "duration-js";
import {
  curl,
  upgrade as upgradeCurl,
  isVersion as isCurlVersion,
} from "./curl";

process.on("unhandledRejection", (reason) => {
  if (reason instanceof Error) {
    core.error(reason.stack); // Because Github won't print it otherwise
    core.setFailed(reason);
  } else {
    core.setFailed(`${reason}`);
  }
});

async function run() {
  const urlString = core.getInput("url", { required: true });
  const maxAttemptsString = core.getInput("max-attempts");
  const retryDelay = core.getInput("retry-delay");
  const followRedirect = core.getBooleanInput("follow-redirect");
  const retryAll = core.getBooleanInput("retry-all");
  const cookie = core.getInput("cookie");
  const basicAuth = core.getInput("basic-auth");

  const urls = urlString.split("|");
  const retryDelaySeconds = duration.parse(retryDelay).seconds();
  const maxAttempts = parseInt(maxAttemptsString);

  if (retryAll) {
    const isUpToDate = await isCurlVersion("7.71.0");
    if (!isUpToDate) {
      core.warning(
        "The installed version of curl does not support retry-all-errors. " +
          "It will be upgraded automatically. If you don't want this to happen, you need to either " +
          "upgrade it manually, or turn off retry-all."
      );
      await upgradeCurl();
    }
  }

  for (const url of urls) {
    // We don't need to do it in parallel, we're going to have to
    // wait for all of them anyway
    await curl(url, {
      maxAttempts,
      retryDelaySeconds,
      retryAll,
      followRedirect,
      cookie,
      basicAuth
    });
  }

  core.info("Success");
}

run().catch((e) => {
  core.setFailed(e);
});
