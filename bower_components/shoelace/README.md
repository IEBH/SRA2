Shoelace
========
A small addon library for Bootstrap.

This library provides some extra utility styles and Javascript fixups.


Installation
------------
Run the following in a Linux shell:

	# cd to/where/your/project/is
	mkdir lib
	git submodule add https://github.com/hash-bang/Shoelace.git lib/shoelace

Now add the following to your main HTML page somewhere after the Bootstrap section:

	<!-- Shoelace -->
	<link href="/lib/shoelace/shoelace.css" rel="stylesheet" type="text/css"/>
	<script src="/lib/shoelace/shoelace.js"></script>

... and you're done!

Shoelace will automatically apply itself when the page loads. If you use AJAX elements and wish to reinvoke Shoelace's behaviour just do:

	$(this).shoelace();


Features
========

Style fixes
-----------
A collection of various useful CSS classes in the bootstrap style.


<table>
	<tr>
		<th>Class</th>
		<th>Description</th>
		<th>Example</th>
	</tr>
	<tr>
		<th>pull-center</th>
		<td>Center elements dynamicly</td>
		<td>
<pre>
&lt;div class="pull-center"&gt;This element is centered within the parent&lt;/div&gt;
</pre>
		</td>
	</tr>
	<tr>
		<th>pull-reset</th>
		<td>Sets the text alignment on this and all child elements back to the left</td>
		<td>
<pre>
&lt;div class="pull-left"&gt;This element is left aligned within the parent&lt;/div&gt;
</pre>
		</td>
	</tr>
	<tr>
		<th>pull-vcenter</th>
		<td>Center elements vertically within a parent</td>
		<td>
<pre>
&lt;div class="pull-vcenter"&gt;
	This element is vertically centered
	within a block parent
&lt;/div&gt;
</pre>
		</td>
	</tr>
	<tr>
		<th>pad, pad-small, pad-large, pad-huge</th>
		<td>Change the padding of an element</td>
		<td>
<pre>
&lt;div class="pad"&gt;This element has some padding</div>
&lt;div class="pad-right pad-left"&gt;This element has some padding on the right and left</div>
&lt;div class="pad-huge"&gt;This element has a huge amount of padding&lt;/div&gt;
&lt;div class="pad-huge-top"&gt;This element has a huge amount of padding (but only at the top)&lt;/div&gt;
</pre>
		</td>
	</tr>
	<tr>
		<th>font-tiny, font-small, font-medium, font-large, font-huge</th>
		<td>Change the font size within an element</td>
		<td>
<pre>
&lt;div class="font-medium"&gt;This element has a normal sized font&lt;/div&gt;
&lt;div class="font-huge"&gt;This element has a huge font&lt;/div&gt;
</pre>
		</td>
	</tr>
	<tr>
		<th>input-stretch</th>
		<td>Stretch an input box to 100% of the width of the parent</td>
		<td>
<pre>
&lt;input class="input-stretch"/&gt;
</pre>
		</td>
	</tr>
	<tr>
		<th>no-wrap</th>
		<td>Keep all text on one line</td>
		<td>
<pre>
&lt;span class="no-wrap"&gt;A very long line&lt;/&gt;
</pre>
		</td>
	</tr>
</table>


Tooltips / data-tip
-------------------
Apply a tooltip to an item without having to call $(selector).tooltip()
For various weird reasons 'data-tooltip' cant be used so 'data-tip' will have to suffice.
	
	<a href="#" data-tip="Tooltip to display on hover"></a>
	
Additional parameters:
* data-tip-placement - Set the tooltip position


Prefixing / Suffixing input boxes
--------------------------------
Apply a read-only prefix or suffix to input boxes using the Bootstrap input-prepend and input-append styles.

	<input data-prefix="$" data-suffix=".00" value="10"/>

The above example will draw a standard input box with a sexy '$' prefix to denote money and the suffix '.00'.


Adding inline help or block help to input boxes
-----------------------------------------------
Similar to the above section on prefixing & suffixing, a simple data- tag can be added to input boxes to automatically add inline or block help eleements.

	<input data-help-inline="required" value="Hello World"/>

Adds 'required' horizontally after the input box.

	<input data-help-block="required" value="Hello World"/>

Adds 'required' in a block below the input box.


Focusing inputs
---------------
To automaticly focus an element simply add 'data-focus' to its attributes like so:

	<input data-focus="1" value="Hello World"/>

Note that only the first element will be focused.

If the element is inside a modal Shoelace will automatically focus that item when the modal becomes visible.


Selecting tabs
--------------
To select a tab you can set the data-selected property of the nav element:

	<div class="tabbable">
		<ul class="nav nav-tabs" data-selected="tab-1">
			<li><a href="#tab-1" data-toggle="tab">Tab 1</a></li>
			<li><a href="#tab-2" data-toggle="tab">Tab 2</a></li>
		</ul>
		<div class="tab-content">
			<div class="tab-pane" id="tab-1">Tab 1 content</div>
			<div class="tab-pane" id="tab-2">Tab 2 content</div>
		</div>
	</div>

Alternately setting the property to 'auto' will select either the first tab OR the tab denoted by the document location. e.g. if the document url is `http://localhost/page.html#tab-2` 'tab-2' will be selected in this case.


Selecting items by the URL
--------------------------
To select an item based on the page URL you can attach the `data-selectbyurl` attribute to the parent item. The a hrefs will then be scanned and the best candidate set as `active`.

	<div data-selectbyurl="li">
		<ul>
			<li><a href="/">Home</a></li>
			<li><a href="/foo">Foo</a></li>
			<li><a href="/bar">Bar</a></li>
			<li><a href="/baz">Baz</a></li>
			<li><a href="/baz/one">Baz Item 1</a></li>
			<li><a href="/baz/two">Baz Item 2</a></li>
			<li><a href="/baz/three">Baz Item 3</a></li>
		</ul>
	</div>

In the above scenario the parent `li` item will be selected if the page URL is `/`, `/foo`, `/bar` and so on.


Addtional parameters:

| Parameter             | Default | Description |
|-----------------------|---------|-------------|
|data-selectbyurl-rough | `0`     | Specifies that 'extra rough' matching should be enabled. Use this option if your tabs only return the first section of the URL of the current page |


Confirming clicks
-----------------
Prompts the user with a message before allowing a link click to pass though to the normal event handler.

	<a href="/somewhere/dangerous" data-confirm="Are you sure you want to go there?">Go somewhere dangerous</a>


FIX: Dropdowns clipping within parent divs
------------------------------------------
Sometimes dropdowns can clip if they are positioned at the very bottom of a parent item where `overflow: hidden` is present. Applying the `dropdown-fix-clipping` style fixes this by rebinding the button that opens the dropdown by a set ID and moving the dropdown into the root body element. This means its placed at the top of the z-order stack and shouldn't overlap any other element on screen.
.

	<a class="btn btn-success dropdown-toggle" data-toggle="dropdown" href="#"> Open dropdown <span class="caret"></span></a>
	<ul class="dropdown-menu dropdown-fix-clipping">
		<li><a href="#">Item foo</li>
		<li><a href="#">Item bar</li>
		<li><a href="#">Item baz</li>
	</ul>
