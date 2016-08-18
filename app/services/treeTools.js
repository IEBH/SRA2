app.factory('TreeTools', function() {
	return {
		/**
		* Utlity function to deep search a tree structure for a matching query and find parents up to the given query
		* If found this function will return an array of all generations with the found branch as the last element of the array
		* @param {array} tree The tree structure to search (assumed to be a collection)
		* @param {Object} query A valid lodash query to run (anything valid via _.find())
		* @param {Object} options Optional options object
		* @param {array|string} [options.childNode="children"] Node or nodes to examine to discover the child elements
		* @return {array} A generation list of all parents decending to the found item
		*/
		findGenerations: function(tree, query, options) {
			var compiledQuery = _.matches(query);
			var seekStack = [];
			var settings = _.defaults(options, {
				childNode: ['children'],
			});
			settings.childNode = _.castArray(settings.childNode);

			var seekDown = function(tree) {
				var foundChild = _.find(tree, compiledQuery);
				if (foundChild) {
					seekStack.unshift(foundChild);
					return true;
				} else {
					return tree.some(function(branch) {
						var walkedStack = false;
						settings.childNode.some(function(key) { // Walk down first found childNode entry
							if (branch[key] && seekDown(branch[key])) {
								// Found a valid key - stop iterating over possible key names
								seekStack.unshift(branch);
								walkedStack = true;
								return true;
							}
						});
						return walkedStack;
					});
				}
			};

			seekDown(tree);
			return seekStack;
		},

		
		/**
		* Utlity function to deep search a tree structure for a matching query and find all children after the given query
		* If found this function will return an array of all child elements NOT including the query element
		* @param {array} tree The tree structure to search (assumed to be a collection)
		* @param {Object|null} [query] A valid lodash query to run (anything valid via _.find()). If null the entire flattened tree is returned
		* @param {Object} options Optional options object
		* @param {array|string} [options.childNode="children"] Node or nodes to examine to discover the child elements
		* @return {array} An array of all child elements under that item
		*/
		findChildren: function(tree, query, options) {
			var compiledQuery = query ? _.matches(query) : null;
			var settings = _.defaults(options, {
				childNode: ['children'],
			});
			settings.childNode = _.castArray(settings.childNode);

			var rootNode = query ? this.find(tree, query) : tree;

			var seekStack = [];
			var seekDown = function(branch, level) {
				settings.childNode.some(function(key) {
					if (branch[key]) {
						if (level > 0) seekStack.push(branch);
						branch[key].forEach(function(branchChild) {
							seekDown(branchChild, level +1);
						});
						return true;
					}
				});
			};

			seekDown(rootNode, 0);
			return seekStack;
		},



		/**
		* Find a single element
		* @param {array} tree The tree structure to search (assumed to be a collection)
		* @param {Object} query A valid lodash query to run (anything valid via _.find())
		* @return {array|undefined} A generation list of all parents decending to the found item
		*/
		find: function(tree, query) {
			var generations = this.findGenerations(tree, query);
			return _.isArray(generations) ? _.last(generations) : undefined;
		},


		/**
		* Return all branches of a tree as a flat array
		* @return {array} An array of all elements
		*/
		flattenTree: function(tree) {
			var seekStack = [];
			var seekDown = function(tree) {
				tree.forEach(function(branch) {
					seekStack.push(branch);

					if (branch.children && branch.children.length) seekDown(branch.children);
				});
			};

			seekDown(tree);
			return seekStack;
		},
	};
});
