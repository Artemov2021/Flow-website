package com.example.backend.controller;

import com.example.backend.common.ApiResponse;
import com.example.backend.common.Request;
import com.example.backend.service.AuthService;
import com.example.backend.service.EmailService;
import com.example.backend.service.UserService;
import com.example.backend.service.VerificationService;
import jakarta.servlet.http.HttpSession;
import org.mindrot.jbcrypt.BCrypt;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.web.bind.annotation.*;

import java.util.concurrent.CompletableFuture;


@RestController
@RequestMapping("/auth")
public class AuthController {

    @Autowired
    private VerificationService verificationService;

    @Autowired
    private EmailService emailService;

    @Autowired
    private AuthService authService;

    @Autowired
    private UserService userService;

    @PostMapping("/signup/request-code")
    public ApiResponse<Void> signupRequestCode(@RequestBody Request request) {
        try {
            String email = request.getEmail();
            String generatedCode = verificationService.addUserToVerificationDB(email);
            CompletableFuture.runAsync(() -> {
                try {
                    emailService.sendUserVerificationCodeEmail(email,generatedCode);
                } catch (Exception e) {
                    e.printStackTrace();
                    throw new RuntimeException(e);
                }
            });
            return ApiResponse.success();
        } catch (Exception e) {
            e.printStackTrace();
            return ApiResponse.error("Failed to send signup code");
        }
    }

    @GetMapping("/verification/status")
    public ApiResponse<Boolean> verificationStatus(HttpSession session) {
        try {
            String email = (String) session.getAttribute("email");
            return ApiResponse.success(verificationService.isUserInVerificationDB(email));
        } catch (Exception e) {
            e.printStackTrace();
            return ApiResponse.error("Failed to get verification status");
        }
    }

    @PostMapping("/verification/verify")
    public ApiResponse<Boolean> verifyCode(@RequestBody Request request,HttpSession session) {
        try {
            String plainTypedCode = request.getTypedCode();
            String hashedCode = verificationService.getHashedCode((String) session.getAttribute("email"));
            boolean isCorrect = BCrypt.checkpw(plainTypedCode,hashedCode);
            return ApiResponse.success(isCorrect);
        } catch (Exception e) {
            e.printStackTrace();
            return ApiResponse.error("Failed to verify code");
        }
    }

    @PostMapping("/signup/complete")
    public ApiResponse<Void> signUpUser(HttpSession session) {
        try {
            String email = (String) session.getAttribute("email");
            String password = (String) session.getAttribute("password");
            authService.signUpUser(email,password);
            return ApiResponse.success();
        } catch (Exception e) {
            e.printStackTrace();
            return ApiResponse.error("Failed to sign up the user");
        }
    }

    @DeleteMapping("/verification/remove")
    public ApiResponse<Void> removeFromVerification(HttpSession session) {
        try {
            String email = (String) session.getAttribute("email");
            verificationService.deleteUserFromVerificationDB(email);
            return ApiResponse.success();
        } catch (Exception e) {
            e.printStackTrace();
            return ApiResponse.error("Failed to remove the user from verification");
        }
    }

    @PostMapping("/password/validate")
    public ApiResponse<Boolean> passwordValidate(@RequestBody Request request) {
        String email = request.getEmail();
        String plainPassword = request.getPassword();

        try {
            boolean isPasswordCorrect = authService.isPlainPasswordCorrect(email,plainPassword);
            return ApiResponse.success(isPasswordCorrect);
        } catch (Exception e) {
            e.printStackTrace();
            return ApiResponse.error("Failed to check whether the password is correct");
        }
    }

    @PostMapping("/login/request-code")
    public ApiResponse<Void> sendLoginCode(@RequestBody Request request) {
        try {
            String email = request.getEmail();

            if (!verificationService.isUserInVerificationDB(email)) {
                String generatedCode = verificationService.addUserToVerificationDB(email);
                CompletableFuture.runAsync(() -> {
                    try {
                        emailService.sendUserVerificationCodeEmail(email,generatedCode);
                    } catch (Exception e) {
                        e.printStackTrace();
                        throw new RuntimeException(e);
                    }
                });
            }
            return ApiResponse.success();
        } catch (Exception e) {
            e.printStackTrace();
            return ApiResponse.error("Failed to send login code");
        }
    }
}
