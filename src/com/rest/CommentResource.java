package com.rest;

import org.codehaus.jettison.json.JSONArray;
import com.utilities.DatabaseHandler;
import org.codehaus.jettison.json.JSONException;
import org.codehaus.jettison.json.JSONObject;

import javax.ws.rs.GET;
import javax.ws.rs.PUT;
import javax.ws.rs.Path;
import javax.ws.rs.Produces;
import javax.ws.rs.core.MediaType;
import javax.ws.rs.core.Response;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Collections;
import java.util.Date;
import java.util.List;

/**
 * Created by Trevor on 10/16/2015.
 */

@Path("/comments")
public class CommentResource {

//    static List<JSONObject> commentsList;
    static JSONArray comments;
    static LocalDateTime lastCached = LocalDateTime.now();

//    @GET
//    @Produces("application/json")
//    public Response getComments() throws JSONException {
//        System.out.println("In comment resource");
//
//        if (lastCached.isBefore(LocalDateTime.now().minusDays(1)) || commentsList == null || commentsList.isEmpty()) {
//            System.out.println("Has been over 1 day, will reload cache");
//            DatabaseHandler databaseHandler = new DatabaseHandler();
//            commentsList = databaseHandler.getJSONObjectList("SELECT comment_id, comment_text FROM comment_breeze.comments WHERE deleted = FALSE GROUP BY comment_text ORDER BY RAND()");
//            databaseHandler.closeConnection();
//        } else {
//            System.out.println("Has not been 1 day yet, will load from cache");
//        }
//
//        Collections.shuffle(commentsList);
//
//        JSONArray jsonArray = new JSONArray();
//        commentsList.forEach(jsonArray::put);
//
//        System.out.println("Returning " + jsonArray.length() + " comments");
//        return Response.ok(jsonArray.toString()).build();
//    }

    @GET
    @Produces("application/json")
    public Response getComments() throws JSONException {
        System.out.println("In comment resource");

        if (lastCached.isBefore(LocalDateTime.now().minusDays(1)) || comments == null || comments.length() == 0) {
            System.out.println("Has been over 1 day, will reload cache");
            DatabaseHandler databaseHandler = new DatabaseHandler();
            comments = databaseHandler.getJSONArrayFor("SELECT comment_id, comment_text FROM comment_breeze.comments WHERE deleted = FALSE GROUP BY comment_text ORDER BY RAND()");
            databaseHandler.closeConnection();
        } else {
            System.out.println("Has not been 1 day yet, will load from cache");
        }

        return Response.ok(comments.toString()).build();
    }

    @PUT
    @Produces(MediaType.APPLICATION_JSON)
    public Response addComment() {
        return Response.ok().build();
    }

}
