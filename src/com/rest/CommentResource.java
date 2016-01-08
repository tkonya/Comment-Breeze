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
import java.time.LocalDateTime;

/**
 * Created by Trevor on 10/16/2015.
 */

@Path("/comments")
public class CommentResource {

    private static JSONArray comments;
    private static LocalDateTime lastCached = LocalDateTime.now();
    private static boolean updated = false;
    private static String editingPasswordAnswer;

    private static LockoutHandler lockoutHandler = new LockoutHandler();

    @GET
    @Produces("application/json")
    public Response getComments(@Context HttpServletRequest request) throws JSONException {

        System.out.println("In comment resource");

        // get the comments object if necessary
        if (updated || lastCached.isBefore(LocalDateTime.now().minusDays(1)) || comments == null || comments.length() == 0) {
            System.out.println("Has been over 1 day, will reload cache");
            DatabaseHandler databaseHandler = new DatabaseHandler();
            comments = databaseHandler.getJSONArrayFor("SELECT comment_id, comment_text, COALESCE(verified_pos_neg, pos_neg) as pos_neg FROM comment_breeze.comments WHERE deleted = FALSE GROUP BY comment_text ORDER BY RAND()");
            databaseHandler.closeConnection();
            updated = false;
        } else {
            System.out.println("Has not been 1 day yet, will load from cache");
        }

        return Response.ok(comments.toString()).build();
    }

    @POST
    @Path("hit")
    public Response recordPageHit(@Context HttpServletRequest request) throws JSONException {

        System.out.println("Recording page hit");

        // ignore local development hits
        String ip = request.getRemoteAddr();
        if ("0:0:0:0:0:0:0:1".equals(ip)) {
            return Response.ok().build();
        }

        DatabaseHandler databaseHandler = null;
        PreparedStatement preparedStatement = null;
        try {
            databaseHandler = new DatabaseHandler();
            preparedStatement = databaseHandler.getConnection().prepareStatement(
                    "INSERT INTO page_hits (ip_address, user_agent, time) VALUES (?, ?, CURRENT_TIMESTAMP)"
            );

            preparedStatement.setString(1, request.getRemoteAddr());
            preparedStatement.setString(2, request.getHeader("User-Agent"));
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
            assert databaseHandler != null;
            databaseHandler.closeConnection();
        }

        return Response.ok().build();
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
                    "UPDATE comments SET comment_text = IFNULL(?, comment_text), pos_neg = IFNULL(?, pos_neg), verified_pos_neg = IFNULL(?, pos_neg), deleted = IFNULL(?, deleted), last_update_ip = IFNULL(?, last_update_ip), last_update = CURRENT_TIMESTAMP WHERE comment_id = ?"
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
                    preparedStatement.setBoolean(4, comment.getBoolean("deleted"));
                } else {
                    preparedStatement.setBoolean(4, false);
                }
                if (ipAddress != null && !ipAddress.isEmpty()) {
                    preparedStatement.setString(5, ipAddress);
                } else {
                    preparedStatement.setNull(5, Types.VARCHAR);
                }
                preparedStatement.setInt(6, comment.getInt("comment_id"));

                System.out.println(preparedStatement);
                int result = preparedStatement.executeUpdate();

                if (result < 1) {
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
            assert databaseHandler != null;
            databaseHandler.closeConnection();
        }
    }

}
