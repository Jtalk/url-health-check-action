import * as core from "@actions/core";
import { exec, getExecOutput } from "@actions/exec";
import * as path from "path";
import * as os from "os";
import * as semver from "semver";

export async function curl(
  url,
  { maxAttempts, retryDelaySeconds, retryAll, followRedirect, cookie, basicAuth }
) {
  const options = ["--fail", "-sv", "-w", "\\n%{http_code}"];
  if (maxAttempts > 1) {
    options.push(
      "--retry",
      `${maxAttempts}`,
      "--retry-delay",
      `${retryDelaySeconds}`,
      "--retry-connrefused"
    );
  }
  if (followRedirect) {
    options.push("-L");
  }
  if (retryAll) {
    options.push("--retry-all-errors");
  }
  if(cookie) {
    options.push("--cookie", `${cookie}`);
  }
  if(basicAuth) {
    options.push("-u", `${basicAuth}`);
  }

  options.push(url);

  core.info(`Checking ${url}`);
  core.debug(`Command: curl ${options.join(" ")}`);

  const { stdout, stderr } = await getExecOutput("curl", options);
  
  // Parse response
  const lines = stdout.split('\n');
  const statusCode = parseInt(lines[lines.length - 1]);
  const body = lines.slice(0, -1).join('\n');
  
  // Parse headers from stderr
  const headers = {};
  const headerLines = stderr.split('\n');
  for (const line of headerLines) {
    if (line.startsWith('< ')) {
      const [_, header] = line.match(/< (.*?): (.*)/) || [];
      if (header) {
        headers[header.toLowerCase()] = line.split(': ')[1];
      }
    }
  }

  return {
    statusCode,
    body,
    headers
  };
}

export async function isVersion(atLeast) {
  const curlVersionOutput = await getExecOutput("curl --version");
  const rawVersion = curlVersionOutput.stdout.match(/curl (\d+\.\d+\.\d+)/)[1];
  const installed = semver.clean(rawVersion);
  return semver.gte(installed, atLeast);
}

export async function upgrade() {
  const upgrader = {
    linux: {
      exec: async () => {
        const binDir = path.join(os.homedir(), ".bin");
        const curlPath = path.join(binDir, "curl");
        // From https://curl.se/download.html#Linux
        const curlUrl = `https://github.com/moparisthebest/static-curl/releases/download/v7.78.0/curl-amd64`;
        await exec("mkdir", ["-p", binDir]);
        await exec("wget", ["-O", curlPath, curlUrl]);
        await exec("chmod", ["+x", curlPath]);
        core.addPath(binDir);
      },
    },
    win32: {
      exec: async () => {
        await exec("choco", ["install", "curl"]);
        // If this is the first time chocolatey is run, it won't be in the PATH.
        // It sounds like a runner setup issue, to be fair, but we still need it to work.
        core.addPath("C:\\ProgramData\\chocolatey\\bin");
      },
    },
    darwin: {
      exec: async () => {
        await exec("brew", ["install", "curl"]);
      },
    },
  };

  const platformUpgrader = upgrader[process.platform];
  if (!platformUpgrader) {
    throw new Error(
      `Unsupported platform: ${
        process.platform
      }, supported platforms: ${Object.keys(upgrader).join(", ")}`
    );
  }

  await platformUpgrader.exec();
}
