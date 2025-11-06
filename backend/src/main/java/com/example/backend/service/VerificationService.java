package com.example.backend.service;

import org.mindrot.jbcrypt.BCrypt;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import javax.sql.DataSource;
import java.sql.*;
import java.util.HashSet;
import java.util.Random;
import java.util.Set;

import static com.example.backend.common.TimeUtil.getCurrentTime;

@Service
public class VerificationService {

    @Autowired
    private DataSource dataSource;

    public boolean isUserInVerificationDB(String email) throws Exception {
        String statement = "SELECT * FROM verification_codes WHERE email = ?";

        try (Connection conn = dataSource.getConnection();
             PreparedStatement stmt = conn.prepareStatement(statement)) {

            stmt.setString(1, email);
            ResultSet rs = stmt.executeQuery();
            return rs.next();
        }
    }

    public String addUserToVerificationDB(String email) throws Exception {
        String statement = "INSERT INTO verification_codes (email,code) VALUES (?,?)";
        String generatedCode = getRandomVerificationCode();
        String hashedRandomCode = BCrypt.hashpw(generatedCode, BCrypt.gensalt());

        try (Connection conn = dataSource.getConnection();
             PreparedStatement stmt = conn.prepareStatement(statement)) {

            stmt.setString(1, email);
            stmt.setString(2, hashedRandomCode);
            stmt.executeUpdate();
        }

        return generatedCode;
    }

    public String getHashedCode(String email) throws Exception {
        String statement = "SELECT code FROM verification_codes WHERE email = ?";

        try (Connection conn = dataSource.getConnection();
             PreparedStatement stmt = conn.prepareStatement(statement)) {

            stmt.setString(1, email);
            ResultSet rs = stmt.executeQuery();
            return rs.next() ? rs.getString("code") : null;
        }
    }

    public String getRandomVerificationCode() throws Exception {
        String statement = "SELECT code FROM verification_codes";
        Set<String> codes = new HashSet<>();

        try (Connection conn = dataSource.getConnection();
             PreparedStatement stmt = conn.prepareStatement(statement);
             ResultSet rs = stmt.executeQuery()) {

            while (rs.next()) {
                codes.add(rs.getString("code"));
            }
        }

        Random random = new Random();
        String code;
        int tries = 0;

        do {
            code = String.format("%04d", random.nextInt(10000));
            tries++;

            if (tries > 1000) {
                throw new Exception("Unable to generate unique code");
            }
        } while (codes.contains(code));

        return code;
    }

    public void deleteUserFromVerificationDB(String email) throws Exception {
        String statement = "DELETE FROM verification_codes WHERE email = ?";

        try (Connection conn = dataSource.getConnection();
             PreparedStatement stmt = conn.prepareStatement(statement)) {

            stmt.setString(1, email);
            stmt.executeUpdate();
        }
    }
}


