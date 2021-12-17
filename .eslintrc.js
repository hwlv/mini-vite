module.exports = {
  parser: "@typescript-eslint/parser", //定义ESLint的解析器
  extends: [
    'plugin:react/recommended',
    // 'plugin:@typescript-eslint/recommended',
    'prettier',
    // 'prettier/@typescript-eslint',
    'plugin:prettier/recommended',
    "plugin:react-hooks/recommended"
  ], //定义文件继承的子规范
  plugins: ["@typescript-eslint", "react-hooks"], //定义了该eslint文件所依赖的插件
  env: {
    //指定代码的运行环境
    browser: true,
    node: true,
    jest: true
  },
  globals: {
    ENV: true
  },
  settings: {
    //自动发现React的版本，从而进行规范react代码
    react: {
      pragma: "React",
      version: "detect"
    }
  },
  parserOptions: {
    //指定ESLint可以解析JSX语法
    ecmaVersion: 2019,
    sourceType: "module",
    ecmaFeatures: {
      jsx: true,
      tsx: true
    }
  },
  rules: {
    'react/prop-types': 0,
    'typescript/no-unused-vars': 0,
    'react/display-name': 0,
    'react-hooks/rules-of-hooks': 'error',
    'react-hooks/exhaustive-deps': [
      "warn", {
        "additionalHooks": "useRecoilCallback"
      }
    ],
    'no-console': 1,
    'no-unused-vars': 0,
    complexity: [
      'warn',
      { max: 8 }
    ]
  }
};
