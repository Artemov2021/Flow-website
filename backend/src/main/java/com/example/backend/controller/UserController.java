package com.example.backend.controller;

import com.example.backend.common.ApiResponse;
import com.example.backend.service.UserService;
import jakarta.servlet.http.HttpSession;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import javax.imageio.ImageIO;
import java.awt.*;
import java.awt.image.BufferedImage;
import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;

import static com.example.backend.common.TimeUtil.getConvertedCreatedAtDate;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@RestController
@RequestMapping("/user")
public class UserController {

    private static final Logger log = LoggerFactory.getLogger(UserController.class);

    @Autowired
    private UserService userService;

    @GetMapping("/availability")
    public ApiResponse<Boolean> checkAvailability(@RequestParam String email) {
        try {
            boolean isUserInUsersDB = userService.isUserInUsersDB(email);
            return ApiResponse.success(isUserInUsersDB);
        } catch (Exception e) {
            log.error("Error checking availability for email {}: {}", email, e.getMessage(), e);
            return ApiResponse.error("Failed to check whether user exists");
        }
    }

    @GetMapping("/has-avatar")
    public ApiResponse<Boolean> hasAvatar(HttpSession sessions) {
        try {
            int userId = (int) sessions.getAttribute("user-id");
            Path avatarPath = Paths.get("uploads/avatars/" + userId + ".jpg");
            boolean hasUserAvatar = Files.exists(avatarPath);
            return ApiResponse.success(hasUserAvatar);
        } catch (Exception e) {
            e.printStackTrace();
            return ApiResponse.error("Failed to check whether user has an avatar");
        }
    }

    @PostMapping(value = "/avatar", consumes = "multipart/form-data")
    public ApiResponse<Void> setAvatar(
            @RequestParam("avatar") MultipartFile avatar,
            HttpSession session) {
        try {
            Integer userId = (Integer) session.getAttribute("user-id");
            if (userId == null) {
                return ApiResponse.error("User not logged in");
            }

            Path uploadDir = Paths.get("uploads/avatars");
            Files.createDirectories(uploadDir);

            Path filePath = uploadDir.resolve(userId + ".jpg");

            BufferedImage image = ImageIO.read(avatar.getInputStream());
            if (image == null) throw new IOException("Invalid image");

            BufferedImage newImage = new BufferedImage(
                    image.getWidth(),
                    image.getHeight(),
                    BufferedImage.TYPE_INT_RGB
            );

            Graphics2D g = newImage.createGraphics();
            g.drawImage(image, 0, 0, Color.BLACK, null);
            g.dispose();

            ImageIO.write(newImage, "jpg", filePath.toFile());

            return ApiResponse.success();

        } catch (Exception e) {
            e.printStackTrace();
            return ApiResponse.error("Failed to set user's avatar: " + e.getMessage());
        }
    }

    @DeleteMapping("/avatar")
    public ApiResponse<Void> deleteAvatar(HttpSession sessions) {
        try {
            int userId = (int) sessions.getAttribute("user-id");
            String picturePath = "uploads/avatars/" + userId + ".jpg";
            File file = new File(picturePath);

            if (file.exists()) {
                if (file.delete()) {
                    return ApiResponse.success();
                } else {
                    return ApiResponse.error("Failed to delete users avatar");
                }
            } else {
                return ApiResponse.error("Failed to delete users avatar");
            }
        } catch (Exception e) {
            e.printStackTrace();
            return ApiResponse.error("Failed to delete users avatar");
        }
    }

    @GetMapping("/email")
    public ApiResponse<String> getEmail(HttpSession sessions) {
        try {
            int userId = (int) sessions.getAttribute("user-id");
            String email = userService.getEmail(userId);
            return ApiResponse.success(email);
        } catch (Exception e) {
            e.printStackTrace();
            return ApiResponse.error("Failed to get user email");
        }
    }

    @GetMapping("/created-at")
    public ApiResponse<String> getCreatedAtDate(HttpSession sessions) {
        try {
            int userId = (int) sessions.getAttribute("user-id");
            String date = userService.getCreatedAtDate(userId);
            String createdAtDate = getConvertedCreatedAtDate(date);
            return ApiResponse.success(createdAtDate);
        } catch (Exception e) {
            e.printStackTrace();
            return ApiResponse.error("Failed to get user email");
        }
    }

    @DeleteMapping("/account")
    public ApiResponse<Void> deleteAccount(HttpSession sessions) {
        try {
            int userId = (int) sessions.getAttribute("user-id");
            userService.deleteAccount(userId);
            return ApiResponse.success();
        } catch (Exception e) {
            e.printStackTrace();
            return ApiResponse.error("Failed to delete users account");
        }
    }

    @DeleteMapping("/sessions")
    public ApiResponse<Void> deleteSessions(HttpSession sessions) {
        try {
            int userId = (int) sessions.getAttribute("user-id");
            userService.deleteSessions(userId);
            return ApiResponse.success();
        } catch (Exception e) {
            e.printStackTrace();
            return ApiResponse.error("Failed to delete users sessions");
        }
    }
}
