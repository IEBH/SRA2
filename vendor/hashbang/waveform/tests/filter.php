<?
/**
* Test script to verify that $Waveform->Filter() works
*/
require('../libraries/waveform.php');

$GLOBALS['wf'] = new Waveform();
function ok($test, $expect) {
	$got = $GLOBALS['wf']->Filter(array('foom' => 'foomval', 'foo' => 'fooval', 'bar' => 'barval', 'baz' => 'bazval', 'quz' => 'quzval', 'quzz' => 'quzzval'), $test);
	echo "test [$test] = [" . implode(',', $got) . "]";
	if ($got != $expect)
		echo " FAILED! Expect [" . implode(',', $expect) . "]\n";
	else
		echo " OK\n";
}

ok('foo, bar, baz', array('foo','bar','baz'));
ok(array('foo', 'bar', 'baz'), array('foo','bar','baz'));
ok('foo', array('foo'));
ok('*', array('foom', 'foo', 'bar', 'baz', 'quz', 'quzz'));
ok('*, !bar', array('foom', 'foo', 'baz', 'quz', 'quzz'));
ok('*, !bar, !quzz', array('foom', 'foo', 'baz', 'quz'));

ok('foo - baz', array('foo', 'bar', 'baz'));
ok('foo - baz, bar - quz', array('foo', 'bar', 'baz', 'quz'));
ok('foo - baz, bar - quz, !bar', array('foo', 'baz', 'quz'));

ok('!quz, !quzz, !foom', array('foo', 'bar', 'baz'));

