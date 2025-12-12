// @ts-check

import eslint from "@eslint/js"
import { defineConfig } from "eslint/config"
import tseslint from "typescript-eslint"

export default defineConfig({
  files: ["src/**/*.{js,ts,tsx}"],

  extends: [eslint.configs.recommended, ...tseslint.configs.recommended],
})
