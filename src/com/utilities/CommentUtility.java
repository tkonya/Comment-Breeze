package com.utilities;

import java.sql.PreparedStatement;
import java.sql.SQLException;
import java.util.*;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

/**
 * Created by Trevor on 11/29/2015.
 */
public class CommentUtility {

    public static void main(String args[]) {


        DatabaseHandler databaseHandler = new DatabaseHandler();
//        addSchoolName("Kangnampoly", databaseHandler);
        addStudentName("Shion", databaseHandler);
        addStudentName("Jiho", databaseHandler);
//        addClassName("GT3S", databaseHandler);

        Collection<String> comments = databaseHandler.getCollection(new ArrayList<String>(), "SELECT comment_text FROM comment_breeze.comments");

        Set<String> captureSet = new HashSet<>();

        Pattern p = Pattern.compile("([a-zA-Z0-9-]{0,13}STUDENT_NAME[a-zA-Z0-9-]{0,13})");
        for (String text : comments) {
            Matcher m = p.matcher(text);
            if (m.find()) {
                captureSet.add(m.group(1));
            }
        }

        for (String className : captureSet) {
//            addClassName(className, databaseHandler);
            System.out.println(className);
        }

    }

    public static void addStudentName(String studentName, DatabaseHandler databaseHandler) {

        if (databaseHandler == null) {
            databaseHandler = new DatabaseHandler();
        }

        PreparedStatement preparedStatement = null;

        // insert the name into the student_names table
        try {
            preparedStatement = databaseHandler.getConnection().prepareStatement("INSERT INTO student_names (student_name) VALUES (?)");
            preparedStatement.setString(1, studentName);
            preparedStatement.executeUpdate();
        } catch (SQLException e) {
            e.printStackTrace();
        } finally {
            if (preparedStatement != null) {
                try {
                    preparedStatement.close();
                } catch (SQLException ignore) {}
            }
        }

        // update the comments table
        // this isn't perfect but it's good enough
        try {
            preparedStatement = databaseHandler.getConnection().prepareStatement("UPDATE comments SET comment_text = REPLACE(comment_text, ?, 'STUDENT_NAME') WHERE comment_text LIKE ? OR comment_text LIKE ?");
            preparedStatement.setString(1, studentName);
            preparedStatement.setString(2, "% " + studentName + " %");
            preparedStatement.setString(3, studentName + " %");
            int updated = preparedStatement.executeUpdate();
            System.out.println(updated + " rows in comments updated");
        } catch (SQLException e) {
            e.printStackTrace();
        } finally {
            if (preparedStatement != null) {
                try {
                    preparedStatement.close();
                } catch (SQLException ignore) {}
            }
        }

        // make sure we don't have a couple of STUDENT_NAME strings next to each other
        try {
            preparedStatement = databaseHandler.getConnection().prepareStatement(
                    "UPDATE comments SET comment_text = REPLACE(comment_text, ?, 'STUDENT_NAME') WHERE comment_text LIKE ?");
            preparedStatement.setString(1, "STUDENT_NAME STUDENT_NAME");
            preparedStatement.setString(2, "%STUDENT_NAME STUDENT_NAME%");
            preparedStatement.addBatch();
            preparedStatement.setString(1, "STUDENT_NAME - STUDENT_NAME");
            preparedStatement.setString(2, "%STUDENT_NAME - STUDENT_NAME%");
            preparedStatement.addBatch();
            preparedStatement.setString(1, "STUDENT_NAME-STUDENT_NAME");
            preparedStatement.setString(2, "%STUDENT_NAME-STUDENT_NAME%");
            preparedStatement.addBatch();

            preparedStatement.executeBatch();
        } catch (SQLException e) {
            e.printStackTrace();
        } finally {
            if (preparedStatement != null) {
                try {
                    preparedStatement.close();
                } catch (SQLException ignore) {}
            }
        }


    }

    public static void addClassName(String className, DatabaseHandler databaseHandler) {

        if (databaseHandler == null) {
            databaseHandler = new DatabaseHandler();
        }

        PreparedStatement preparedStatement = null;

        // insert the name into the student_names table
        try {
            preparedStatement = databaseHandler.getConnection().prepareStatement("INSERT INTO class_names (class_name) VALUES (?)");
            preparedStatement.setString(1, className);
            preparedStatement.executeUpdate();
        } catch (SQLException e) {
            e.printStackTrace();
        } finally {
            if (preparedStatement != null) {
                try {
                    preparedStatement.close();
                } catch (SQLException ignore) {}
            }
        }

        // update the comments table
        // this isn't perfect but it's good enough
        try {
            preparedStatement = databaseHandler.getConnection().prepareStatement("UPDATE comments SET comment_text = REPLACE(comment_text, ?, 'CLASS_NAME') WHERE comment_text LIKE ? OR comment_text LIKE ?");
            preparedStatement.setString(1, className);
            preparedStatement.setString(2, "% " + className + "%");
            preparedStatement.setString(3, "%" + className + " %");
            int updated = preparedStatement.executeUpdate();
            System.out.println(updated + " rows in comments updated");
        } catch (SQLException e) {
            e.printStackTrace();
        } finally {
            if (preparedStatement != null) {
                try {
                    preparedStatement.close();
                } catch (SQLException ignore) {}
            }
        }


    }

    public static void addSchoolName(String schoolName, DatabaseHandler databaseHandler) {

        if (databaseHandler == null) {
            databaseHandler = new DatabaseHandler();
        }

        PreparedStatement preparedStatement = null;

        // insert the name into the student_names table
        try {
            preparedStatement = databaseHandler.getConnection().prepareStatement("INSERT INTO school_names (school_name) VALUES (?)");
            preparedStatement.setString(1, schoolName);
            preparedStatement.executeUpdate();
        } catch (SQLException e) {
            e.printStackTrace();
        } finally {
            if (preparedStatement != null) {
                try {
                    preparedStatement.close();
                } catch (SQLException ignore) {}
            }
        }

        // update the comments table
        // this isn't perfect but it's good enough
        try {
            preparedStatement = databaseHandler.getConnection().prepareStatement("UPDATE comments SET comment_text = REPLACE(comment_text, ?, 'SCHOOL_NAME') WHERE comment_text LIKE ? OR comment_text LIKE ?");
            preparedStatement.setString(1, schoolName);
            preparedStatement.setString(2, "% " + schoolName + "%");
            preparedStatement.setString(3, "%" + schoolName + " %");
            int updated = preparedStatement.executeUpdate();
            System.out.println(updated + " rows in comments updated");
        } catch (SQLException e) {
            e.printStackTrace();
        } finally {
            if (preparedStatement != null) {
                try {
                    preparedStatement.close();
                } catch (SQLException ignore) {}
            }
        }


    }

}
