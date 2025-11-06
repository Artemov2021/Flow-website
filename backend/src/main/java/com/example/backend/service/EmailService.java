package com.example.backend.service;

import jakarta.mail.*;
import jakarta.mail.internet.InternetAddress;
import jakarta.mail.internet.MimeMessage;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.util.Properties;

@Service
public class EmailService {

    @Value("${EMAIL_USERNAME}")
    private String FROM;

    @Value("${EMAIL_PASSWORD}")
    private String PASSWORD;

    public void sendUserVerificationCodeEmail(String email, String code) throws Exception {

        Properties props = new Properties();
        props.put("mail.smtp.auth", "true");
        props.put("mail.smtp.starttls.enable", "true");
        props.put("mail.smtp.host", "smtp.gmail.com");
        props.put("mail.smtp.port", "587");

        Session session = Session.getInstance(props, new Authenticator() {
            @Override
            protected PasswordAuthentication getPasswordAuthentication() {
                return new PasswordAuthentication(FROM, PASSWORD);
            }
        });

        Message message = new MimeMessage(session);
        message.setFrom(new InternetAddress(FROM));
        message.setRecipients(Message.RecipientType.TO, InternetAddress.parse(email));
        message.setSubject("Your Verification Code");

        String htmlContent =
                """
                <html>
                    <body>
                        <p style="font-size:42px;">
                            Your verification code is: <b>%s</b>
                        </p>
                    </body>
                </html>
                """.formatted(code);

        message.setContent(htmlContent, "text/html; charset=utf-8");
        Transport.send(message);
    }
}
