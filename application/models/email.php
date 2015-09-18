<?
if ( ! defined('BASEPATH')) exit('No direct script access allowed');
/**
* Generic email functionality model
* NOTE: See config/constands#EMAIL_OVERRIDE
*/
class Email extends CI_Model {
	/**
	* Send a pre-packaged email to a user
	* This function scoops the template from the pages table (e.g. pages.code = 'emails/user/signup')
	* @param string $code The lookup code to query the pages table for to retrieve the content
	* @param int $userid The user id to send the mail to. Use '0' for admin
	* @param array $vars Local vars to replace in the template
	*/
	function Send($code, $userid, $vars) {
		$this->load->model('Page');
		$this->load->model('User');
		if ((!$page = $this->Page->GetByCode($code)) && $page != 'core/panic') {
			$this->site->Error("Cant find non-existant page code '$code' to send via email to user id #$userid");
			return;
		}
		$users = ($userid == 0) ? $this->User->GetAll(array('role' => 'admin')) : array($this->User->Get($userid)); // Get a list of who to send to

		foreach ($users as $user) {
			$vars['user.name'] = $this->User->GetName($user['userid']);
			$vars['user.email'] = $user['email'];

			$vars['link.site'] = SITE_URL;
			$vars['link.login'] = SITE_URL . '/login';

			$vars['site.title'] = SITE_TITLE;
			$vars['site.name'] = SITE_TITLE;

			$title = $this->Page->Replace($page['title'], $vars);
			$body = $this->Page->Replace($page['text'], $vars);
			$this->Dispatch($page['type'], $user['userid'], $title, $body);
			$this->Log->Add('envelope', "Email $code dispatched to {$user['email']}", $user['userid']);
		}
		return TRUE;
	}

	/**
	* Similar to send() but SendEmail() dispatches to an email address rather than by user record
	* @see send()
	*/
	function SendEmail($code, $email, $vars) {
		$this->load->model('Page');
		if ((!$page = $this->Page->GetByCode($code)) && $page != 'core/panic') {
			$this->site->Panic("Cant find non-existant page code '$code' to send via email to user email #$email");
			return;
		}

		$vars['link.site'] = SITE_URL;
		$vars['link.login'] = SITE_URL . '/login';

		$vars['site.title'] = SITE_TITLE;
		$vars['site.name'] = SITE_TITLE;

		$title = $this->Page->Replace($page['title'], $vars);
		$body = $this->Page->Replace($page['text'], $vars);
		$this->Dispatch($page['type'], $email, $title, $body);
		$this->Log->Add('envelope', "Email $code dispatched to $email");
		
		return TRUE;
	}

	/**
	* Send the actual HTML email to a user
	* @param string $format The format of the mail to send ('html' or 'text')
	* @param int|string $userid Either the user ID to send to or just an email address
	* @param string $subject The email subject to use
	* @param string $html The HTML blob to send
	*/
	function Dispatch($format, $userid, $subject, $body) {
		$this->Mailer = new PHPMailer();
		$this->Mailer->IsSMTP(); 
		$this->Mailer->Host = EMAIL_SERVER_HOSTNAME;
		$this->Mailer->SMTPAuth = false;
		$this->Mailer->Port = EMAIL_SERVER_PORT;
		$this->Mailer->Username = EMAIL_SERVER_USER;
		$this->Mailer->Password = EMAIL_SERVER_PASS;
		$this->Mailer->SetFrom(EMAIL_ADDRESS, EMAIL_NAME);
		$this->Mailer->Subject = $subject;
		$this->Mailer->isHTML($format == 'html');
		$this->Mailer->Body = $body;

		if (EMAIL_OVERRIDE) {
			$this->Mailer->AddAddress(EMAIL_OVERRIDE_TO, EMAIL_OVERRIDE_NAME);
		} else if (is_numeric($userid)) {
			$userid = $this->User->Get($userid);
			$this->Mailer->AddAddress($userid['email'], $this->User->GetName($userid));
			$this->Log->Add('envelope', "Sent email with subject '$subject' to {$userid['email']}");
		} else if (is_string($userid)) {
			$this->Mailer->AddAddress($userid);
			$this->Log->Add('envelope', "Sent email with subject '$subject' to $userid");
		} else {
			$this->Mailer->AddAddress($userid['email'], $this->User->GetName($userid));
			$this->Log->Add('envelope', "Sent email with subject '$subject' to {$user['email']}");
		}

		return $this->Mailer->Send();
	}

	/**
	* Send an email to the site admins
	* Generally used via the /contact form
	* @param string $email The email of the person sending the message
	* @param string $name The name of the person sending the message
	* @param string $body The actual message
	* @param string $to The email address that should be used. ADMIN_EMAIL is used if unspecified
	*/
	function Contact($email, $name, $body, $to = null) {
		$body = "Return email: $email\n$body";
		if ($name)
			$body = "Name: $name\n$body";

		$headers = "From: " . ADMIN_EMAIL_NAME . "<" . ADMIN_EMAIL . ">\r\n" .
			"Reply-To: $email\r\n" .
			"X-Mailer: PHP/" . phpversion();

		mail($to ? $to : ADMIN_EMAIL, 'Contact email', "\n\n$body", $headers);
	}
}
?>
