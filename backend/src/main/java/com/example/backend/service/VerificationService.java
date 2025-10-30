package com.example.backend.service;

import org.mindrot.jbcrypt.BCrypt;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.util.HashSet;
import java.util.Random;
import java.util.Set;

import static com.example.backend.common.TimeUtil.getCurrentTime;

@Service
public class VerificationService {

    @Value("${database.url}")
    private String DB_URL;

    public boolean isUserInVerificationDB(String email) throws Exception {
        String statement = "SELECT * FROM verification_codes WHERE email = ?";

        try (Connection conn = DriverManager.getConnection(DB_URL);
             PreparedStatement stmt = conn.prepareStatement(statement)) {
            stmt.setString(1, email);
            ResultSet rs = stmt.executeQuery();
            return rs.next();
        }
    }
    public String addUserToVerificationDB(String email) throws Exception {
        String statement = "INSERT INTO verification_codes (email,code,created_at) VALUES (?,?,?)";
        String generatedCode = getRandomVerificationCode();
        String hashedRandomCode = BCrypt.hashpw(generatedCode, BCrypt.gensalt());

        try (Connection conn = DriverManager.getConnection(DB_URL);
             PreparedStatement preparedStatement = conn.prepareStatement(statement)) {
            preparedStatement.setString(1, email);
            preparedStatement.setString(2,hashedRandomCode);
            preparedStatement.setString(3,getCurrentTime());

            preparedStatement.executeUpdate();
        }

        return generatedCode;
    }
    public String getHashedCode(String email) throws Exception {
        String statement = "SELECT code FROM verification_codes WHERE email = ?";

        try (Connection conn = DriverManager.getConnection(DB_URL);
             PreparedStatement stmt = conn.prepareStatement(statement)) {
            stmt.setString(1, email);
            ResultSet rs = stmt.executeQuery();
            return rs.getString("code");
        }
    }
    public String getRandomVerificationCode() throws Exception {
        String statement = "SELECT code FROM verification_codes";
        Set<String> codes = new HashSet<>();

        try (Connection conn = DriverManager.getConnection(DB_URL);
             PreparedStatement stmt = conn.prepareStatement(statement);
             ResultSet rs = stmt.executeQuery()) {

            while (rs.next()) {
                codes.add(rs.getString("code"));
            }
        }

        Random random = new Random();
        String code;
        short tries = 0;
        do {
            int num = random.nextInt(10000); // 0 - 9999
            code = String.format("%04d", num); // format as 4-digit string
            tries++;

            if (tries > 1000) {
                throw new Exception();
            }
        } while (codes.contains(code));

        return code;
    }
    public void deleteUserFromVerificationDB(String email) throws Exception {
        String statement = "DELETE FROM verification_codes WHERE email = ?";
        System.out.println("email: "+email);

        try (Connection conn = DriverManager.getConnection(DB_URL);
             PreparedStatement stmt = conn.prepareStatement(statement)) {

            stmt.setString(1, email);
            int rowsAffected = stmt.executeUpdate(); // <-- capture number of rows deleted

            System.out.println("Rows deleted: " + rowsAffected);
        }
    }
}
