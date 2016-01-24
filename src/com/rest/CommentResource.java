package com.rest;

import com.utilities.AppProperties;
import com.utilities.LockoutHandler;
import org.codehaus.jettison.json.JSONArray;
import com.utilities.DatabaseHandler;
import org.codehaus.jettison.json.JSONException;
import org.codehaus.jettison.json.JSONObject;

import javax.servlet.http.HttpServletRequest;
import javax.ws.rs.*;
import javax.ws.rs.core.Context;
import javax.ws.rs.core.MediaType;
import javax.ws.rs.core.Response;
import java.sql.PreparedStatement;
import java.sql.SQLException;
import java.sql.Types;
import java.text.NumberFormat;
import java.time.LocalDateTime;
import java.util.List;

/**
 * Created by Trevor on 10/16/2015.
 */

@Path("/comments")
public class CommentResource {

    private static JSONArray comments;
    private static JSONArray commonTags;
    private static LocalDateTime lastCached = LocalDateTime.now();
    private static boolean updated = false;
    private static String editingPasswordAnswer;

    private static LockoutHandler lockoutHandler = new LockoutHandler();

    /**
     * @param size 0 = all, any positive number = the number of comments you want
     * @throws JSONException
     */
    @GET
    @Produces("application/json")
    public Response getComments(@Context HttpServletRequest request, @QueryParam("size") Integer size) throws JSONException {

        DatabaseHandler databaseHandler = null;
        PreparedStatement preparedStatement = null;
        try {

            // get the comments object if necessary
            if (updated || lastCached.isBefore(LocalDateTime.now().minusDays(1)) || comments == null || comments.length() == 0) {
                System.out.println("Has been over 1 day, will reload cache");

                databaseHandler = new DatabaseHandler();
                JSONArray fetchedComments = databaseHandler.getJSONArrayFor("SELECT comment_id, comment_text, flagged, COALESCE(verified_pos_neg, pos_neg) as pos_neg FROM comment_breeze.comments WHERE deleted = FALSE GROUP BY comment_text ORDER BY RAND()");

                if (fetchedComments != null && fetchedComments.length() > 0) {

                    // get the tags here
                    JSONArray allTags = databaseHandler.getJSONArrayFor("SELECT comment_id, tag FROM comment_tags WHERE deleted = FALSE");
                    for (int i = 0; i < allTags.length(); ++i) {
                        for (int j = 0; j < fetchedComments.length(); ++j) {
                            if (fetchedComments.getJSONObject(j).getString("comment_id").equals(allTags.getJSONObject(i).getString("comment_id"))) {

                                if (!fetchedComments.getJSONObject(j).has("tags")) {
                                    fetchedComments.getJSONObject(j).put("tags", new JSONArray());
                                }

                                fetchedComments.getJSONObject(j).getJSONArray("tags").put(allTags.getJSONObject(i).getString("tag"));
                                break;
                            }
                        }
                    }

                    // count 20 most common tags
                    commonTags = databaseHandler.getJSONArrayFor("SELECT tag FROM comment_breeze.comment_tags WHERE deleted = FALSE GROUP BY tag ORDER BY COUNT(*) DESC LIMIT 30");

                    comments = fetchedComments;
                    updated = false;
                } else {
                    System.out.println("Failed to reload comments");
                }
                databaseHandler.closeConnection();

            }

        } finally {
            try {
                if (preparedStatement != null) {
                    preparedStatement.close();
                }
            } catch (SQLException e) {
                e.printStackTrace();
            }
            if (databaseHandler != null) {
                databaseHandler.closeConnection();
            }
        }

        JSONObject jsonObject = new JSONObject();
        jsonObject.put("common_tags", commonTags);
        jsonObject.put("total_size", comments.length());
        jsonObject.put("total_size_unformatted", comments.length());

        if (size == null || size < 1 || size > comments.length()) {
            jsonObject.put("comments", comments);
            jsonObject.put("all_comments_loaded", true);
        } else {
            System.out.println("Getting subarray of size " + size);
            JSONArray commentSubArray = new JSONArray();
            for (int i = 0; i < size; ++i) {
                commentSubArray.put(comments.getJSONObject(i));
            }
            jsonObject.put("comments", commentSubArray);
            jsonObject.put("all_comments_loaded", false);
        }

        return Response.ok(jsonObject.toString()).build();
    }

    @PUT
    @Consumes(MediaType.APPLICATION_JSON)
    @Produces(MediaType.APPLICATION_JSON)
    public Response updateComment(@Context HttpServletRequest request, @QueryParam("comment") JSONObject comment, @QueryParam("editing_password_try") String editingPasswordTry) throws JSONException {

        JSONObject jsonObject = new JSONObject();

        String ipAddress = request.getRemoteAddr();

        // see if we have the editing password set
        if (editingPasswordAnswer == null || editingPasswordAnswer.isEmpty()) {
            AppProperties appProperties = new AppProperties();
            editingPasswordAnswer = appProperties.getEditingPassword();
        }

        boolean canEdit = false;
        if (editingPasswordAnswer != null && editingPasswordTry != null && !editingPasswordTry.isEmpty()) {
            LocalDateTime ipLockOutEndTime = lockoutHandler.getIdLockoutEndTime(ipAddress);
            if (ipLockOutEndTime != null) {
                jsonObject.put("message", "Password attempts locked out until " + ipLockOutEndTime.toString());
                jsonObject.put("passfail", true);
            } else {
                if (editingPasswordAnswer.equals(editingPasswordTry)) {
                    canEdit = true;
                } else {
                    jsonObject.put("passfail", true);
                    lockoutHandler.addFail(ipAddress);
                    writePasswordFail(ipAddress);

                    ipLockOutEndTime = lockoutHandler.getIdLockoutEndTime(ipAddress);

                    if (ipLockOutEndTime != null) {
                        jsonObject.put("message", "Max password fail attempts reached - locking out until " + ipLockOutEndTime.toString());
                    } else {
                        jsonObject.put("message", "Incorrect password; " + lockoutHandler.getIdLockoutTriesLeft(ipAddress) + " more tries until lockout");
                    }
                }
            }
        }

        DatabaseHandler databaseHandler = null;
        PreparedStatement preparedStatement = null;
        try {

            // if a password attempt ended in failure we don't try
            if (!jsonObject.has("passfail")) {

                databaseHandler = new DatabaseHandler();
                preparedStatement = databaseHandler.getConnection().prepareStatement(
                    "UPDATE comments SET comment_text = IFNULL(?, comment_text), pos_neg = IFNULL(?, pos_neg), verified_pos_neg = IFNULL(?, pos_neg), deleted = IFNULL(?, deleted), last_update_ip = IFNULL(?, last_update_ip), last_update = CURRENT_TIMESTAMP, flagged = IFNULL(?, flagged) WHERE comment_id = ?"
                );

                if (comment.has("comment_text") && canEdit) {
                    preparedStatement.setString(1, comment.getString("comment_text"));
                } else {
                    preparedStatement.setNull(1, Types.VARCHAR);
                }
                if (comment.has("pos_neg") && !canEdit) {
                    preparedStatement.setInt(2, comment.getInt("pos_neg"));
                } else {
                    preparedStatement.setNull(2, Types.INTEGER);
                }
                if (comment.has("pos_neg") && canEdit) {
                    preparedStatement.setInt(3, comment.getInt("pos_neg"));
                } else {
                    preparedStatement.setNull(3, Types.INTEGER);
                }
                if (comment.has("deleted") && canEdit) {
                    preparedStatement.setBoolean(4, "true".equals(comment.getString("deleted")) || "1".equals(comment.getString("deleted")));
                } else {
                    preparedStatement.setNull(4, Types.BIT);
                }
                if (ipAddress != null && !ipAddress.isEmpty()) {
                    preparedStatement.setString(5, ipAddress);
                } else {
                    preparedStatement.setNull(5, Types.VARCHAR);
                }
                if (comment.has("flagged")) {
                    preparedStatement.setBoolean(6, "true".equals(comment.getString("flagged")) || "1".equals(comment.getString("flagged")));
                } else {
                    preparedStatement.setNull(6, Types.BIT);
                }
                preparedStatement.setInt(7, comment.getInt("comment_id"));

                System.out.println(preparedStatement);
                int normalResult = preparedStatement.executeUpdate();

                // only update tags if we told it to specifically
                if (comment.has("tags_added") && comment.has("tags") && comment.getJSONArray("tags").length() > 0) {
                    preparedStatement = databaseHandler.getConnection().prepareStatement(
                            "INSERT INTO comment_tags (comment_id, tag, ip_address, last_updated) VALUES (?, ?, ?, CURRENT_TIMESTAMP) ON DUPLICATE KEY UPDATE deleted = FALSE, ip_address = ?, last_updated = CURRENT_TIMESTAMP");

                    for (int i = 0; i < comment.getJSONArray("tags").length(); ++i) {
                        preparedStatement.setInt(1, comment.getInt("comment_id"));
                        preparedStatement.setString(2, comment.getJSONArray("tags").getString(i).toLowerCase());
                        preparedStatement.setString(3, ipAddress);
                        preparedStatement.setString(4, ipAddress);
                        preparedStatement.addBatch();
                    }

                    int [] addTagResults = preparedStatement.executeBatch();
                    preparedStatement.clearBatch();

                    for (int result : addTagResults) {
                        if (result > 0) {
                            updated = true;
                            break;
                        }
                    }
                }

                if (comment.has("tags_removed") && comment.has("old_tags") && comment.getJSONArray("old_tags").length() > 0) {
                    preparedStatement = databaseHandler.getConnection().prepareStatement(
                            "UPDATE comment_tags SET deleted = TRUE, last_updated = CURRENT_TIMESTAMP, ip_address = ? WHERE comment_id = ? AND tag = ?"
                    );

                    // old_tags tells us what tags used to be there that aren't anymore, so we just use those to see which ones to delete
                    outer:
                    for (int i = 0; i < comment.getJSONArray("old_tags").length(); ++i) {

                        // skip any old tag that is still in tags
                        String currentTag = comment.getJSONArray("old_tags").getString(i).toLowerCase();
                        if (comment.has("tags") && comment.getJSONArray("tags").length() > 0) {
                            for (int j = 0; j < comment.getJSONArray("tags").length(); ++j) {
                                if (comment.getJSONArray("tags").getString(j).toLowerCase().equals(currentTag)) {
                                    continue outer;
                                }
                            }
                        }

                        preparedStatement.setString(1, ipAddress);
                        preparedStatement.setInt(2, comment.getInt("comment_id"));
                        preparedStatement.setString(3, currentTag);
                        preparedStatement.addBatch();
                    }

                    int [] removeTagResults = preparedStatement.executeBatch();
                    preparedStatement.clearBatch();

                    for (int result : removeTagResults) {
                        if (result > 0) {
                            updated = true;
                            break;
                        }
                    }
                }

                if (normalResult < 1) {
                    jsonObject.put("message", "Error while updating comment");
                } else {
                    updated = true;
                    jsonObject.put("message", "Comment updated");
                }
            }

        } catch (SQLException | JSONException e) {
            e.printStackTrace();
        } finally {
            if (preparedStatement != null) {
                try {
                    preparedStatement.close();
                } catch (SQLException e) {
                    e.printStackTrace();
                }
            }
            if (databaseHandler != null) {
                databaseHandler.closeConnection();
            }
        }

        return Response.ok(jsonObject.toString()).build();
    }

    private void writePasswordFail(String ipAddress) {

        if (!"0:0:0:0:0:0:0:1".equals(ipAddress)) {
            DatabaseHandler databaseHandler = null;
            PreparedStatement preparedStatement = null;
            try {

                databaseHandler = new DatabaseHandler();
                preparedStatement = databaseHandler.getConnection().prepareStatement(
                    "INSERT INTO password_fails (ip, `time`) VALUES (?, CURRENT_TIMESTAMP)"
                );

                preparedStatement.setString(1, ipAddress);
                preparedStatement.executeUpdate();

            } catch (SQLException e) {
                e.printStackTrace();
            } finally {
                try {
                    assert preparedStatement != null;
                    preparedStatement.close();
                } catch (SQLException e) {
                    e.printStackTrace();
                }
                if (databaseHandler != null) {
                    databaseHandler.closeConnection();
                }
            }
        }
    }

    @POST
    @Path("/contact")
    @Produces("application/json")
    public Response submitContactForm(@Context HttpServletRequest request, @QueryParam("contact") JSONObject contact) throws JSONException {

        JSONObject jsonObject = new JSONObject();

        if (contact.has("message") && contact.getString("message").length() > 0) {
            DatabaseHandler databaseHandler = null;
            PreparedStatement preparedStatement = null;
            try {

                databaseHandler = new DatabaseHandler();
                preparedStatement = databaseHandler.getConnection().prepareStatement(
                        "INSERT INTO contact (name, email, message, submitted_time) VALUES (?, ?, ?, CURRENT_TIMESTAMP)"
                );

                if (contact.has("name") && contact.getString("name").length() > 0) {
                    preparedStatement.setString(1, contact.getString("name"));
                } else {
                    preparedStatement.setNull(1, Types.VARCHAR);
                }
                if (contact.has("email") && contact.getString("email").length() > 0) {
                    preparedStatement.setString(2, contact.getString("email"));
                } else {
                    preparedStatement.setNull(2, Types.VARCHAR);
                }
                preparedStatement.setString(3, contact.getString("message"));
                int result = preparedStatement.executeUpdate();


                if (result > 0) {
                    jsonObject.put("message", "Message received, thanks for the feedback!");
                } else {
                    jsonObject.put("message", "There was an error entering the message");
                }
            } catch (SQLException e) {
                e.printStackTrace();
            } finally {
                try {
                    assert preparedStatement != null;
                    preparedStatement.close();
                } catch (SQLException e) {
                    e.printStackTrace();
                }
                if (databaseHandler != null) {
                    databaseHandler.closeConnection();
                }
            }
        } else {
            jsonObject.put("message", "You have to at least enter a message");
        }

        return Response.ok(jsonObject.toString()).build();
    }

    @GET
    @Path("/stats")
    @Produces("application/json")
    public Response getStats(@Context HttpServletRequest request) throws JSONException {

        System.out.println("In stats");

        DatabaseHandler databaseHandler = new DatabaseHandler();
        JSONObject jsonObject = new JSONObject();

        jsonObject.put("fails", databaseHandler.getJSONArrayFor("SELECT COUNT(*) as fails FROM password_fails WHERE time > CURRENT_DATE - INTERVAL 1 WEEK").getJSONObject(0).getString("fails"));

        jsonObject.put("tagged", databaseHandler.getJSONArrayFor("SELECT COUNT(DISTINCT comment_id) as rated FROM comment_tags").getJSONObject(0).getString("rated"));

        jsonObject.put("rated", databaseHandler.getJSONArrayFor("SELECT COUNT(*) as rated FROM comments WHERE pos_neg IS NOT NULL OR verified_pos_neg IS NOT NULL").getJSONObject(0).getString("rated"));

        jsonObject.put("flagged", databaseHandler.getJSONArrayFor("SELECT COUNT(*) as flagged FROM comments WHERE flagged = TRUE").getJSONObject(0).getString("flagged"));

        jsonObject.put("unread", databaseHandler.getJSONArrayFor("SELECT COUNT(*) as unread FROM contact WHERE `read` = FALSE").getJSONObject(0).getString("unread"));

        jsonObject.put("edited", databaseHandler.getJSONArrayFor("SELECT COUNT(*) as edited FROM comments WHERE comment_text != verified_comment_text").getJSONObject(0).getString("edited"));

        databaseHandler.closeConnection();

        return Response.ok(jsonObject.toString()).build();
    }

}
