package com.example.backend.service;

import org.mindrot.jbcrypt.BCrypt;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import static com.example.backend.common.TimeUtil.getCurrentDate;

import java.sql.*;

@Service
public class AuthService {

    @Value("${database.url}")
    private String DB_URL;

    public void signUpUser(String email,String password) throws Exception {
        String statement = "INSERT INTO users (email,password,created_at) VALUES (?,?,?)";

        try (Connection conn = DriverManager.getConnection(DB_URL);
             PreparedStatement preparedStatement = conn.prepareStatement(statement)) {
            preparedStatement.setString(1,email);
            preparedStatement.setString(2,password);
            preparedStatement.setString(3,getCurrentDate());

            preparedStatement.executeUpdate();
        }
    }
    public boolean isPlainPasswordCorrect(String email,String plainPassword) throws SQLException {
        String statement = "SELECT password FROM users WHERE email = ?";

        try (Connection conn = DriverManager.getConnection(DB_URL);
             PreparedStatement stmt = conn.prepareStatement(statement)) {
            stmt.setString(1, email);
            ResultSet rs = stmt.executeQuery();
            String hashedPasswordFromDB = rs.getString("password");
            return BCrypt.checkpw(plainPassword,hashedPasswordFromDB);
        }
    }
}
