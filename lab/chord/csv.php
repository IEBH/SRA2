<?php
$data = array(
    "Aabenhus R|||Bjerrum L" => 1,
    "Aabenhus R|||Hróbjartsson A" => 1,
    "Aabenhus R|||Jensen J-US" => 1,
    "Aabenhus R|||Jørgensen KJ" => 1,
    // ...
);

foreach ($data as $authors => $papers) {
	list ($author1, $author2) = explode('|||', $authors);
	echo "$author1,$author3,$papers\n";
}
?>
