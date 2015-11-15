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

/**
 * Created by Trevor on 10/16/2015.
 */

@Path("/comments")
public class CommentResource {

    @GET
    @Produces("application/json")
    public Response getComments() throws JSONException {
        System.out.println("In comment resource");
        DatabaseHandler databaseHandler = new DatabaseHandler();
        JSONArray comments = databaseHandler.getJSONArrayFor("SELECT * FROM comment_breeze.comments LIMIT 100");
        databaseHandler.closeConnection();
        System.out.println("Returning " + comments.length() + " comments");
        Response response = Response.ok(comments).build();
        return response;
    }

//    @GET
//    @Produces("application/json")
//    public Response getComments() throws JSONException {
//        System.out.println("In comment resource");
//        DatabaseHandler databaseHandler = new DatabaseHandler();
//        JSONArray comments = databaseHandler.getJSONArrayFor("SELECT * FROM comment_breeze.comments LIMIT 100");
//        databaseHandler.closeConnection();
//        System.out.println("Returning " + comments.length() + " comments");
//        Response response = Response.ok().entity(comments).build();
//        return response;
//    }

//    @GET
//    @Produces("application/json")
//    public Response getComments() throws JSONException {
//        System.out.println("In comment resource");
//        DatabaseHandler databaseHandler = new DatabaseHandler();
//        JSONArray comments = databaseHandler.getJSONArrayFor("SELECT * FROM comment_breeze.comments LIMIT 100");
//        databaseHandler.closeConnection();
//        System.out.println("Returning " + comments.length() + " comments");
//        Response response = Response.ok(comments, MediaType.APPLICATION_JSON_TYPE).build();
//        return response;
//    }

//    @GET
//    @Produces("application/json")
//    public JSONArray getComments() throws JSONException {
//        System.out.println("In comment resource");
//        DatabaseHandler databaseHandler = new DatabaseHandler();
//        JSONArray comments = databaseHandler.getJSONArrayFor("SELECT * FROM comment_breeze.comments");
//        databaseHandler.closeConnection();
//        System.out.println("Returning " + comments.length() + " comments");
//        return comments;
//    }

//    @GET
//    @Produces("application/json")
//    public JSONObject getComments() throws JSONException {
//        System.out.println("In comment resource");
//        DatabaseHandler databaseHandler = new DatabaseHandler();
//        JSONArray comments = databaseHandler.getJSONArrayFor("SELECT * FROM comment_breeze.comments");
//        databaseHandler.closeConnection();
//        System.out.println("Returning " + comments.length() + " comments");
//        JSONObject jsonObject = new JSONObject();
//        jsonObject.put("comments", comments);
//        return jsonObject;
//    }

    @PUT
    @Produces(MediaType.APPLICATION_JSON)
    public Response addComment() {
        return Response.ok().build();
    }

}
