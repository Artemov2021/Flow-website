package com.example.backend.controller;

import com.example.backend.common.ApiResponse;
import com.example.backend.common.Request;
import com.example.backend.service.StatsService;
import jakarta.servlet.http.HttpSession;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;

import static com.example.backend.common.TimeUtil.countConsecutiveDaysUpToToday;


@RestController
@RequestMapping("/stats")
public class StatsController {
    @Autowired
    private StatsService statsService;

    @PostMapping("/results")
    public ApiResponse<Void> saveResults(@RequestBody Request request,HttpSession session) {
        int userId = (int) session.getAttribute("user-id");
        int totalWords = request.getTotalWords();
        int correctWords = request.getCorrectWords();

        try {
            statsService.saveResultsToDB(userId,totalWords,correctWords);
            return ApiResponse.success();
        } catch (Exception e) {
            return ApiResponse.error("Failed to save results");
        }
    }

    @GetMapping("/records/correct-words")
    public ApiResponse<Integer> getCorrectWordsRecord(HttpSession session) {
        int userId = (int) session.getAttribute("user-id");

        try {
            int record = statsService.getCorrectWordsRecordFromDB(userId);
            return ApiResponse.success(record);
        } catch (Exception e) {
            return ApiResponse.error("Failed to get correct words record");
        }
    }

    @GetMapping("/sessions")
    public ApiResponse<ArrayList<Integer>> getAllUserSessions(HttpSession session) {
        try {
            int userId = (int) session.getAttribute("user-id");
            ArrayList<Integer> sessions = statsService.getAllUserSessions(userId);
            return ApiResponse.success(sessions);
        } catch (Exception e) {
            return ApiResponse.error("Failed to get all users sessions");
        }
    }

    @GetMapping("/current-streak")
    public ApiResponse<Integer> getCurrentStreak(HttpSession session) {
        try {
            int userId = (int) session.getAttribute("user-id");
            ArrayList<String> dates = statsService.getAllUserSessionsDates(userId);
            int result = countConsecutiveDaysUpToToday(dates);
            return ApiResponse.success(result);
        } catch (Exception e) {
            return ApiResponse.error("Failed to get users current streak ");
        }
    }

}