var express = require('express');

// Server Font-Awesome font files
app.use('/fonts', express.static(config.root + '/node_modules/font-awesome/fonts', {lastModified: 100 * 60 * 10}));
