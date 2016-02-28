package com.utilities;

import edu.stanford.nlp.ling.HasWord;
import edu.stanford.nlp.ling.Sentence;
import edu.stanford.nlp.ling.TaggedWord;
import edu.stanford.nlp.tagger.maxent.MaxentTagger;
import org.codehaus.jettison.json.JSONArray;
import org.codehaus.jettison.json.JSONException;

import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.io.StringReader;
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
//        replaceHer(databaseHandler);
        replaceHis(databaseHandler);
//        removeDuplicates();


//        addStudentName("Hoon", databaseHandler);
//        addClassName("Universe", databaseHandler);
//        findExtraStudentNames(databaseHandler);

    }

    private static void replaceHer(DatabaseHandler databaseHandler) {

        MaxentTagger maxentTagger = new MaxentTagger("C:\\Users\\Trevor\\IdeaProjects\\Comment Breeze 4\\src\\stanford_nlp\\stanford-postagger-2015-12-09\\models\\wsj-0-18-bidirectional-nodistsim.tagger");


        JSONArray jsonArray = databaseHandler.getJSONArrayFor("SELECT comment_id, comment_text FROM comments WHERE deleted = FALSE AND (comment_text LIKE '%her%' OR comment_text LIKE '%Her%') AND comment_text NOT LIKE '%/%'");

        // iterate over comments
        int correct = 0;
        int total = 0;
        for (int i = 0; i < jsonArray.length(); ++i) {

            try {
                int commentID = jsonArray.getJSONObject(i).getInt("comment_id");
                String commentText = jsonArray.getJSONObject(i).getString("comment_text");
                String correctedText = jsonArray.getJSONObject(i).getString("comment_text");

                List<List<HasWord>> list = MaxentTagger.tokenizeText(new StringReader(commentText));
                List<TaggedWord> tSentence = maxentTagger.tagSentence(list.get(0));

                // iterate through the tokens (words / punctuation)
                int increment = 0;
                for (int j = 0; j < tSentence.size(); ++j) {
                    String word = tSentence.get(j).toString("|").split("\\|")[0];
                    String label = tSentence.get(j).toString("|").split("\\|")[1];

                    if ("her".equals(word.toLowerCase())) {
                        int beginPosition = tSentence.get(j).beginPosition();
                        int endPosition = tSentence.get(j).endPosition();

//                        System.out.println(word + " - " + beginPosition + " - " + endPosition);

                        String firstHalf = correctedText.substring(0, beginPosition + increment);
                        String secondHalf = correctedText.substring(beginPosition + increment);
                        increment += 3;

                        if ("PRP$".equals(label)) {
                            if ("her".equals(word)) {
                                correctedText = firstHalf + secondHalf.replaceFirst("her|Her", "his/her");
                            } else if ("Her".equals(word)) {
                                correctedText = firstHalf + secondHalf.replaceFirst("her|Her", "His/Her");
                            }
                        } else if ("PRP".equals(label)) {
                            if ("her".equals(word)) {
                                correctedText = firstHalf + secondHalf.replaceFirst("her|Her", "him/her");
                            } else if ("Her".equals(word)) {
                                correctedText = firstHalf + secondHalf.replaceFirst("her|Her", "Him/Her");
                            }
                        }

                    }

                }

                if (!commentText.equals(correctedText)) {
                    System.out.println(++correct + " - " + commentID + " - " + correctedText);
                    correctSentence(databaseHandler, commentID, correctedText);
                }

//                if (!commentText.equals(correctedText)) {
//                    System.out.println(commentText);
//                    System.out.println(correctedText);
//                    System.out.println("Is this correct? y/n");
//
//                    String readLine = readLine();
//                    if ("y".equals(readLine.toLowerCase())) {
//                        System.out.println("Correcting comment ID " + commentID);
//                        correctSentence(databaseHandler, commentID, correctedText);
//                        ++correct;
//                    }
//                    ++total;
//
//                    System.out.println(correct + "/" + total + " correct");
//                    System.out.println();
//                }

            } catch (JSONException e) {
                e.printStackTrace();
            }

        }
        System.out.println();
    }

    private static void replaceHis(DatabaseHandler databaseHandler) {

        Map<String, String> typeMap = new HashMap<>();
        typeMap.put("CC","Coordinating conjunction");
        typeMap.put("CD","Cardinal number");
        typeMap.put("DT","Determiner");
        typeMap.put("EX","Existential there");
        typeMap.put("FW","Foreign word");
        typeMap.put("IN","Preposition or subordinating conjunction");
        typeMap.put("JJ","Adjective");
        typeMap.put("JJR","Adjective, comparative");
        typeMap.put("JJS","Adjective, superlative");
        typeMap.put("LS","List item marker");
        typeMap.put("MD","Modal");
        typeMap.put("NN","Noun, singular or mass");
        typeMap.put("NNS","Noun, plural");
        typeMap.put("NNP","Proper noun, singular");
        typeMap.put("NNPS","Proper noun, plural");
        typeMap.put("PDT","Predeterminer");
        typeMap.put("POS","Possessive ending");
        typeMap.put("PRP","Personal pronoun");
        typeMap.put("PRP$","Possessive pronoun");
        typeMap.put("RB","Adverb");
        typeMap.put("RBR","Adverb, comparative");
        typeMap.put("RBS","Adverb, superlative");
        typeMap.put("RP","Particle");
        typeMap.put("SYM","Symbol");
        typeMap.put("TO","to");
        typeMap.put("UH","Interjection");
        typeMap.put("VB","Verb, base form");
        typeMap.put("VBD","Verb, past tense");
        typeMap.put("VBG","Verb, gerund or present participle");
        typeMap.put("VBN","Verb, past participle");
        typeMap.put("VBP","Verb, non-3rd person singular present");
        typeMap.put("VBZ","Verb, 3rd person singular present");
        typeMap.put("WDT","Wh-determiner");
        typeMap.put("WP","Wh-pronoun");
        typeMap.put("WP$","Possessive wh-pronoun");
        typeMap.put("WRB","Wh-adverb");


        MaxentTagger maxentTagger = new MaxentTagger("C:\\Users\\Trevor\\IdeaProjects\\Comment Breeze 4\\src\\stanford_nlp\\stanford-postagger-2015-12-09\\models\\wsj-0-18-bidirectional-nodistsim.tagger");


        JSONArray jsonArray = databaseHandler.getJSONArrayFor("SELECT comment_id, comment_text FROM comments WHERE deleted = FALSE AND (comment_text LIKE '%his%' OR comment_text LIKE '%His%') AND comment_text NOT LIKE '%/%' LIMIT 100");

        // iterate over comments
        int correct = 0;
        int total = 0;
        for (int i = 0; i < jsonArray.length(); ++i) {

            try {
                int commentID = jsonArray.getJSONObject(i).getInt("comment_id");
                String commentText = jsonArray.getJSONObject(i).getString("comment_text");
                String correctedText = jsonArray.getJSONObject(i).getString("comment_text");

                List<List<HasWord>> list = MaxentTagger.tokenizeText(new StringReader(commentText));
                List<TaggedWord> tSentence = maxentTagger.tagSentence(list.get(0));

                // iterate through the tokens (words / punctuation)
                int increment = 0;
                for (int j = 0; j < tSentence.size(); ++j) {
                    String word = tSentence.get(j).toString("|").split("\\|")[0];
                    String label = tSentence.get(j).toString("|").split("\\|")[1];

                    System.out.println(word + "\t\t\t" + label + " (" + typeMap.get(label) + ")");


//                    if ("his".equals(word.toLowerCase())) {
//                        int beginPosition = tSentence.get(j).beginPosition();
////                        int endPosition = tSentence.get(j).endPosition();
//
////                        System.out.println(word + " - " + beginPosition + " - " + endPosition);
//
//                        String firstHalf = correctedText.substring(0, beginPosition + increment);
//                        String secondHalf = correctedText.substring(beginPosition + increment);
//                        increment += 3;
//
//                        boolean shouldBeHers = false;
//
//
//
//
//
//                        if (shouldBeHers) {
//                            if ("his".equals(word)) {
//                                correctedText = firstHalf + secondHalf.replaceFirst("her|Her", "his/hers");
//                            } else if ("His".equals(word)) {
//                                correctedText = firstHalf + secondHalf.replaceFirst("her|Her", "His/Hers");
//                            }
//                        } else if ("PRP".equals(label)) {
//                            if ("his".equals(word)) {
//                                correctedText = firstHalf + secondHalf.replaceFirst("her|Her", "his/her");
//                            } else if ("His".equals(word)) {
//                                correctedText = firstHalf + secondHalf.replaceFirst("her|Her", "His/Her");
//                            }
//                        }
//
//                    }

                }
                System.out.println("\n\n");

//                if (!commentText.equals(correctedText)) {
//                    System.out.println(++correct + " - " + commentID + " - " + correctedText);
//                    correctSentence(databaseHandler, commentID, correctedText);
//                }

                if (!commentText.equals(correctedText)) {
                    System.out.println(commentText);
                    System.out.println(correctedText);
                    System.out.println("Is this correct? y/n");

                    String readLine = readLine();
                    if ("y".equals(readLine.toLowerCase())) {
                        System.out.println("Correcting comment ID " + commentID);
                        correctSentence(databaseHandler, commentID, correctedText);
                        ++correct;
                    }
                    ++total;

                    System.out.println(correct + "/" + total + " correct");
                    System.out.println();
                }

            } catch (JSONException e) {
                e.printStackTrace();
            }

        }
        System.out.println();
    }

    private static void correctSentence(DatabaseHandler databaseHandler, int commentID, String commentText) {
        PreparedStatement preparedStatement = null;
        try {
            preparedStatement = databaseHandler.getConnection().prepareStatement("UPDATE comments SET comment_text = ? WHERE comment_id = ?");
            preparedStatement.setString(1, commentText);
            preparedStatement.setInt(2, commentID);
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
