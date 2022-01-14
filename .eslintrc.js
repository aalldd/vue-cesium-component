// https://eslint.org/docs/user-guide/configuring

module.exports = {
    root: true,
    parserOptions: {
        parser: 'babel-eslint'
    },
    env: {
        browser: true,
    },
    extends: [
        // https://github.com/vuejs/eslint-plugin-vue#priority-a-essential-error-prevention
        // consider switching to `plugin:vue/strongly-recommended` or `plugin:vue/recommended` for stricter rules.
        'plugin:vue/essential'
    ],
    // required to lint *.vue files
    plugins: [
        'vue', "prettier"
    ],
    // add your custom rules here
    rules: {
        // allow async-await
        'generator-star-spacing': 'off',
        // allow debugger during development
        'no-debugger': process.env.NODE_ENV === 'production' ? 'error' : 'off',
        'eslint space-before-function-paren': 0,
        //取消空2个字符提示
        'indent': ['off', 2],
        //文件最后一行必须空行提示取消
        'eol-last': 0,
        //
        'operator-linebreak': 0,
        //检查函数前面必须空格取消
        'space-before-function-paren': 0,
        'spaced-comment': 0,
        //
        "no-tabs": 0
    }
}
