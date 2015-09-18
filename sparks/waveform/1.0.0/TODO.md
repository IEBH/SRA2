Ideas to extend Waveform
========================
The following are some brainstorming ideas to provide more functionality to Waveform.

Redefine `Group()` functionality
--------------------------------
This would be an extension to the existing filter functionality that allows large collections of fields to be collectively referred to.

	# In the contoller
	$this->Group('set1')
	$this->define('Field1');
	$this->define('Field2');

	$this->Group('set2')
	$this->define('Field3');
	$this->define('Field4');

	# In the view:
	<?=$this->waveform->Form('@set1')?>

	# This replaces the existing
	<?=$this->waveform->Form('Field1 - Field2')?>

In the above example two groups are created but only group 1 is output where it is specified.

NOTES: This will require the existing `Group()` function to be retired in favour of `Title()` or something.


Improve documentation
---------------------
The existing documentation is a mess or non-existent.
* Function reference
* Examples
* Create website to advertise - either using GitHub pages or its own domain.
* Upload to GetSparks.org - with new account so the previous 'unpleasantness' doesn't happen again


Better support for file uploads
-------------------------------
At present file uploads are really just tacked on. It needs an overhaul.
* Support for images and image resizing
* Support for file MIME type checking
* Helper functionality to take uploads from external of Waveform - i.e. create an upload, do actions and output *without* actually using a Waveform setup



Support for closures
--------------------
Not really supported that well by older versions of PHP but there is no reason PHP5+ can't include them as validators.

	$this->waveform->Define('username')
		->Callback(function() {
			return preg_match('/^[a-z0-9]+$/', $this->value); # Only allow a-z, 0-9 in username
		});


Output filters
--------------
The ability to force all incoming data though a filter before its provided to the upstream controller.

	$this->waveform->Define('email') # Force all email addresses to be stored lowercase
		->Filter('lowercase');

	
	$this->waveform->Define('email') # Force all email addresses to be stored lowercase - using a closure
		->Filter(function() {
			return strtolower($this->value);
		});


Inline conditionals
-------------------
At the moment selectively showing CI fields is messy with indending:

	# Sample form to promote a user to admin (only if the viewing user himself is admin already)
	if ($this->User->IsAdmin()
		$this->waveform->Define('user_level')
			->Choice(array(
				'user' => 'User',
				'admin' => 'Admin',
			));

	$this->waveform->Define('user_name')
		->String()
		->Max(200);

Instead move the conditional into Waveform itself:

	$this->waveform->Define('user_level')
		->Enable($this->User->IsAdmin()) # Basicly deletes the field if false, use ReadOnly($condition) to make readonly
		->Choice(array(
			'user' => 'User',
			'admin' => 'Admin',
		));

	$this->waveform->Define('user_name')
		->String()
		->Max(200);

NOTE: Requires new `Enable()` function
NOTE: Requires `ReadOnly()` function to take a boolean as to whether to set it instead of setting the default text


Direct CodeIgniter integration
------------------------------
**NEEDS MORE THOUGHT**
Using ActiveRecord with Waveform should be more seamless:

	$this->waveform
		->db->from('users')
		->db->where('userid', $userid)
	$this->define('username');


Move success/fail actions into Waveform
---------------------------------------
At present Waveform uses PHPs own `if` statement combined with `OK()` to figure out if the form passed:

	$this->waveform->Define('user_level')
		->Choice(array(
			'user' => 'User',
			'admin' => 'Admin',
		));

	$this->waveform->Define('user_name')
		->String()
		->Max(200);

	if ($this->waveform->OK()) { # all is well
		$this->User->Save($userid, $this->waveform-Fields());
	} else { # All is not well - display the form
		# ... load a form view or something ...
	}

This could be moved into a callback:

	$this->waveform->Define('user_level')
		->Choice(array(
			'user' => 'User',
			'admin' => 'Admin',
		));

	$this->waveform->Define('user_name')
		->String()
		->Max(200);

	$this->waveform->OK(function() {
		$this->User->Save($userid);
		redirect('/users');
	});


Predefined lists
----------------
Defining choice boxes can be tedious.
Instead Waveform could load predefined arrays from some local resource:

	$this->waveform->Define('months')
		->ChoiceTemplate('months'); # Returns array(1 => 'January', 2 => 'Feburary'...)

Would be nice if these files could live in `waveform/choicetemplates` and just be simple .php files that return an array.


Extend `String()` with some predefined options
----------------------------------------------
It would be useful to provide some pre-defined Regular Expression validators:

	$this->Define('username')
		->String('alphanumeric');
	$this->Define('firstname')
		->String('nospaces');
	$this->Define('email')
		->String('email'); # Although ->Email() would be better obviously.


Improve templating system
-------------------------
At present the internal HTML templating system uses a weird hybrid HTML-as-array system. It would be much cleaner if it used PHP itself (via evals):

	$this->Define('username')
		->Style('input', '<input type="text" value="{$this->value}"/>') # To replace the input area area only
		->Style('label', '{$this->label}:') # To replace the label area area only
		->Style('row', '<tr><td>{$this->template->label}</td><td>{$this->template->input}></tr>') # To replace the whole row template (which calls in the two above elements)


NOTE: Not sure how adding prefixes, suffixes would work under this new system. Maybe the addition of `Prefix()` and `Suffix()` functions that prepend/append to the existing template layout. If these are functions it may be possible to override these if using a theme.


List displays
-------------
Waveform is really only configured to provide edit interfaces at the moment, it would be beneficial if it could also generate lists of data too.
**NO IDEA HOW - NEEDS MORE THOUGHT**

Maybe an extension of the CodeIgniter ActiveRecord interface:

	# In a view:
	<?=
	$this->waveform->Browse()
		->db->from('users')
		->db->where('status', 'active')
	?>

This would enable it to plugin to other services - data filters, sorting agents etc. much easier than the programming rigging stuff up each time.


Add `Span()` helper
-------------------
At present its possible to insert inline HTML by creating a dummy element then passing some HTML to `span()`:

	$this->waveform->Define('alert')
		->Span('<div class="alert">Hello World</div>');

Since the input element (in the above called 'alert') has no further use its pretty redundent.
This could be replaced by a shortcut:

	$this->waveform->Span('<div class="alert">Hello World</div>');


AJAX validators
---------------
**NO IDEA HOW - NEEDS MORE THOUGHT**


