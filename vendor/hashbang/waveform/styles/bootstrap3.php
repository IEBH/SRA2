<?
// Generic bootstrap 3.x theme for Waveform
$this->Style('errs', array('TAG' => 'div', 'class' => 'alert alert-error', 'PREFIX' => '<ul>', 'SUFFIX' => '</ul>'));
$this->Style('errs_row', array('TAG' => 'li'));
$this->Style('form', array('TAG' => 'form', 'method' => 'POST', 'enctype' => 'multipart/form-data', 'class' => 'form-horizontal', 'PREFIX' => '<fieldset>', 'SUFFIX' => '</fieldset>', 'action' => $_SERVER['REQUEST_URI']));
$this->Style('table', array('SKIP' => 1));
$this->Style('table_row', array('TAG' => 'div', 'class' => 'form-group'));
$this->Style('table_row_err', array('class' => 'form-group has-error'));
$this->Style('table_label', array('TAG' => 'label', 'class' => 'col-sm-2 control-label'));
$this->Style('table_input', array('TAG' => 'div', 'class' => 'col-sm-10'));
$this->Style('table_input_err', array('SUFFIX' => '<span class="help-inline text-danger">{$errs}</span>'));
$this->Style('table_group', array('TAG' => 'legend', 'class' => 'waveform-group'));
$this->Style('table_group_label', array('SKIP' => 1));
$this->Style('table_span', array('TAG' => 'div', 'class' => 'waveform-span'));
$this->Style('form_submit', array('TAG' => 'button', 'type' => 'submit', 'class' => 'pull-right btn btn-primary', 'CONTENT' => '<i class="icon-ok"></i> Save', 'LEADIN' => '<div class="form-actions">', 'LEADOUT' => '</div>'));

$this->Style(WAVEFORM_TYPE_STRING, array('class' => 'form-control'));
$this->Style(WAVEFORM_TYPE_INT, array('class' => 'form-control'));
$this->Style(WAVEFORM_TYPE_FLOAT, array('class' => 'form-control'));
$this->Style(WAVEFORM_TYPE_TEXT, array('class' => 'form-control'));
$this->Style(WAVEFORM_TYPE_LABEL, array('class' => 'form-control'));
$this->Style(WAVEFORM_TYPE_FILE, array('class' => 'form-control'));
$this->Style(WAVEFORM_TYPE_PASSWORD, array('class' => 'form-control'));
$this->Style(WAVEFORM_TYPE_EPOC, array('class' => 'form-control'));
$this->Style(WAVEFORM_TYPE_CHECKBOX, array('class' => 'form-control'));
