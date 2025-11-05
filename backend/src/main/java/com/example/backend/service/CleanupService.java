package com.example.backend.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
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

    @Value("${spring.datasource.url}")
    private String DB_URL;

    @Autowired
    @Value("${PGUSER}")
    private String DB_USER;

    @Autowired
    @Value("${PGPASSWORD}")
    private String DB_PASSWORD;

    @Scheduled(fixedRate = 30000) // Runs every 30 seconds
    public void deleteExpiredCodes() {
        String sql = "DELETE FROM verification_codes WHERE created_at <= datetime('now', 'localtime', '-5 minutes')";

        try (Connection conn = DriverManager.getConnection(DB_URL,DB_USER, DB_PASSWORD);
             PreparedStatement ps = conn.prepareStatement(sql)) {

            ps.executeUpdate();
        } catch (Exception e) {
            logger.error("Failed to delete expired verification codes", e);
        }

    }
}
