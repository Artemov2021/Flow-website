package com.example.backend.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.sql.*;

@Service
public class UserService {

    @Value("${database.url}")
    private String DB_URL;

    public boolean isUserInUsersDB(String email) throws Exception {
        String statement = "SELECT * FROM users WHERE email = ?";

        try (Connection conn = DriverManager.getConnection(DB_URL);
             PreparedStatement stmt = conn.prepareStatement(statement)) {
            stmt.setString(1, email);
            ResultSet rs = stmt.executeQuery();
            return rs.next();
        }
    }

    public int getSessionUserId(String email) throws SQLException {
        String statement = "SELECT user_id FROM users WHERE email = ?";
        System.out.println("trying to get session user id from DB with email: "+email);

        try (Connection conn = DriverManager.getConnection(DB_URL);
             PreparedStatement stmt = conn.prepareStatement(statement)) {
            stmt.setString(1,email);
            ResultSet rs = stmt.executeQuery();
            return rs.getInt("user_id");
        }
    }
}
