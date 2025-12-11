module.exports = {
  e2e: {
    baseUrl: 'http://localhost:3000',
    setupNodeEvents(on, config) {
      // implement node event listeners here
    },
    specPattern: 'cypress/e2e/**/*.cy.js',
    supportFile: 'cypress/support/e2e.js'
  },
  component: {
    devServer: {
      framework: 'react',
      bundler: 'webpack'
    },
    specPattern: 'cypress/component/**/*.cy.js'
  }
};
