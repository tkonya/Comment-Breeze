**Comment Breeze** is a web app I made to help my friends and other ESL / TESOL teachers build report card comments.

**Setting up the database:**

Database connection properties should be in a file called app.properties in com.utilities. It should look like this:

# Your database settings
database-host = jdbc:mysql://theaddressofyourdatabase:3306/comment_breeze
database-user = awesome-admin-9000
database-password = password1234

There should also be a setting in there for editing password like this:

editing-password = asdf1234

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
  comment_id int(11) NOT NULL AUTO_INCREMENT,
  comment_text varchar(255) NOT NULL,
  original_text varchar(255) DEFAULT NULL COMMENT 'What the text looked like before we cleaned it',
  pos_neg tinyint(4) DEFAULT NULL COMMENT 'How negative or positive a comment is, rated from -2 to +2, -2 is most negative, 0 is neutral, +2 is most positive',
  origin varchar(255) NOT NULL,
  audited date DEFAULT NULL COMMENT 'The last time this comment was audited by a human',
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
AVG_ROW_LENGTH = 16384
CHARACTER SET utf8
COLLATE utf8_general_ci;


CREATE TABLE comment_breeze.student_names (
  student_name varchar(255) NOT NULL,
  added_on datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (student_name)
)
ENGINE = INNODB
AVG_ROW_LENGTH = 103
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