WaveForm - CodeIgniter / PHP Input validator
============================================
WaveForm is a form validation class for CodeIgniter and PHP.
It can provide for form (or table or just field) HTML generation as well as validation rules.


Updates
=======

1.3.0
-----
* Added `$field->Span()` function to display a field *without* displaying the label (effectively making the input use up two 'columns' instead of label/value layout). This works really well with text boxes (via `$row->Text()`) or raw HTML output (via `$row->HTML()`)
* Added `Value()` function to return the plain text value of a single field (or all fields as an array) instead of using $waveform->Fields flat array access. In the future we could use IO filters which will be required to run when called.
* BUGFIX: Chrome no longer gets upset when rendering floating point inputs (via `$row->Float()`)

1.2.0
-----
* New use of Filters to specify which fields should be rendered when generating a form, table or series of inputs
* New `$row->HTML()` alias function to call `$row->Label()`
* `$row->HTML()`, `$row->Label()` and `$row->ReadOnly()` can now take a default value as the first parameter to bypass the need to make another call to `$row->Default()`
* Creation of `GenHash()` function to generate short unique hashes
* Define can now take a null as a name (uses the new `GenHash()` function to make one)
* `GetHash()` method to return all values as a hash (can take a Filter as parameters)
* Added `Get()` method as an alias of `Field()`


1.1.0
-----
* Added Bootstrap form style support


Installation
============

Installing into CodeIgniter
---------------------------
Download this GIT repository and copy into your application directory.

Alternatively, install with [Sparks](http://getsparks.org/).


Using WaveForm in PHP
---------------------
White Waveform is primarily CodeIgniter + Sparks based it can also be used as a stand-alone.

Grab the main waveform.php file from the libraries directory and simply dump it wherever it is needed.

See the examples below for some tips on how to use it.


Examples
========

Simple signup page
------------------

The below shows a simple user sign up page controller written for [CodeIgniter](http://codeigniter.com/) using [Sparks](http://getsparks.org/).

	<?php
	class User as CI_Controller {
		function signup() {
			$this->load->sparks('waveform/1.0.0'); // Load the Waveform Spark

			// Define the Waveform fields
			$this->waveform->Group('Personal Details');
			$this->waveform->Define('name');
			$this->waveform->Define('email')
				->Email();
			$this->waveform->Define('age')
				->Type('int')
				->Min(18);

			$this->waveform->Group('Optional Info');
			$this->waveform->Define('sex')
				->Choice(array('m' => 'Male', 'f' => 'Female'));
			$this->waveform->Define('music_tastes')
				->Type('text');
			$this->waveform->Define('avatar')
				->File('temp') // WARNING: This example requires a writable 'temp' sub-directory if testing the 'avatar' upload field.
				->Max('200kb');

			if ($this->waveform->OK()) { // Everything is ok? ?>
				// FIXME: Do something now they've signed up
			} else { // New page OR Something failed
				echo $this->waveform->Form(); // Output the Waveform <form> - usually this would itself be inside a view.
			}
		}
	}
	?>



Editing a database record
-------------------------
The below shows a simple car editing controller

	<?php
	/**
	* CodeIgniter Car controller
	* Provides a CRUD interface for managing a users cars
	*/
	function Cars() {
		/**
		* Display a list of cars
		*/
		function Index() {
			// Add some listing code here
		}

		/**
		* Edit a car by its ID
		* @param int $carid The Unique ID of the car to edit
		*/
		function Edit($carid = null) {
			$car = $this->Car->GetById($carid); // Assumes you have an appropriate setup that provides a library called `Car` with has a method called `GetById()`
			$this->load->spark('waveform/1.0.0');

			$this->Waveform->Define('make')
				->Text();
				->Min(1);
				->Max(100);
			$this->Waveform->Define('model')
				->Choice(array(
					'Ford',
					'Chevy',
					'Holden',
					'GM',
				);
			$this->Waveform->Define('reg')
				->Title('Registration')
				->NotRequired();

			if ($this->Waveform->OK()) {
				$this->Car->Save($this->Waveform->Fields);
				header('Location: /cars');
				exit;
			} else {
				$this->load->view('waveform');
			}
		}
	}
	?>


Stand-alone PHP usage
---------------------
Waveform can also be used as a stand-alone library without Sparks. To do this simply extract the `waveform.php` file from the `libraries/` directory and use it in your application like you would a normal PHP file.
The below example loads up WaveForm, defines some fields then sits out a form for the user to enter data into.
Finally the form is validated and (should everything be ok) the values passed on for further processing.

	<?php
	require('waveform.php');
	$Waveform = new Waveform();
	$Waveform->Group('Personal Details');
	$Waveform->Define('name');
	$Waveform->Define('email')
		->Email();
	$Waveform->Define('age')
		->Type('int')
		->Min(18);
	$Waveform->Group('Optional Info');
	$Waveform->Define('sex')
		->Choice(array('m' => 'Male', 'f' => 'Female'));
	$Waveform->Define('music_tastes')
		->Type('text');
	$Waveform->Define('avatar')
		->File('temp')
		->Max('200kb');

	if ($Waveform->OK()) { // Everything is ok?
		// Everything went ok. $this->Waveform->Fields is now an array
		// full of the values the user provided.
		echo "<h1>Thanks for signing up {$this->Waveform->Fields['name']}</h1>";
		echo "<p>Posted values: <pre>" . print_r($_POST, 1) . "</pre></p>";
	} else { // New page OR Something failed
		// Something went wrong OR this is the first time we've viewed the page.
		// Display the form (with errors if any):
		echo "<h1>Signup</h1>";
		echo $Waveform->Form();
	}
	?>
