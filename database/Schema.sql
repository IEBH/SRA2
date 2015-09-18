-- Headers {{{
SET storage_engine=MYISAM;
-- }}}
-- CacheResults {{{
DROP TABLE IF EXISTS wwwcache;
CREATE TABLE wwwcache(
	id int primary key auto_increment,
	hash char(32),
	age int,
	content text
);
CREATE INDEX wwwcache_hash ON wwwcache(hash);
-- }}}
-- Users {{{
-- NOTE: passhash = <8 hex salt><md5>
-- 1ae4f82fe031f85fbff0abf9812358c755c36c2d = 'password'
DROP TABLE IF EXISTS users;
CREATE TABLE users (
	userid int primary key auto_increment, 
	username varchar(50),
	fname varchar(50),
	lname varchar(50), 
	passhash char(40),
	passhash2 char(40),
	email varchar(100),
	status enum ('active', 'deleted') default 'active', 
	role enum ('user', 'admin', 'root') default 'user',
	created int,
	edited int,
	lastlogin int
);
INSERT INTO users VALUES (null, 'mc', ' Matt', 'Carter', 'qwaszx', null, 'matt@mfdc.biz', 'active', 'root', 1364342313, 1364342313, 1364342313);
-- }}}
-- Libraries {{{
DROP TABLE IF EXISTS libraries;
CREATE TABLE libraries (
	libraryid int primary key auto_increment, 
	title varchar(200),
	status enum ('active', 'dedupe', 'deduped', 'deleted') default 'active', 
	debug enum ('active', 'inactive') default 'inactive',
	dedupe_refid INT,
	dedupe_refid2 INT,
	created int,
	edited int
);
CREATE INDEX libraries_status ON libraries(status);
INSERT INTO libraries VALUES (null, 'Sample library', 'active', 'inactive', null, null, null, null);
-- }}}
-- User2Library {{{
DROP TABLE IF EXISTS user2library;
CREATE TABLE user2library (
	libraryid int,
	userid int,
	created int,
	PRIMARY KEY(libraryid, userid)
);
CREATE INDEX user2ibrary_userid ON user2library(userid);
CREATE INDEX user2ibrary_libraryid ON user2library(libraryid);
INSERT INTO user2library VALUES (1, 1, null);
-- }}}
-- References {{{
-- NOTES: references.yourref is a indexed reference. This is usually used to determine if a search term exists within a reference (i.e. did I add this WHO result to my library)
DROP TABLE IF EXISTS `references`;
CREATE TABLE `references` (
	referenceid int primary key auto_increment, 
	libraryid int,
	status enum ('active', 'dupe', 'deleted') default 'active', 
	created int,
	edited int,
	title varchar(200),
	authors text,
	yourref varchar(200),
	label varchar(100),
	data text,
	altdata text,
	referencetagid int
);
CREATE INDEX references_libraryid ON `references`(libraryid);
CREATE INDEX references_status ON `references`(status);
CREATE INDEX references_yourref ON `references`(yourref);
CREATE INDEX references_label ON `references`(label);
CREATE INDEX references_referencetag ON `references`(referencetagid);
-- }}}
-- ReferenceTags {{{
DROP TABLE IF EXISTS `referencetags`;
CREATE TABLE `referencetags` (
	referencetagid int PRIMARY KEY AUTO_INCREMENT,
	libraryid int,
	title varchar(200)
);
CREATE INDEX refrencetags_libraryid ON referencetags(libraryid);
-- }}}
-- Logs {{{
DROP TABLE IF EXISTS logs;
CREATE TABLE logs(
	userid int,
	icon varchar(50),
	text text,
	created int
);
-- }}}
-- Pages {{{
DROP TABLE IF EXISTS pages;
CREATE TABLE pages (
	pageid int primary key auto_increment,
	code varchar(100),
	title varchar(255),
	text text,
	type enum('html', 'text') DEFAULT 'text',
	userid int,
	created int,
	edited int,
	sort_order int
);
CREATE INDEX pages_code ON pages(code);
-- Core
INSERT INTO pages VALUES (null, 'core/panic', 'Site Panic', 'Something has gone horribly wrong with [site.name]\n\n[panic.text]\n\n---TRACE---\n[panic.trace]\n---END TRACE---\n', 'text', 1, null, null, 0);
INSERT INTO pages VALUES (null, 'libraries/share', 'Share Library', '[user.name] wishes to share the library [library.name] ([library.references] references) with you.\n\nClick the link below to manage the reference library.\n\n    [share.url]\n\n\nYou have three days to click the above link before it expires.\n\nCREBP Systematic Review Creator', 'text', 1, null, null, 0);
INSERT INTO pages VALUES (null, 'email/recover', 'Recover your password', 'Hello [user.name],\n\nSomeone has requested a new password for your account iwth [site.title]. We have generated a new password below. If you did not request this then ignore this email, your existing password will continue working.\n\nNew Password: [user.password]\n\n\n\Regards,\n\nThe CREBP SRA website', 'text', 1, null, null, 0);
-- }}}
-- URLPayloads {{{
-- NOTE: Used to track share links to libraries
DROP TABLE IF EXISTS urlpayloads;
CREATE TABLE urlpayloads (
	urlpayloadid int primary key auto_increment,
	code varchar(100),
	expiry int,
	command enum('share'),
	payloadid int,
	created int,
	status ENUM('unclaimed', 'claimed', 'expired') DEFAULT 'unclaimed',
	userid int
);
CREATE INDEX urlpayloads_code ON urlpayloads(code);
CREATE INDEX urlpayloads_status ON urlpayloads(status);
-- }}}
