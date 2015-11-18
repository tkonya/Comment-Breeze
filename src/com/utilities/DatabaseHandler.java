package com.utilities;

import org.codehaus.jettison.json.JSONArray;
import org.codehaus.jettison.json.JSONException;
import org.codehaus.jettison.json.JSONObject;

import java.sql.*;
import java.util.ArrayList;
import java.util.List;

/**
 * Created by Trevor on 10/16/2015.
 */
public class DatabaseHandler {

    private static Connection connection = null;
    private static AppProperties appProperties = null;

    public static void main(String[] args) {
        DatabaseHandler databaseHandler = new DatabaseHandler();
        JSONArray jsonArray = databaseHandler.getJSONArrayFor("SELECT * FROM comment_bank");
        databaseHandler.closeConnection();
        System.out.println(jsonArray);
    }

    public DatabaseHandler() {
        appProperties = new AppProperties();
        initializeConnection();
    }

    public Connection getConnection() {
        return connection;
    }

    public void initializeConnection() {

        try {
            Class.forName("com.mysql.jdbc.Driver").newInstance();
        } catch (ClassNotFoundException e) {
            System.out.println("Where is your MySQL JDBC Driver?");
            e.printStackTrace();
            return;
        } catch (InstantiationException | IllegalAccessException e) {
            e.printStackTrace();
        }

        try {
            connection = DriverManager.getConnection(appProperties.getDBHost(), appProperties.getDBUser(), appProperties.getDBPassword());
        } catch (SQLException ex) {
            ex.printStackTrace();
        }
    }

    public void closeConnection() {
        try {
            connection.close();
        } catch (SQLException e) {
            e.printStackTrace();
        }
    }

    public JSONArray getJSONArrayFor(String query) {
        JSONArray jsonArray = new JSONArray();
        Statement statement = null;
        try {

            statement = connection.createStatement();
            ResultSet results = statement.executeQuery(query);
            ResultSetMetaData rsMD = results.getMetaData();

            int colCount = rsMD.getColumnCount();
            while(results.next()){
                JSONObject mapping = new JSONObject();
                for(int i = 1; i <= colCount; i++){
                    String columnLabel = rsMD.getColumnLabel(i);
                    String value = results.getString(i);
                    mapping.put(columnLabel, value);
                }
                jsonArray.put(mapping);
            }

        } catch (SQLException | JSONException e) {
            e.printStackTrace();
        } finally {
            if (statement != null) {
                try {
                    statement.close();
                } catch (SQLException e) {
                    e.printStackTrace();
                }
            }
        }

        return jsonArray;
    }

    public List<JSONObject> getJSONObjectList(String query) {
        List<JSONObject> jsonObjectList = new ArrayList<>();
        Statement statement = null;
        try {

            statement = connection.createStatement();
            ResultSet results = statement.executeQuery(query);
            ResultSetMetaData rsMD = results.getMetaData();

            int colCount = rsMD.getColumnCount();
            while(results.next()){
                JSONObject mapping = new JSONObject();
                for(int i = 1; i <= colCount; i++){
                    String columnLabel = rsMD.getColumnLabel(i);
                    String value = results.getString(i);
                    mapping.put(columnLabel, value);
                }
                jsonObjectList.add(mapping);
            }

        } catch (SQLException | JSONException e) {
            e.printStackTrace();
        } finally {
            if (statement != null) {
                try {
                    statement.close();
                } catch (SQLException e) {
                    e.printStackTrace();
                }
            }
        }

        return jsonObjectList;
    }


}
