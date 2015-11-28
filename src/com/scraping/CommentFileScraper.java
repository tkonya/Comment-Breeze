package com.scraping;

import com.utilities.DatabaseHandler;
import org.apache.poi.extractor.ExtractorFactory;

import java.io.*;
import java.nio.file.Files;
import java.nio.file.Paths;
import java.sql.PreparedStatement;
import java.sql.SQLException;
import java.util.*;

/**
 * Created by Trevor on 10/25/2015.
 */
public class CommentFileScraper {


    public static void main(String[] args) {

        Set<Comment> comments = getComments(true);

        saveComments(comments);

        System.out.println();

    }

    private static void saveComments(Set<Comment> comments) {
        DatabaseHandler databaseHandler = new DatabaseHandler();
        try {
            PreparedStatement preparedStatement = databaseHandler.getConnection().prepareStatement("INSERT INTO comments (comment_text, original_text, origin) VALUES (?, ?, ?)");

            for (Comment comment : comments) {
                preparedStatement.setString(1, comment.getCommentText());
                preparedStatement.setString(2, comment.getOriginalCommentText());
                preparedStatement.setString(3, comment.getOriginFile());
                preparedStatement.addBatch();
            }

            preparedStatement.executeBatch();
            preparedStatement.close();


        } catch (SQLException e) {
            e.printStackTrace();
        }
    }

    private static HashSet<String> getWordList() {
        try {
            return fileToHashSet("C:\\Users\\Trevor\\Documents\\SpiderOak Hive\\Development\\Comment Scraper\\dictionary.txt");
        } catch (FileNotFoundException e) {
            e.printStackTrace();
        }
        return null;
    }

    private static HashSet<String> getNameList() {
        try {
            return fileToHashSet("C:\\Users\\Trevor\\Documents\\SpiderOak Hive\\Development\\Comment Scraper\\Given-Names.txt");
        } catch (FileNotFoundException e) {
            e.printStackTrace();
        }
        return null;
    }

    private static HashSet<String> fileToHashSet(String location) throws FileNotFoundException {
        HashSet<String> wordSet = new HashSet<>();
        BufferedReader br = new BufferedReader(new FileReader(location));
        try {
            String line = br.readLine();
            while (line != null) {
                wordSet.add(line.trim());
                line = br.readLine();
            }
        } catch (IOException e) {
            e.printStackTrace();
        } finally {
            try {
                br.close();
            } catch (IOException e) {
                e.printStackTrace();
            }
        }
        return wordSet;
    }

    private static Map<String, String> getFileTextMap() {
        Map<String, String> documentList = new HashMap<>();
        try {
            Files.walk(Paths.get("C:\\Users\\Trevor\\Documents\\SpiderOak Hive\\Development\\Comment Scraper\\Flat Comments")).forEach(filePath -> {
                if (Files.isRegularFile(filePath)) {
                    System.out.println(filePath);

                    try {
                        File theFile = filePath.toFile();
                        InputStream inputStream = new FileInputStream(theFile);

                        String plainText = ExtractorFactory.createExtractor(inputStream).getText();

                        String fileName = filePath.toString().substring(filePath.toString().lastIndexOf("\\") + 1);

                        documentList.put(fileName, plainText);

                    } catch (Exception e) {
                        e.printStackTrace();
                    }

                }
            });
        } catch (IOException e) {
            e.printStackTrace();
        }
        return documentList;
    }

    private static Set<Comment> getComments(boolean saveAfterEach) {
        Set<Comment> comments = new HashSet<>();
        Map<String, String> documentList = getFileTextMap();
        Set<String> nameList = getNameList();

        for (Map.Entry<String, String> entry : documentList.entrySet()) {

            String documentString = replaceNames(entry.getValue(), nameList).replaceAll("\\s+", " ");

            String [] sentences = documentString.split("(?<=\\n)|(?<=\\.)|(?<=!)|(?<=\\?)");

            System.out.println("Found " + sentences.length + " sentences in " + entry.getKey());
            System.out.println();

            String studentName = "not a real name!!!!!!!!!!!!";
            String prepend = null;
            for (String sentence : sentences) {

                String originalCommentText = sentence;
                sentence = sentence.trim();

                if (prepend != null) {
                    sentence = prepend + sentence;
                    prepend = null;
                }

                if (sentence.length() < 2) {
                    continue;
                }

                if (sentence.length() < 16) {

                    sentence = sentence.replaceAll("[^A-Za-z \\.]", "").trim();

                    if (sentence.contains("STUDENT_NAME") || sentence.length() < 3) {
                        continue;
                    } else if (sentence.equals(studentName)) {
                        // join with next sentence
                        prepend = sentence;
                        continue;
                    } else {
                        System.out.println("Found student name: " + sentence);
                        studentName = sentence.replace(".", "");
                        continue;
                    }

                }

                if (sentence.contains(studentName)) {
                    sentence = sentence.replace(studentName, "STUDENT_NAME");
                }

                if (sentence.contains("STUDENT_NAME")) {
                    sentence = sentence.replace("STUDENT_NAME – STUDENT_NAME", "STUDENT_NAME");
                }

                System.out.println("COMMENT: " + sentence);
                comments.add(new Comment(entry.getKey(), cleanComment(sentence), originalCommentText));

            }

            if (saveAfterEach) {
                System.out.println("saving comments for " + entry.getKey());
                saveComments(comments);
                comments = new HashSet<>();
            }

        }

        return comments;
    }

    private static String replaceNames(String wholeDocumentString, Set<String> nameList) {
        String cleanString = wholeDocumentString.replaceAll("[A-Z][a-z]{0,10} [A-Z]\\.", "STUDENT_NAME");
        for (String name : nameList) {
            // todo: make this a regex search
            if (cleanString.contains(" " + name + " ")) {
                System.out.println("replacing " + name);
                cleanString = cleanString.replaceAll(name, "STUDENT_NAME");
            }
        }
        return cleanString;
    }

    // special processing due to formatting or edge cases
    private static String cleanComment(String comment) {

        if (comment.startsWith("STUDENT_NAME - ")) {
            comment = comment.replace("STUDENT_NAME - ", "");
        }
        if (comment.startsWith("STUDENT_NAME-")) {
            comment = comment.replace("STUDENT_NAME-", "");
        }
        if (comment.startsWith("STUDENT_NAME:")) {
            comment = comment.replace("STUDENT_NAME:", "");
        }

        return comment.trim();
    }

}
