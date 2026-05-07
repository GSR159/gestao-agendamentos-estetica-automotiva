module.exports = {
  testEnvironment: 'node',
  roots: ['<rootDir>/src/test'],
  testPathIgnorePatterns: ['/node_modules/'],
  collectCoverageFrom: [
    'src/controllers/**/*.js',
    'src/middlewares/**/*.js',
    'src/routes/**/*.js',
  ],
};