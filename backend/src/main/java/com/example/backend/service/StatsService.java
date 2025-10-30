package com.example.backend.service;

import static com.example.backend.common.TimeUtil.getCurrentDate;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.sql.*;
import java.util.ArrayList;

@Service
public class StatsService {

    @Value("${database.url}")
    private String DB_URL;

    public void saveResultsToDB(int userId, int totalWords, int correctWords) throws SQLException {
        String sql = "INSERT INTO sessions (user_id, session, total_words, correct_words,date) VALUES (?, ?, ?, ?,?)";

        try (Connection conn = DriverManager.getConnection(DB_URL);
             PreparedStatement ps = conn.prepareStatement(sql)) {

            int lastSession;
            try {
                lastSession = getLastSession(userId); // ✅ get last safely
            } catch (Exception e) {
                lastSession = 0; // ✅ if no session exists, start from 0
            }

            ps.setInt(1, userId);
            ps.setInt(2, lastSession + 1); // ✅ safe now
            ps.setInt(3, totalWords);
            ps.setInt(4, correctWords);
            ps.setString(5,getCurrentDate());

            ps.executeUpdate();
        }
    }
    private int getLastSession(int userId) throws SQLException {
        String statement = "SELECT session FROM sessions WHERE user_id = ? ORDER BY session DESC LIMIT 1";

        try (Connection conn = DriverManager.getConnection(DB_URL);
             PreparedStatement stmt = conn.prepareStatement(statement)) {

            stmt.setInt(1,userId);
            ResultSet rs = stmt.executeQuery();

            if (rs.next()) {
                return rs.getInt("session"); // latest session
            } else {
                return 0; // no sessions yet
            }
        }
    }
    public int getCorrectWordsRecordFromDB(int userId) throws SQLException {
        String statement = "SELECT MAX(correct_words) AS record FROM sessions WHERE user_id = ?";

        try (Connection conn = DriverManager.getConnection(DB_URL);
             PreparedStatement stmt = conn.prepareStatement(statement)) {

            stmt.setInt(1, userId);
            ResultSet rs = stmt.executeQuery();

            if (rs.next()) {
                return rs.getInt("record");
            } else {
                return 0; // no sessions yet
            }
        }
    }
    public ArrayList<Integer> getAllUserSessions(int userId) throws SQLException {
        ArrayList<Integer> sessions = new ArrayList<>();
        String statement = "SELECT correct_words FROM sessions WHERE user_id = ?";

        try (Connection conn = DriverManager.getConnection(DB_URL);
             PreparedStatement stmt = conn.prepareStatement(statement)) {

            stmt.setInt(1, userId);
            ResultSet rs = stmt.executeQuery();

            while (rs.next()) {
                sessions.add(rs.getInt("correct_words"));
            }
        }

        return sessions;
    }
    public ArrayList<String> getAllUserSessionsDates(int userId) throws SQLException {
        ArrayList<String> dates = new ArrayList<>();
        String statement = "SELECT date FROM sessions WHERE user_id = ?";

        try (Connection conn = DriverManager.getConnection(DB_URL);
             PreparedStatement stmt = conn.prepareStatement(statement)) {

            stmt.setInt(1, userId);
            ResultSet rs = stmt.executeQuery();

            while (rs.next()) {
                dates.add(rs.getString("date"));
            }
        }

        return dates;
    }
}
