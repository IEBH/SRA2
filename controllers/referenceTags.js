var monoxide = require('monoxide');

app.use('/api/referenceTags/:id?', monoxide.express.middleware('referenceTags', {
}));
