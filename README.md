# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.

## 백엔드 연결

`VITE_API_URL`은 빌드 시점에 값이 박히므로(Vite `import.meta.env`), Cloudflare 대시보드의
daoncne 프로젝트 → Settings → Variables and Secrets 에서 빌드 변수로 등록한다. 로컬 `.env`는
git에 안 올라가므로 로컬 개발용으로만 별도 유지한다. 백엔드는 Gabia에서
Cloudflare Containers(daoncne-be)로 이전됐다.
