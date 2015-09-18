<?
require(dirname(__FILE__) . '/../lib/urlopts.php');

function ok($title, $returned, $expected) {
	if ($returned === $expected) {
		echo "$title - OK\n";
	} else {
		echo "\n$title - FAILED\n";
		echo "Expected: " . print_r($expected, 1) . "\n";
		echo "Got: " . print_r($returned, 1) . "\n";
		echo "\n";
	}
}

$u = new URLopts();
$u->Set('/test/list/foo/fooval/bar/barval');
ok('Segments extract', $u->Segments(), array('server.com', 'test', 'list', 'foo', 'fooval', 'bar', 'barval'));

$u = new URLopts();
$u->Set('/test/list/foo/fooval/bar/barval');
ok('Simple Get()', $u->Get(), array('foo' => 'fooval', 'bar' => 'barval'));

$u = new URLopts();
$u->Set('/test/list');
ok('Add(foo, fooval)', $u->Add('foo', 'fooval'), '/test/list/foo/fooval');

$u = new URLopts();
$u->Set('/test/list');
ok('Add(foo, FALSE)', $u->Add('foo', FALSE), '/test/list');

$u = new URLopts();
$u->Set('/test/list');
ok('Edit(foo=fooval)', $u->Edit('foo=fooval'), '/test/list/foo/fooval');

$u = new URLopts();
$u->Set('/test/list');
ok('Edit(+foo)', $u->Edit('+foo'), '/test/list/foo/1');

$u = new URLopts();
$u->Set('/test/list/foo/fooval');
ok('Edit(-foo)', $u->Edit('-foo'), '/test/list');

$u = new URLopts();
$u->Set('/test/list/');
ok('Edit(+foo,-bar,baz=bazval)', $u->Edit('+foo', '-bar', 'baz=bazval'), '/test/list/foo/1/baz/bazval');

$u = new URLopts();
$u->Set('site.com/test/list/');
$u->OmitServer(FALSE);
ok('Edit(+foo,-bar,baz=bazval) w/server', $u->Edit('+foo', '-bar', 'baz=bazval'), 'site.com/test/list/foo/1/baz/bazval');
