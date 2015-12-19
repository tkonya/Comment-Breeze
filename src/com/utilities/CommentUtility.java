package com.utilities;

import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.sql.PreparedStatement;
import java.sql.SQLException;
import java.sql.Statement;
import java.util.*;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

/**
 * Created by Trevor on 11/29/2015.
 */
public class CommentUtility {

    public static void main(String args[]) {

        DatabaseHandler databaseHandler = new DatabaseHandler();

        // rescrubbing student names
//        Collection<String> studentNames = databaseHandler.getCollection(new ArrayList<String>(), "SELECT student_name FROM student_names");
//        for (String name : studentNames) {
//            addStudentName(name, databaseHandler);
//        }


        Collection<String> comments = databaseHandler.getCollection(new ArrayList<String>(), "SELECT comment_text FROM comment_breeze.comments WHERE deleted = 0");

        Set<String> captureSet = new HashSet<>();

        Pattern p = Pattern.compile("( [A-Z][A-Za-z-]{1,20})");
        for (String text : comments) {
            Matcher m = p.matcher(text);
            if (m.find()) {
                captureSet.add(m.group(1));
            }
        }

        System.out.println("Found " + captureSet.size() + "matches");

        for (String value : captureSet) {
            value = value.trim();
            System.out.println("\n" + value);
            System.out.println("Class Name (C), Student Name (S), School Name (K), None (N)");
            String readLine = readLine();
            if ("C".equals(readLine.toUpperCase())) {
                addClassName(value, databaseHandler);
            } else if ("S".equals(readLine.toUpperCase())) {
                addStudentName(value, databaseHandler);
            } else if ("K".equals(readLine.toUpperCase())) {
                addSchoolName(value, databaseHandler);
            }
        }

    }

    private static void autoRateComments(DatabaseHandler databaseHandler) {

        if (databaseHandler == null) {
            databaseHandler = new DatabaseHandler();
        }

        try {
            Statement updateRatings = databaseHandler.getConnection().createStatement();
            updateRatings.execute("UPDATE comments SET pos_neg = 2 WHERE pos_neg IS NULL AND (comment_text LIKE '%excellent%' OR comment_text LIKE '%wonderful%' OR comment_text LIKE '%awesome%')");
        } catch (SQLException e) {
            e.printStackTrace();
        }


    }

    private static String readLine() {
        String string = "";
        InputStreamReader input = new InputStreamReader(System.in);
        BufferedReader reader = new BufferedReader(input);

        // read in user input
        try {
            string = reader.readLine();
        } catch (Exception e){
            e.printStackTrace();
        }

        return string;
    }

    public static void addStudentName(String studentName, DatabaseHandler databaseHandler) {
        System.out.println("Adding student name: " + studentName);

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
            preparedStatement = databaseHandler.getConnection().prepareStatement("UPDATE comments SET comment_text = REPLACE(comment_text, ?, 'STUDENT_NAME') WHERE CAST(comment_text AS BINARY) RLIKE ?");
            preparedStatement.setString(1, studentName);
            preparedStatement.setString(2, studentName + "[\\'|’|,|!|:| |.]");
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
        System.out.println("Adding class name: " + className);

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
        System.out.println("Adding school name: " + schoolName);

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
