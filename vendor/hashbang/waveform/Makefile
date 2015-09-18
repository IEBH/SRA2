all: docs/api

docs/api: clean
	mkdir docs/api -p
	phpdoc -q -f lib/Waveform.php -t docs/api -ti 'Waveform API reference' -o HTML:frames:earthli -dn Waveform

clean:
	-rm -r docs/api/*
