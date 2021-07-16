module.exports = {
  babelrc: false,
  plugins: ['@babel/plugin-syntax-dynamic-import', '@babel/plugin-proposal-class-properties', '@babel/plugin-transform-runtime'],
  global: true,
  ignore: [/node_modules\/(?!(chai-as-promised|fetch-mock)\/).*/],
  sourceType: 'module',
  presets: [
    [
      '@babel/preset-env',
      {
        modules: 'commonjs',
        targets: {
          browsers: ['last 2 Chrome versions', 'Safari >= 12', 'iOS >= 10.3', 'last 2 Firefox versions', 'last 2 Edge versions'],
        },
      },
    ],
  ],
};
