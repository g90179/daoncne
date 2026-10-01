import { execSync } from 'node:child_process'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import svgr from 'vite-plugin-svgr'; // 추가

function git(command) {
  try {
    return execSync(command, { stdio: ['ignore', 'pipe', 'ignore'] }).toString().trim();
  } catch {
    return '';
  }
}

const BUILD_ID = git('git rev-parse --short HEAD') || 'nogit';
const COMMIT_SUBJECT = git('git log -1 --format=%s');
const BUILD_VERSION = COMMIT_SUBJECT.match(/^\s*(\d+\.\d+\.\d+)/)?.[1] ?? '0.0.0';

// 관리자(SVCM)가 실제 운영 프런트의 배포 시각·커밋을 확인할 수 있도록 정적 버전 파일을 함께 배포한다.
function versionJsonPlugin() {
  return {
    name: 'daon-version-json',
    generateBundle() {
      this.emitFile({
        type: 'asset',
        fileName: 'version.json',
        source: JSON.stringify({ id: BUILD_ID, version: BUILD_VERSION, builtAt: new Date().toISOString() }),
      });
    },
  };
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), svgr(), versionJsonPlugin()],
})
