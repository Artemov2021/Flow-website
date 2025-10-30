package com.example.backend.service;

import jakarta.mail.*;
import jakarta.mail.internet.InternetAddress;
import jakarta.mail.internet.MimeMessage;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.util.Properties;

@Service
public class EmailService {

    @Value("${database.url}")
    private String DB_URL;

    public void sendUserVerificationCodeEmail(String email,String code) throws Exception {
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
}
