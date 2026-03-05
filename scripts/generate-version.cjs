const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

function safeGitShortSha() {
  try {
    return execSync('git rev-parse --short HEAD', { stdio: ['ignore', 'pipe', 'ignore'] })
      .toString()
      .trim();
  } catch (_) {
    return null;
  }
}

function resolveBuildHash() {
  // CI/CD usually provides this (your k8s manifests reference GIT_COMMIT_SHA).
  const fromEnv =
    process.env.GIT_COMMIT_SHA ||
    process.env.REACT_APP_BUILD_SHA ||
    process.env.VERCEL_GIT_COMMIT_SHA ||
    process.env.COMMIT_SHA ||
    process.env.SOURCE_VERSION;

  if (fromEnv && String(fromEnv).trim()) return String(fromEnv).trim().slice(0, 12);

  const fromGit = safeGitShortSha();
  if (fromGit) return fromGit;

  return 'unknown';
}

const buildHash = resolveBuildHash();
const timestamp = new Date().toISOString();

const payload = {
  buildHash,
  timestamp,
};

const outPath = path.join(process.cwd(), 'public', 'version.json');
fs.mkdirSync(path.dirname(outPath), { recursive: true });
fs.writeFileSync(outPath, JSON.stringify(payload, null, 2) + '\n', 'utf8');

// eslint-disable-next-line no-console
console.log(`[version] wrote public/version.json (${buildHash} @ ${timestamp})`);


