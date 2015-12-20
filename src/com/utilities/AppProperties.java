package com.utilities;

import java.io.IOException;
import java.io.InputStream;
import java.util.Properties;

/**
 * Created by Trevor on 10/16/2015.
 */
public class AppProperties {

    private Properties appProperties;
    private static final String APP_PROPERTIES_FILE_NAME = "app.properties";

    public AppProperties() {

        InputStream inputStream = null;
        try {
            appProperties = new Properties();
            inputStream = getClass().getResourceAsStream(APP_PROPERTIES_FILE_NAME);
            appProperties.load(inputStream);
        } catch (IOException e) {
            System.out.println("Properties file failed to load");
            e.printStackTrace();
        } finally {
            try {
                assert inputStream != null;
                inputStream.close();
            } catch (IOException ignore) {}
        }

    }

    public String getDBHost() {
        return appProperties.getProperty("database-host");
    }

    public String getDBUser() {
        return appProperties.getProperty("database-user");
    }

    public String getDBPassword() {
        return appProperties.getProperty("database-password");
    }

    public String getEditingPassword() {
        return appProperties.getProperty("editing-password");
    }
}
