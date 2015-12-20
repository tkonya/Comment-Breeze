package com.rest;

import com.utilities.AppProperties;
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
import java.util.LinkedList;
import java.util.Queue;

/**
 * Created by Trevor on 10/16/2015.
 */

@Path("/comments")
public class CommentResource {

    private static JSONArray comments;
    private static LocalDateTime lastCached = LocalDateTime.now();
    private static boolean updated = false;
    private static String editingPasswordAnswer;

    private static final int MAX_PASSWORD_TRIES = 10;
    private static Queue<LocalDateTime> passwordFails;
    private static LocalDateTime passwordLockoutUntil = LocalDateTime.now().minusSeconds(1);

    @GET
    @Produces("application/json")
    public Response getComments() throws JSONException {
        System.out.println("In comment resource");

        if (updated || lastCached.isBefore(LocalDateTime.now().minusDays(1)) || comments == null || comments.length() == 0) {
            System.out.println("Has been over 1 day, will reload cache");
            DatabaseHandler databaseHandler = new DatabaseHandler();
            comments = databaseHandler.getJSONArrayFor("SELECT comment_id, comment_text, pos_neg FROM comment_breeze.comments WHERE deleted = FALSE GROUP BY comment_text ORDER BY RAND()");
            databaseHandler.closeConnection();
            updated = false;
        } else {
            System.out.println("Has not been 1 day yet, will load from cache");
        }

        return Response.ok(comments.toString()).build();
    }

    @PUT
    @Consumes(MediaType.APPLICATION_JSON)
    @Produces(MediaType.APPLICATION_JSON)
    public Response updateComment(@Context HttpServletRequest request, @QueryParam("comment") JSONObject comment, @QueryParam("editing_password_try") String editingPasswordTry) throws JSONException {

        JSONObject jsonObject = new JSONObject();

        // TODO: implement ip level password attempt blocking as well as global password attempt blocking
        System.out.println("Getting request from " + request.getRemoteAddr());
        jsonObject.put("address", request.getRemoteAddr());

        // see if we have the editing password set
        if (editingPasswordAnswer == null || editingPasswordAnswer.isEmpty()) {
            AppProperties appProperties = new AppProperties();
            editingPasswordAnswer = appProperties.getEditingPassword();
        }

        DatabaseHandler databaseHandler = null;
        PreparedStatement preparedStatement = null;
        try {
            databaseHandler = new DatabaseHandler();
            preparedStatement = databaseHandler.getConnection().prepareStatement(
                "UPDATE comments SET comment_text = IFNULL(?, comment_text), pos_neg = IFNULL(?, pos_neg), deleted = IFNULL(?, deleted) WHERE comment_id = ?"
            );

            boolean canEdit = false;
            if (editingPasswordAnswer != null && editingPasswordTry != null && !editingPasswordTry.isEmpty()) {
                if (passwordLockoutUntil.isAfter(LocalDateTime.now())) {
                    jsonObject.put("message", "Password attempts locked out until " + passwordLockoutUntil.toString());
                } else {
                    if (editingPasswordAnswer.equals(editingPasswordTry)) {
                        canEdit = true;
                    } else {
                        jsonObject.put("passfail", true);
                        if (incrementPasswordFail()) {
                            jsonObject.put("message", "Max password fail attempts reached - locking out");
                        } else {
                            jsonObject.put("message", "Incorrect password; " + (MAX_PASSWORD_TRIES - passwordFails.size() + 1) + " more tries until lockout");
                        }
                    }
                }
            }

            // if a password attempt ended in failure we don't try
            if (!jsonObject.has("passfail")) {
                if (comment.has("comment_text") && canEdit) {
                    preparedStatement.setString(1, comment.getString("comment_text"));
                } else {
                    preparedStatement.setNull(1, Types.VARCHAR);
                }
                if (comment.has("pos_neg")) {
                    preparedStatement.setInt(2, comment.getInt("pos_neg"));
                } else {
                    preparedStatement.setNull(2, Types.INTEGER);
                }
                if (comment.has("deleted") && canEdit) {
                    preparedStatement.setBoolean(3, comment.getBoolean("deleted"));
                } else {
                    preparedStatement.setBoolean(3, false);
                }
                preparedStatement.setInt(4, comment.getInt("comment_id"));

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
            try {
                assert preparedStatement != null;
                preparedStatement.close();
            } catch (SQLException e) {
                e.printStackTrace();
            }
            assert databaseHandler != null;
            databaseHandler.closeConnection();
        }

        return Response.ok(jsonObject.toString()).build();
    }

    /**
     * Adds a failed attempt to the list
     *
     * @return true if editing is locked out, false if it is not locked out
     */
    private boolean incrementPasswordFail() {
        // initialize the queue if it isn't initialized already
        if (passwordFails == null) {
            passwordFails = new LinkedList<>();
        }

        // add the current fail to the list
        passwordFails.add(LocalDateTime.now());

        // remove any that have rolled off
        while (passwordFails.peek().isBefore(LocalDateTime.now().minusHours(1))) {
            passwordFails.remove();
        }

        if (passwordFails.size() > MAX_PASSWORD_TRIES) {
            passwordLockoutUntil = LocalDateTime.now().plusHours(4);
            return true;
        }
        return false;
    }

}
