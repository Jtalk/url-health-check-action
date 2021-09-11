import * as core from "@actions/core";
import { exec, getExecOutput } from "@actions/exec";
import * as path from "path";
import * as os from "os";
import * as semver from "semver";

export async function curl(
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

  options.push(url);

  core.info(`Checking ${url}`);
  core.debug(`Command: curl ${options.join(" ")}`);

  return exec("curl", options);
}

export async function isVersion(atLeast) {
  const curlVersionOutput = await getExecOutput("curl --version");
  const rawVersion = curlVersionOutput.stdout.match(/curl (\d+\.\d+\.\d+)/)[1];
  const installed = semver.clean(rawVersion);
  return semver.gte(installed, atLeast);
}

export async function upgrade() {
  const binDir = path.join(os.homedir(), ".bin");
  const curlPath = path.join(binDir, "curl");

  // This is the link from https://curl.se/download.html
  const curlUrl = `https://github.com/moparisthebest/static-curl/releases/download/v7.78.0/curl-amd64`;
  await exec("mkdir", ["-p", binDir]);
  await exec("wget", ["-O", curlPath, curlUrl]);
  await exec("chmod", ["+x", curlPath]);

  core.addPath(binDir);

  return curlPath;
}
