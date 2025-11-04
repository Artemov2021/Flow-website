package com.example.backend.controller;

import com.example.backend.common.ApiResponse;
import com.example.backend.common.Request;
import com.example.backend.service.UserService;
import jakarta.servlet.http.HttpSession;
import org.mindrot.jbcrypt.BCrypt;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/session")
public class SessionController {

    @Autowired
    private UserService userService;

    @GetMapping("/health")
    public ResponseEntity<String> health() {
        return ResponseEntity.ok("Backend alive ✅");
    }

    @PostMapping("/email")
    public ApiResponse<Void> setSessionEmail(@RequestBody Request request, HttpSession session) {
        try {
            String email = request.getEmail();
            session.setAttribute("email",email);
            return ApiResponse.success();
        } catch (Exception e) {
            return ApiResponse.error("Failed to set a session email");
        }
    }

    @GetMapping("/email")
    public ApiResponse<String> getSessionEmail(HttpSession session) {
        try {
            String email = (String) session.getAttribute("email");
            return ApiResponse.success(email);
        } catch (Exception e) {
            return ApiResponse.error("Failed to get the session email");
        }
    }

    @DeleteMapping("/email")
    public ApiResponse<Void> deleteSessionEmail(HttpSession session) {
        try {
            session.removeAttribute("email");
            return ApiResponse.success();
        } catch (Exception e) {
            return ApiResponse.error("Failed to delete the session email");
        }
    }

    @PostMapping("/password")
    public ApiResponse<Void> setSessionPassword(@RequestBody Request request,HttpSession session) {
        try {
            String plainPassword = request.getPassword();
            String hashedPassword = BCrypt.hashpw(plainPassword, BCrypt.gensalt());

            session.setAttribute("password",hashedPassword);
            return ApiResponse.success();
        } catch (Exception e) {
            return ApiResponse.error("Failed to set a session hashed password");
        }
    }

    @DeleteMapping("/password")
    public ApiResponse<Void> deleteSessionPassword(HttpSession session) {
        try {
            session.removeAttribute("password");
            return ApiResponse.success();
        } catch (Exception e) {
            return ApiResponse.error("Failed to delete the session password");
        }
    }

    @PostMapping("/user-id")
    public ApiResponse<Void> setSessionUserId(HttpSession session) {
        try {
            String email = (String) session.getAttribute("email");
            int userId = userService.getSessionUserId(email);
            session.setAttribute("user-id",userId);
            return ApiResponse.success();
        } catch (Exception e) {
            return ApiResponse.error("Failed to set session user id");
        }
    }

    @GetMapping("/user-id")
    public ApiResponse<Integer> getSessionUserId(HttpSession session) {
        try {
            Integer userId = (Integer) session.getAttribute("user-id");
            return ApiResponse.success(userId);
        } catch (Exception e) {
            return ApiResponse.error("Failed to get session user id");
        }
    }

    @DeleteMapping("/user-id")
    public ApiResponse<Void> deleteSessionUserId(HttpSession session) {
        try {
            session.removeAttribute("user-id");
            return ApiResponse.success();
        } catch (Exception e) {
            return ApiResponse.error("No session user id found");
        }
    }
}
