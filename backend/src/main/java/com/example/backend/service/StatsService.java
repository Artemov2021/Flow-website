package com.example.backend.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import javax.sql.DataSource;
import java.sql.*;
import java.util.ArrayList;

import static com.example.backend.common.TimeUtil.getCurrentDate;

@Service
public class StatsService {

    @Autowired
    private DataSource dataSource;

    public void saveResultsToDB(int userId, int totalWords, int correctWords) throws SQLException {
        String sql = "INSERT INTO sessions (user_id, total_words, correct_words, date) VALUES (?, ?, ?, ?)";

        try (Connection conn = dataSource.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {

            ps.setInt(1, userId);
            ps.setInt(2, totalWords);
            ps.setInt(3, correctWords);
            ps.setString(4, getCurrentDate());

            ps.executeUpdate();
        }
    }

    public int getLastSession(int userId) throws SQLException {
        String sql = "SELECT session_id FROM sessions WHERE user_id = ? ORDER BY session_id DESC LIMIT 1";

        try (Connection conn = dataSource.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {

            stmt.setInt(1, userId);
            ResultSet rs = stmt.executeQuery();

            return rs.next() ? rs.getInt("session_id") : 0;
        }
    }

    public int getCorrectWordsRecordFromDB(int userId) throws SQLException {
        String sql = "SELECT MAX(correct_words) AS record FROM sessions WHERE user_id = ?";

        try (Connection conn = dataSource.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {

            stmt.setInt(1, userId);
            ResultSet rs = stmt.executeQuery();
            return rs.next() ? rs.getInt("record") : 0;
        }
    }

    public ArrayList<Integer> getAllUserSessions(int userId) throws SQLException {
        ArrayList<Integer> sessions = new ArrayList<>();
        String sql = "SELECT correct_words FROM sessions WHERE user_id = ?";

        try (Connection conn = dataSource.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {

            stmt.setInt(1, userId);
            ResultSet rs = stmt.executeQuery();
            while (rs.next()) sessions.add(rs.getInt("correct_words"));
        }

        return sessions;
    }

    public ArrayList<String> getAllUserSessionsDates(int userId) throws SQLException {
        ArrayList<String> dates = new ArrayList<>();
        String sql = "SELECT date FROM sessions WHERE user_id = ?";

        try (Connection conn = dataSource.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {

            stmt.setInt(1, userId);
            ResultSet rs = stmt.executeQuery();
            while (rs.next()) dates.add(rs.getString("date"));
        }

        return dates;
    }

    public int getTotalWords(int userId) throws SQLException {
        int totalWords = 0;
        String sql = "SELECT total_words FROM sessions WHERE user_id = ?";

        try (Connection conn = dataSource.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {

            stmt.setInt(1, userId);
            ResultSet rs = stmt.executeQuery();
            while (rs.next()) {
                totalWords += rs.getInt("total_words");
            }
        }

        return totalWords;
    }
}
