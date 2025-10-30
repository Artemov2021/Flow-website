package com.example.backend.service;

import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.PreparedStatement;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@Service
public class CleanupService {

    private static final Logger logger = LoggerFactory.getLogger(CleanupService.class);
    private final String DB_URL = "jdbc:sqlite:./data/database.db";

    @Scheduled(fixedRate = 30000) // Runs every 30 seconds
    public void deleteExpiredCodes() {
        String sql = "DELETE FROM verification_codes WHERE created_at <= datetime('now', 'localtime', '-5 minutes')";

        try (Connection conn = DriverManager.getConnection(DB_URL);
             PreparedStatement ps = conn.prepareStatement(sql)) {

            int deletedRows = ps.executeUpdate();
            logger.info("✅ Deleted {} expired verification codes", deletedRows);
        } catch (Exception e) {
            logger.error("❌ Failed to delete expired verification codes", e);
        }

    }
}
