module.exports = function(config) {
  config.set({
    mutator: 'typescript',
    packageManager: 'yarn',
    reporters: ['html', 'clear-text', 'progress', 'dashboard'],
    testRunner: 'jest',
    coverageAnalysis: 'off',
    tsconfigFile: 'tsconfig.json',
    mutate: [
      'src/**/*.ts',
      '!src/**/__tests__/**/*'
    ]
  });
};
