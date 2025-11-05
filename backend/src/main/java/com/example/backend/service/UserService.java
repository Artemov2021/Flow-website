package com.example.backend.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.sql.*;

@Service
public class UserService {

    @Value("${spring.datasource.url}")
    private String DB_URL;

    @Autowired
    @Value("${PGUSER}")
    private String DB_USER;

    @Autowired
    @Value("${PGPASSWORD}")
    private String DB_PASSWORD;

    public boolean isUserInUsersDB(String email) throws Exception {
        String statement = "SELECT * FROM users WHERE email = ?";

        try (Connection conn = DriverManager.getConnection(DB_URL,DB_USER, DB_PASSWORD);
             PreparedStatement stmt = conn.prepareStatement(statement)) {
            stmt.setString(1, email);
            ResultSet rs = stmt.executeQuery();
            return rs.next();
        }
    }
    public int getSessionUserId(String email) throws SQLException {
        String statement = "SELECT user_id FROM users WHERE email = ?";

        try (Connection conn = DriverManager.getConnection(DB_URL,DB_USER, DB_PASSWORD);
             PreparedStatement stmt = conn.prepareStatement(statement)) {
            stmt.setString(1,email);
            ResultSet rs = stmt.executeQuery();
            return rs.getInt("user_id");
        }
    }
    public String getEmail(int userId) throws SQLException {
        String statement = "SELECT email FROM users WHERE user_id = ?";

        try (Connection conn = DriverManager.getConnection(DB_URL,DB_USER, DB_PASSWORD);
             PreparedStatement stmt = conn.prepareStatement(statement)) {
            stmt.setInt(1,userId);
            ResultSet rs = stmt.executeQuery();
            return rs.getString("email");
        }
    }
    public String getCreatedAtDate(int userId) throws SQLException {
        String statement = "SELECT created_at FROM users WHERE user_id = ?";

        try (Connection conn = DriverManager.getConnection(DB_URL,DB_USER, DB_PASSWORD);
             PreparedStatement stmt = conn.prepareStatement(statement)) {
            stmt.setInt(1,userId);
            ResultSet rs = stmt.executeQuery();
            return rs.getString("created_at");
        }
    }
    public void deleteAccount(int userId) throws SQLException {
        String sql = "DELETE FROM users WHERE user_id = ?";

        try (Connection conn = DriverManager.getConnection(DB_URL,DB_USER, DB_PASSWORD);
             PreparedStatement stmt = conn.prepareStatement(sql)) {

            stmt.setInt(1, userId);
            stmt.executeUpdate();
        }
    }
    public void deleteSessions(int userId) throws SQLException {
        String sql = "DELETE FROM sessions WHERE user_id = ?";

        try (Connection conn = DriverManager.getConnection(DB_URL,DB_USER, DB_PASSWORD);
             PreparedStatement stmt = conn.prepareStatement(sql)) {

            stmt.setInt(1, userId);
            stmt.executeUpdate();
        }
    }
}
