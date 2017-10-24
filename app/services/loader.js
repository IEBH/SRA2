/**
* Display a 'loading' modal box and update its title, text and progress as we load things
*/
app.factory('Loader', function() {
	return {
		loaderData: {
			shown: false,
			title: '',
			text: '',
			progress: 0,
		},

		/**
		* Update what we are doing
		* @param string text The text to display
		* @return object This chainable object
		*/
		text: function(text) {
			this.loaderData.text = text;
			return this;
		},

		/**
		* Update the overall subject
		* @param string text The text to display
		* @return object This chainable object
		*/
		title: function(text) {
			this.loaderData.title = text;
			return this;
		},

		/**
		* Update the overall progress
		* @param number The progress between 0 and 100
		* @return object This chainable object
		*/
		progress: function(progress) {
			this.loaderData.progress = progress;
			return this;
		},

		/**
		* Finish and close the loader
		* @return object This chainable object
		*/
		finish: function() {
			console.log('FINISH');
			$('#modal-loader').modal('hide');
			this.loaderData.shown = false;
			return this;
		},

		/**
		* Start the loader
		* @return object This chainable object
		*/
		start: function() {
			this.loaderData.shown = true;
			console.log('START');

			$('#modal-loader')
				.one('shown.bs.modal', ()=> {
					console.log('SHOWN', this.loaderData.shown);
					if (!this.loaderData.shown) $('#modal-loader').modal('hide');
				})
				.modal({
					backdrop: 'static', // Dont close modal on backdrop click
					keyboard: false, // Dont close modal on keyboard
					show: true,
				});
			return this;
		},
	};
});
