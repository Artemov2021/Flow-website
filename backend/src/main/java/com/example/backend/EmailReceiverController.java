package com.example.backend;

import jakarta.mail.Authenticator;
import jakarta.mail.Message;
import jakarta.mail.PasswordAuthentication;
import jakarta.mail.Session;
import jakarta.mail.Transport;
import jakarta.mail.internet.InternetAddress;
import jakarta.mail.internet.MimeMessage;
import jakarta.servlet.http.HttpSession;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.web.bind.annotation.*;

import java.util.Properties;

import java.sql.*;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;

import org.mindrot.jbcrypt.BCrypt;

@RestController
public class EmailReceiverController {
    private final String DB_URL = "jdbc:sqlite:./data/database.db"; // Path where DB will be created

    @Scheduled(fixedRate = 30000) // every 30 seconds
    public void deleteExpiredCodes() {
        String sql = "DELETE FROM verification_codes WHERE created_at <= datetime('now', 'localtime', '-5 minutes')";

        try (Connection conn = DriverManager.getConnection(DB_URL);
             PreparedStatement ps = conn.prepareStatement(sql)) {
            int rowsDeleted = ps.executeUpdate();
            System.out.println("Deleted " + rowsDeleted + " expired verification codes.");
        } catch (Exception e) {
            e.printStackTrace();
        }
    }

    @PostMapping("/send-signup-code")
    @CrossOrigin(origins = "http://localhost:63343", allowCredentials = "true") // allow any origin
    public ApiResponse checkSignupEmail(@RequestBody Request request,HttpSession session) {
        String email = request.getEmail();
        String hashedPassword = BCrypt.hashpw(request.getPassword(), BCrypt.gensalt());

        session.setAttribute("signupEmail",email);
        session.setAttribute("signupPassword",hashedPassword);

        try {
            if (!isUserInVerificationDB(email)) {
                String generatedCode = addUserToVerificationDB(email);
                sendUserVerificationCodeEmail(email,generatedCode);
            }
            return new ApiResponse(true,email,null);
        } catch (Exception e) {
            return new ApiResponse(false,email,e.getMessage());
        }
    }


    @GetMapping("/get-signup-email")
    @CrossOrigin(origins = "http://localhost:63343", allowCredentials = "true") // allow any origin
    public ApiResponse getSignUpEmail(HttpSession session) {
        try {
            String email = (String) session.getAttribute("signupEmail");
            return new ApiResponse(false,email,null);
        } catch (Exception e) {
            return new ApiResponse(false,null,e.getMessage());
        }
    }


    @PostMapping("/is-user-in-verification-db")
    @CrossOrigin(origins = "http://localhost:63343", allowCredentials = "true") // allow any origin
    public ApiResponse isUserInVerificationDB(@RequestBody Request request) {
        String email = request.getEmail();

        try {
            if (isUserInVerificationDB(email)) {
                return new ApiResponse(true,true,null);
            } else {
                return new ApiResponse(true,false,null);
            }
        } catch (Exception e) {
            return new ApiResponse(false,email,e.getMessage());
        }
    }


    @PostMapping("/is-typed-code-correct")
    @CrossOrigin(origins = "http://localhost:63343", allowCredentials = "true") // allow any origin
    public ApiResponse isTypedCodeCorrect(@RequestBody Request request) {
        String email = request.getEmail();
        String typedCode = request.getTypedCode();

        try {
            String hashedCode = getHashedCode(email);
            return new ApiResponse(true,BCrypt.checkpw(typedCode,hashedCode),null);
        } catch (Exception e) {
            return new ApiResponse(false,null,e.getMessage());
        }
    }


    @PostMapping("/delete-user-from-verification-db")
    @CrossOrigin(origins = "http://localhost:63343", allowCredentials = "true") // allow any origin
    public ApiResponse deleteUserFromVerificationDB(@RequestBody Request request) {
        String email = request.getEmail();

        try {
            deleteUserFromVerificationDB(email);
            return new ApiResponse(true,null,null);
        } catch (Exception e) {
            return new ApiResponse(false,null,e.getMessage());
        }
    }


    @PostMapping("/sign-up-user")
    @CrossOrigin(origins = "http://localhost:63343", allowCredentials = "true") // allow any origin
    public ApiResponse signUpUser(@RequestBody Request request,HttpSession session) {
        String email = request.getEmail();
        String password = (String) session.getAttribute("signupPassword");

        try {
            signUpUser(email,password);
            return new ApiResponse(true,null,null);
        } catch (Exception e) {
            return new ApiResponse(false,null,e.getMessage());
        }
    }


    @PostMapping("/is-user-in-users-db")
    @CrossOrigin(origins = "http://localhost:63343", allowCredentials = "true") // allow any origin
    public ApiResponse isUserNnUsersDB(@RequestBody Request request) {
        String email = request.getEmail();

        try {
            boolean isUserInUsersDB = isUserInUsersDB(email);
            return new ApiResponse(true,isUserInUsersDB,null);
        } catch (Exception e) {
            return new ApiResponse(false,null,e.getMessage());
        }
    }

    



    private boolean isUserInVerificationDB(String email) throws Exception {
        String statement = "SELECT * FROM verification_codes WHERE email = ?";

        try (Connection conn = DriverManager.getConnection(DB_URL);
             PreparedStatement stmt = conn.prepareStatement(statement)) {
            stmt.setString(1, email);
            ResultSet rs = stmt.executeQuery();
            return rs.next();
        }
    }
    private String addUserToVerificationDB(String email) throws Exception {
        String statement = "INSERT INTO verification_codes (email,code,created_at) VALUES (?,?,?)";
        String generatedCode = getRandomVerificationCode();
        String hashedRandomCode = BCrypt.hashpw(generatedCode, BCrypt.gensalt());

        try (Connection conn = DriverManager.getConnection(DB_URL);
             PreparedStatement preparedStatement = conn.prepareStatement(statement)) {
            preparedStatement.setString(1, email);
            preparedStatement.setString(2,hashedRandomCode);
            preparedStatement.setString(3,getCurrentTime());

            preparedStatement.executeUpdate();
        }

        return generatedCode;
    }
    private void sendUserVerificationCodeEmail(String email,String code) throws Exception {
        String from = "flow.auth.noreply@gmail.com"; // your email
        String password = "irdz gckg rlck qasq"; // app password for Gmail

        Properties props = new Properties();
        props.put("mail.smtp.auth", "true");
        props.put("mail.smtp.starttls.enable", "true");
        props.put("mail.smtp.host", "smtp.gmail.com");
        props.put("mail.smtp.port", "587");

        Session session = Session.getInstance(props, new Authenticator() {
            protected PasswordAuthentication getPasswordAuthentication() {
                return new PasswordAuthentication(from, password);
            }
        });

        Message message = new MimeMessage(session);
        message.setFrom(new InternetAddress(from));
        message.setRecipients(Message.RecipientType.TO, InternetAddress.parse(email));
        message.setSubject("Your Verification Code");

        // Use HTML content
        String htmlContent = "<html>" +
                "<body>" +
                "<p style='font-size:42px;'>Your verification code is: " +
                "<b>" + code + "</b>" +
                "</p>" +
                "</body>" +
                "</html>";

        message.setContent(htmlContent, "text/html; charset=utf-8");

        Transport.send(message);
    }
    private String getHashedCode(String email) throws Exception {
        String statement = "SELECT code FROM verification_codes WHERE email = ?";

        try (Connection conn = DriverManager.getConnection(DB_URL);
             PreparedStatement stmt = conn.prepareStatement(statement)) {
            stmt.setString(1, email);
            ResultSet rs = stmt.executeQuery();
            return rs.getString("code");
        }
    }
    private String getRandomVerificationCode() throws Exception {
        String statement = "SELECT code FROM verification_codes";
        Set<String> codes = new HashSet<>();

        try (Connection conn = DriverManager.getConnection(DB_URL);
             PreparedStatement stmt = conn.prepareStatement(statement);
             ResultSet rs = stmt.executeQuery()) {

            while (rs.next()) {
                codes.add(rs.getString("code"));
            }
        }

        Random random = new Random();
        String code;
        short tries = 0;
        do {
            int num = random.nextInt(10000); // 0 - 9999
            code = String.format("%04d", num); // format as 4-digit string
            tries++;

            if (tries > 1000) {
                throw new Exception();
            }
        } while (codes.contains(code));

        return code;
    }
    private String getCurrentTime() {
        LocalDateTime now = LocalDateTime.now();
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm"); // store seconds
        return now.format(formatter);
    }
    private void deleteUserFromVerificationDB(String email) throws Exception {
        String statement = "DELETE FROM verification_codes WHERE email = ?";
        System.out.println("email: "+email);

        try (Connection conn = DriverManager.getConnection(DB_URL);
             PreparedStatement stmt = conn.prepareStatement(statement)) {

            stmt.setString(1, email);
            int rowsAffected = stmt.executeUpdate(); // <-- capture number of rows deleted

            System.out.println("Rows deleted: " + rowsAffected);
        }
    }
    private void signUpUser(String email,String password) throws Exception {
        String statement = "INSERT INTO users (email,password) VALUES (?,?)";

        try (Connection conn = DriverManager.getConnection(DB_URL);
             PreparedStatement preparedStatement = conn.prepareStatement(statement)) {
            preparedStatement.setString(1,email);
            preparedStatement.setString(2,password);

            preparedStatement.executeUpdate();
        }
    }
    private boolean isUserInUsersDB(String email) throws Exception {
        String statement = "SELECT * FROM users WHERE email = ?";

        try (Connection conn = DriverManager.getConnection(DB_URL);
             PreparedStatement stmt = conn.prepareStatement(statement)) {
            stmt.setString(1, email);
            ResultSet rs = stmt.executeQuery();
            return rs.next();
        }
    }

}

class Request {
    private String email;
    private String password;
    private String typedCode;

    public void setEmail(String email) {
        this.email = email;
    }
    public void setPassword(String password) {
        this.password = password;
    }
    public void setTypedCode(String typedCode) {
        this.typedCode = typedCode;
    }

    public String getEmail() {
        return this.email;
    }
    public String getPassword() {
        return this.password;
    }
    public String getTypedCode() {
        return this.typedCode;
    }
}
class ApiResponse {
    private boolean success;
    private Object data;
    private String errorMessage;

    public ApiResponse(boolean success,Object data,String errorMessage) {
        this.success = success;
        this.data = data;
        this.errorMessage = errorMessage;
    }

    // Getters
    public boolean isSuccess() {
        return success;
    }
    public Object getData() {
        return data;
    }
    public String getErrorMessage() {
        return errorMessage;
    }
}


