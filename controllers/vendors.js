var express = require('express');

// Serve Font-Awesome font files
app.use('/fonts', express.static(config.root + '/node_modules/font-awesome/fonts', {lastModified: 100 * 60 * 10}));

// Serve Angular-UI-Grid font files
app.use('/build/ui-grid.ttf', express.static(config.root + '/node_modules/angular-ui-grid/ui-grid.ttf', {lastModified: 100 * 60 * 10}));
app.use('/build/ui-grid.woff', express.static(config.root + '/node_modules/angular-ui-grid/ui-grid.woff', {lastModified: 100 * 60 * 10}));
