import * as core from "@actions/core";
import duration from "duration-js";
import {
  curl,
  upgrade as upgradeCurl,
  isVersion as isCurlVersion,
} from "./curl";

function isLinux() {
  return process.platform === "linux";
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

  if (retryAll) {
    const isUpToDate = await isCurlVersion("7.71.0");
    if (!isUpToDate) {
      // This is an outdated version of curl that doesn't support retry-all-errors
      if (isLinux()) {
        // We know how to upgrade it on Linux
        core.warning(
          "The installed version of curl does not support retry-all-errors. " +
            "It will be upgraded automatically. If you don't want this to happen, either " +
            "upgrade it manually, or turn off retry-all."
        );
        await upgradeCurl();
      } else {
        // MacOS should already have the up to date version, not sure about windows...
        core.error(
          "Curl version is outdated and does not support --retry-all-errors. " +
            "We only support curl upgrade on Ubuntu. " +
            "You could try upgrading your runner/curl manually, or raise an issue in this plugin's repository."
        );
        throw Error("Curl version does not support --retry-all-errors");
      }
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
    });
  }

  core.info("Success");
}

run().catch((e) => {
  core.setFailed(e.message);
});
