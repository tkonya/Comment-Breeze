package com.utilities;

import org.codehaus.jettison.json.JSONArray;

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

        removeDuplicates();

//        DatabaseHandler databaseHandler = new DatabaseHandler();

//        addStudentName("Hoon", databaseHandler);
//        addClassName("Universe", databaseHandler);
//        findExtraStudentNames(databaseHandler);

    }

    private static void findNames(DatabaseHandler databaseHandler) {
        Collection<String> comments = databaseHandler.getCollection(new ArrayList<>(), "SELECT comment_text FROM comment_breeze.comments WHERE deleted = 0");

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
            System.out.println("Class Name (C), Student Name (S), None (N)");
            String readLine = readLine();
            if ("C".equals(readLine.toUpperCase())) {
                addClassName(value, databaseHandler);
            } else if ("S".equals(readLine.toUpperCase())) {
                addStudentName(value, databaseHandler);
            }
        }
    }

    private static void findExtraStudentNames(DatabaseHandler databaseHandler) {
        Collection<String> comments = databaseHandler.getCollection(new ArrayList<>(), "SELECT comment_text FROM comment_breeze.comments WHERE deleted = 0");

        HashMap<String, String> found = new HashMap<>();

        Pattern p = Pattern.compile("(STUDENT_NAME [A-Z][A-Za-z-]{1,20})");
        for (String text : comments) {
            Matcher m = p.matcher(text);
            if (m.find()) {
                if (text.startsWith("STUDENT_NAME")) {
                    found.put(text, m.group(1));
                }
            }
        }

        System.out.println("Found " + found.size() + "matches");

        PreparedStatement preparedStatement = null;
        try {
            preparedStatement = databaseHandler.getConnection().prepareStatement("UPDATE comments SET comment_text = ? WHERE comment_text = ?");
            for (String value : found.keySet()) {

                value = value.trim();
                System.out.println("\n" + value);
                String fixedText = value.substring(value.indexOf("STUDENT_NAME") + 13);
                System.out.println(fixedText);

                preparedStatement.setString(1, fixedText);
                preparedStatement.setString(2, value);
                preparedStatement.addBatch();

            }

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

        // update the comments table
        // this isn't perfect but it's good enough
        try {
            preparedStatement = databaseHandler.getConnection().prepareStatement("UPDATE comments SET comment_text = REPLACE(comment_text, ?, 'STUDENT_NAME') WHERE CAST(comment_text AS BINARY) RLIKE ?");
            preparedStatement.setString(1, studentName);
            preparedStatement.setString(2, studentName + "[\\'|’|,|!|:|;| |.]");
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

    public static void removeDuplicates() {

        PreparedStatement preparedStatement = null;
        DatabaseHandler databaseHandler = new DatabaseHandler();
        try {
            JSONArray fetchedComments = databaseHandler.getJSONArrayFor("SELECT COUNT(*) as count, comment_id, comment_text FROM comments WHERE deleted = 0 GROUP BY comment_text ORDER BY COUNT(*) DESC");

            preparedStatement = databaseHandler.getConnection().prepareStatement("UPDATE comments SET deleted = TRUE WHERE comment_text = ? AND comment_id != ?");

            for (int i = 0; i < fetchedComments.length(); ++i) {
                if (fetchedComments.getJSONObject(i).getInt("count") > 1) {
                    System.out.println("Removing duplicates for " + fetchedComments.getJSONObject(i).getString("comment_text"));
                    preparedStatement.setString(1, fetchedComments.getJSONObject(i).getString("comment_text"));
                    preparedStatement.setInt(2, fetchedComments.getJSONObject(i).getInt("comment_id"));
                    preparedStatement.addBatch();
                } else {
                    break;
                }
            }

            preparedStatement.executeBatch();

        } catch (Exception ignore) {
        } finally {
            try {
                preparedStatement.close();
            } catch (SQLException e1) {
                e1.printStackTrace();
            }
        }
    }

}
