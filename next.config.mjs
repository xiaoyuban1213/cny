import { execSync } from 'node:child_process';

/**
 * 构建信息：用于在页面底部展示当前部署的版本。
 * - commit：构建时所在的 git 提交（短哈希），取不到时回落为 unknown
 * - time：构建时间
 * 通过 next.config 的 env 注入，构建时内联到产物中。
 */
function getBuildInfo() {
  // 优先用环境变量（CI 会注入 GITHUB_SHA 等），其次读取本地 git 提交
  let commit =
    process.env.NEXT_PUBLIC_BUILD_COMMIT ||
    (process.env.GITHUB_SHA ? process.env.GITHUB_SHA.slice(0, 7) : '') ||
    '';
  if (!commit) {
    try {
      commit = execSync('git rev-parse --short HEAD', {
        stdio: ['ignore', 'pipe', 'ignore'],
      })
        .toString()
        .trim();
    } catch {
      // 构建环境没有 git 时忽略，保持 unknown
    }
  }
  if (!commit) {
    commit = 'unknown';
  }

  // 构建时格式化（UTC），避免服务端与客户端时区不同造成 hydration 不一致
  const now = new Date();
  const pad = (n) => String(n).padStart(2, '0');
  const time =
    `${now.getUTCFullYear()}-${pad(now.getUTCMonth() + 1)}-${pad(now.getUTCDate())}` +
    ` ${pad(now.getUTCHours())}:${pad(now.getUTCMinutes())} UTC`;

  return { commit, time };
}

const buildInfo = getBuildInfo();

/** @type {import('next').NextConfig} */
const nextConfig = {
  env: {
    NEXT_PUBLIC_BUILD_COMMIT:
      process.env.NEXT_PUBLIC_BUILD_COMMIT || buildInfo.commit,
    NEXT_PUBLIC_BUILD_TIME:
      process.env.NEXT_PUBLIC_BUILD_TIME || buildInfo.time,
  },
};

export default nextConfig;
