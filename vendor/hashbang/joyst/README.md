Joyst
=====
Joyst is a CodeIgniter extension providing automated model functionality based on a DB schema.

Joyst has the following aims:

1. To automate the tedious specification for models in CodeIgniter - its does this by automatically providing common functionality like `get()`, `getAll()`, `getById()` etc.
2. To automate the acccess to the data layer for simple tasks ([CRUD](https://en.wikipedia.org/wiki/Create,_read,_update_and_delete)) from the front end to the backend.


Installation
------------
Install is via Composer with:

	composer require hashbang/joyst


Common errors:

* `Fatal error: Class 'Joyst_Controller' not found` - Joyst needs to be loaded very early in the CI load order. Add a call to `require('vendor/autoload.php');` in `application/config/config.php` rather than the auto load file.


Use within CodeIgniter
======================

Simple example
--------------
Below is an example CodeIgniter model using Joyst which provides user model functionality.
The only essencial part of the below is the class extending `Joyst_Model` and having a function called `DefineSchema()` (any caps).

	class User extends Joyst_Model {

		function DefineSchema() {
			$this->On('getall', function(&$where) {
				if (!isset($where['status'])) // If not specified imply only active users
					$where['status'] = 'active';
			});
			$this->On('create', function(&$row) {
				$row['created'] = time(); // Set the row creation time when creating
				if (isset($row['email']) && empty($row['username'])) // If no username specified make the username the email
					$row['username'] = $row['email'];
				if (isset($row['password'])) { // If setting a password hash it
					$row['passhash'] = $this->HashSet($row['password']);
					unset($row['password']); // Remove it from the output since we are storing it in another field
				}
			});
			$this->On('save', function($id, &$row) {
				$row['edited'] = time(); // Save the time we edited the record
				if (isset($_SESSION['user']) && $_SESSION['user']['userid'] == $userid) // Changing ourself?
					$_SESSION['user'] = array_merge($_SESSION['user'], $this->Get($userid, TRUE)); // Update $_SESSION['user'] to reflect the new data
			});

			return array( // Specify the table schema
				'_model' => 'User',
				'_table' => 'users',
				'_id' => 'userid',
				'userid' => array(
					'type' => 'pk',
					'readonly' => true,
				),
				'username' => array(
					'type' => 'varchar',
					'length' => 50,
				),
				'fname' => array(
					'type' => 'varchar',
					'length' => 50,
				),
				'lname' => array(
					'type' => 'varchar',
					'length' => 50,
				),
				'passhash' => array(
					'type' => 'char',
					'length' => 40,
				),
				'email' => array(
					'type' => 'email',
				),
				'role' => array(
					'type' => 'enum',
					'options' => array(
						'user' => 'Regular user',
						'admin' => 'Administrator',
						'root' => 'Root user'
					),
					'default' => 'user',
				),
				'created' => array(
					'type' => 'epoc',
					'readonly' => true,
				),
				'edited' => array(
					'type' => 'epoc',
					'readonly' => true,
				),
				'lastlogin' => array(
					'type' => 'epoc',
					'readonly' => true,
				),
				'status' => array(
					'type' => 'enum',
					'options' => array('active', 'deleted'),
					'default' => 'active',
				),
			);
		}
	}


More complex example
--------------------
The below example model provides generic device functionality.

	class Device extends Joyst_Model {

		function DefineSchema() {
			$this->On('getall', function(&$where) {
				if (!isset($where['status'])) // If not specified imply only active items
					$where['status'] = 'active';
			});
			$this->On('create', function(&$row) {
				$row['created'] = time();
				$row['creatorid'] = $_SESSION['user']['userid']; // Set the creator to the current user
			});
			$this->On('save', function($id, &$row) {
				$row['edited'] = time();
				if (isset($row['starred'])) // If we're being passed the meta field 'starred' call our defined function SetStar()
					$this->SetStar($id, $row['starred']);
			});
			$this->on('row', function(&$row) {
				$row['starred'] = $this->IsStarred($row['deviceid']); // Append the meta field 'starred' to the output of each row

				$row['isActive'] = $this->IsActive($row); // Append the meta field 'isActive' to the output of each row
			});
			$this->on('getall', function(&$where) {
				$this->db->select('devices.*');

				// Example of a meta field 'tagid' inserting an automatic join to filter by
				if (isset($where['tagid'])) {
					$this->db->join('tags2devices', 'tags2devices.deviceid = devices.deviceid');
					$this->db->where('tags2devices.tagid', $where['tagid']);
					unset($where['tagid']);
				}

				// Example of another join if the meta field 'starred' is specified in the where condition
				if (isset($where['starred'])) {
					$this->db->join('user2device', 'user2device.deviceid = devices.deviceid');
					$this->db->where('user2device.userid', $this->User->GetActive('userid'));
					unset($where['starred']);
				}

				$this->db->join('dcus', 'dcus.dcuid = devices.dcuid');
				$this->db->where('dcus.locationid', $this->User->GetActive('locationid'));
			});
			$this->on('created', function($deviceid, $row) {
				// Log that we created the item
				$this->Log->Add('device', "Device #$deviceid created", null, array('deviceid' => $deviceid));
			});

			return array(
				'_model' => 'Device',
				'_table' => 'devices',
				'_id' => 'deviceid',
				'deviceid' => array(
					'type' => 'pk',
					'readonly' => true,
				),
				'dcuid' => array(
					'type' => 'fk',
				),
				'ref' => array(
					'type' => 'varchar',
					'length' => 50,
				),
				'name' => array(
					'type' => 'varchar',
					'length' => 100,
				),
				'description' => array(
					'type' => 'varchar',
					'length' => 255,
				),
				'type' => array(
					'type' => 'enum',
					'options' => array(
						'unknown' => 'Unknown',
						'ac' => 'Air Conditioner',
						'light' => 'Light',
						'hotwater' => 'Hot Water',
						'meter' => 'Meter',
					),
					'default' => 'unknown',
				),
				'spec' => array(
					'type' => 'json',
				),
				'created' => array(
					'type' => 'epoc',
					'readonly' => true,
				),
				'creatorid' => array(
					'type' => 'int',
					'readonly' => true,
				),
				'edited' => array(
					'type' => 'int',
					'readonly' => true,
				),
				'status' => array(
					'type' => 'enum',
					'options' => array('active', 'deleted'),
					'default' => 'active',
				),
			);
		}
	}



Useful snippets
===============

Sort the return of a GetAll() call
----------------------------------
Sometimes the built-in OrderBy functionality is too limited and you may need to rearrange the return results in the PHP HLL rather than at the database.

The following example hooks itself onto the `GetAll()` return and applies a [Natural Sorting algorithm](http://au2.php.net/manual/en/function.strnatcmp.php) so things get sorted properly when they contain numbers (e.g. '1', '2', '10', '11' gets sorted correctly).

	$this->on('rows', function(&$rows) {
		return usort($rows, function($a, $b) {
			return strnatcmp($a['name'], $b['name']); // Sort by the name field using a natural string sort
		});
	});
