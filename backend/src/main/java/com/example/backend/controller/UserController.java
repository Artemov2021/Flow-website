package com.example.backend.controller;

import com.example.backend.common.Request;
import com.example.backend.common.ApiResponse;
import com.example.backend.service.UserService;
import jakarta.servlet.http.HttpSession;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/user")
public class UserController {

    @Value("${database.url}")
    private String DB_URL;

    @Autowired
    private UserService userService;

    @GetMapping("/availability")
    public ApiResponse<Boolean> checkAvailability(@RequestParam String email) {
        try {
            boolean isUserInUsersDB = userService.isUserInUsersDB(email);
            return ApiResponse.success(isUserInUsersDB);
        } catch (Exception e) {
            return ApiResponse.error("Failed to check whether user exists");
        }
    }


}
