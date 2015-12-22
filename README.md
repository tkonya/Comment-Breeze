**Comment Breeze**

This is a web app I made to help my friends and other ESL / TESOL teachers build report card comments. With a database full of comments it allows you to search and filter though them to find ones you want and build a whole report card with it.

**Setting up the database:**

Database connection properties should be in a file called app.properties in com.utilities. It should look like this:

_database-host = jdbc:mysql://theaddressofyourdatabase:3306/comment_breeze
database-user = awesome-admin-9000
database-password = password1234_

There should also be a setting in there for editing password like this:

_editing-password = asdf1234_

Here are the tables contained in the database:


CREATE TABLE comment_breeze.class_names (
  class_name varchar(255) NOT NULL DEFAULT '',
  added_on datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (class_name)
)
ENGINE = INNODB
CHARACTER SET utf8
COLLATE utf8_general_ci;


CREATE TABLE comment_breeze.comment_tags (
  comment_id int(11) NOT NULL,
  tag varchar(255) NOT NULL,
  PRIMARY KEY (comment_id, tag)
)
ENGINE = INNODB
CHARACTER SET utf8
COLLATE utf8_general_ci;


CREATE TABLE comment_breeze.comments (
  comment_id int(11) NOT NULL AUTO_INCREMENT COMMENT 'Auto gen ID',
  comment_text varchar(255) NOT NULL COMMENT 'The text we show, this is essentially my internal backup of comments',
  verified_comment_text varchar(255) NOT NULL COMMENT 'Comment text safe from normal user editing',
  pos_neg tinyint(4) DEFAULT NULL COMMENT 'How negative or positive a comment is, rated from -1 to +1',
  verified_pos_neg tinyint(4) DEFAULT NULL COMMENT 'pos_neg safe from normal user editing',
  last_update datetime DEFAULT NULL COMMENT 'The last time this comment was edited by a human',
  last_update_ip varchar(255) DEFAULT NULL COMMENT 'The last IP address to edit this comment',
  origin varchar(255) NOT NULL COMMENT 'Where this comment came from, for tracking purposes',
  deleted bit(1) DEFAULT b'0' COMMENT 'Whether a user has deleted this comment or not',
  PRIMARY KEY (comment_id)
)
ENGINE = INNODB
CHARACTER SET utf8
COLLATE utf8_general_ci
ROW_FORMAT = DYNAMIC;


CREATE TABLE comment_breeze.school_names (
  school_name varchar(50) NOT NULL,
  added_on datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (school_name)
)
ENGINE = INNODB
CHARACTER SET utf8
COLLATE utf8_general_ci;


CREATE TABLE comment_breeze.student_names (
  student_name varchar(255) NOT NULL,
  added_on datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (student_name)
)
ENGINE = INNODB
CHARACTER SET utf8
COLLATE utf8_general_ci;


CREATE TABLE comment_breeze.user_accounts (
  id int(11) DEFAULT NULL,
  user_name varchar(50) DEFAULT NULL,
  hashed_password varchar(255) DEFAULT NULL
)
ENGINE = INNODB
CHARACTER SET utf8
COLLATE utf8_general_ci;