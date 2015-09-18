<?
class Users extends Joyst_Controller {
	function __construct() {
		parent::__construct();
		$this->load->model('User');
	}

	/**
	* Preform a user login
	* This can be either a standard email/password combination or via the Facebook OAuth API
	* @param string $message Display an optional status message
	*/
	function Login($message = null) {
		if ( $_POST && isset($_POST['username']) && isset($_POST['password']) ) { // STANDARD ONSITE LOGIN
			if (!$_POST['username'])
				$this->site->Message('warning', 'You must specify a valid user name');
			if (!$_POST['password'])
				$this->site->Message('warning', 'You must specify a valid password');
			if (!$this->site->HasErrs()) {
				if ($user = $this->User->GetByLogin($_POST['username'], $_POST['password'])) { // Valid login
					$redirect = TRUE;
					if (isset($_POST['redirect']) && $_POST['redirect']) {
						$redirect = $_POST['redirect'];
					} elseif (isset($_SESSION['post_login_url'])) {
						$redirect = $_SESSION['post_login_url'];
					}
					$this->User->Login($user['userid'], $redirect);
				} else {
					$this->site->Message('warning', 'Invalid user name or password');
					$this->Log->Add('key', "Invalid password for user '{$_POST['username']}'", $user ? $user['userid'] : null);
				}
			}
			
		}

		$text = '';
		switch ($message) {
			case 'share':
				$text = 'To access this reference library you need to login or create an account';
				break;
		}

		$this->User->Count(); // Dumb call to DB to ensure that we can actually talk to the database
		$this->site->SetTheme('minimal');
		$this->site->Header('Login');
		$this->site->View('users/login', array(
			'text' => $text,
		));
		$this->site->Footer();
	}

	/**
	* Clear all login information
	*/
	function Logout() {
		unset($_SESSION['user']);
		session_destroy();
		$this->site->Redirect('/');
	}

	/**
	* Recover a forgotten password
	*/
	function Recover() {
		$error = '';
		if (isset($_POST['email'])) {
			if (!$_POST['email']) {
				$this->site->Error('No email address specified');
			} elseif ($user = $this->User->GetByEmail($_POST['email'])) {
				$this->load->model('Email');
				$password2 = $this->User->SetSecondaryPass($user['userid']);
				$this->Email->Send('email/recover', $user['userid'], array('user.password' => $password2));
				$this->site->Text('A password recovery email has been sent', TRUE);
				$this->site->Terminate();
			} else
				$this->site->Error("Sorry but that email address doesn't seem to be registered with us");
		}

		$this->site->SetTheme('minimal');
		$this->site->Header('Recover Password');
		$this->site->View('users/recover');
		$this->site->Footer();
	}

	/**
	* Provide a simple signup form (with optional Facebook signup system)
	*/
	function Signup() {
		$this->load->model('Email');
		$this->load->model('Page');
		$errs = array();
		if ($_POST) {
			$this->Waveform = new Waveform();

			foreach (array(
				'email' => 'Email',
				'fname' => 'First name',
				'lname' => 'Last name',
				'password' => 'Password',
				'password2' => 'Password (again)',
			) as $field => $title)
				if (!isset($_POST[$field]) || !$_POST[$field])
					$errs[] = "$title must be specified";

			if ($_POST['password'] != $_POST['password2'])
				$errs[] = 'Passwords must match';

			if ($emailer = $this->User->GetByEmail($_POST['email'])) // Check email is not used by anyone
				$errs[] = 'That email already seems to be registered to someone else';

			if (!isset($_POST['agree']))
				$errs[] = 'You must accept the User Agreement';

			if (!$errs) {
				if ($userid = $this->User->Create($_POST)) {
					$this->Log->Add('user', "User signup: " . $this->Log->NiceArray($_POST));
					// $this->Email->Send('email/signup', $userid, array('user.password' => $this->Waveform->Fields['password']));
					$this->User->Login($userid);
				} else {
					$this->site->Error('Problem creating user account');
					$this->Log->Add('user', "Problem saving new signup info: " . $this->Log->NiceArray($this->Waveform->Fields));
				}
			}
		}

		$this->site->SetTheme('minimal');
		$this->site->Header('Signup');
		$this->site->View('users/signup', array(
			'errs' => $errs,
		));
		$this->site->Footer();
	}

	function Password() {
		$this->Security->EnsureLogin();

		$this->Waveform = new Waveform();
		$this->Waveform->Style('bootstrap');
		
		$this->Waveform->Define('password')
			->Password();

		if ($fields = $this->Waveform->OK()) {
			if ($fields['password'] != $fields['password_again']) {
				$this->Waveform->Fail('password', 'Passwords must match');
			} else {
				$this->User->Save($this->User->GetActive('userid'), array(
					'password' => $fields['password']
				));
				$this->site->Redirect('/');
			}
		}

		$this->site->Header('Change password');
		$this->site->View('users/password');
		$this->site->Footer();
	}

	function Profile() {
		$this->Security->EnsureLogin();
		if (!$this->RequesterWants('json'))
			$this->site->Error('Method only responds to JSON requests');

		if ($this->RequesterWants('put-json')) { // Save back profile details
			$this->User->Save($this->User->GetActive('userid'), $_POST);
		}

		$user = $this->User->Get($this->User->GetActive('userid'));
		$user['isAdmin'] = $this->User->IsAdmin();
		$user['isRoot'] = $this->User->IsRoot();
		$this->JSON($user);
	}
}
?>
