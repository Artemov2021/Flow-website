package com.example.backend.service;

import com.resend.Resend;
import com.resend.core.exception.ResendException;
import com.resend.services.emails.model.SendEmailRequest;
import com.resend.services.emails.model.SendEmailResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

@Service
public class EmailService {

    @Value("${RESEND_API_KEY}")
    private String apiKey;

    @Value("${EMAIL_FROM}")
    private String fromEmail;

    @Value("${EMAIL_FROM_NAME}")
    private String fromName;

    public void sendUserVerificationCodeEmail(String toEmail, String code) throws ResendException {
        // Create Resend client
        Resend resend = new Resend(apiKey);

        // Build the email
        SendEmailRequest sendEmailRequest = SendEmailRequest.builder()
                .from(String.format("%s <%s>", fromName, fromEmail))
                .to(toEmail)
                .subject("Your Verification Code")
                .html(String.format("""
                    <html>
                      <body style="font-family: Arial, sans-serif; background-color:#f7f7f7; padding:20px;">
                        <table width="100%%" style="max-width:480px; margin:auto; background:white; border-radius:10px; padding:20px;">
                          <tr><td style="text-align:center;">
                            <h1 style="color:#2563eb;">Flow</h1>
                            <p style="font-size:18px; color:#444;">Your verification code is:</p>
                            <p style="font-size:36px; font-weight:bold; color:#111;">%s</p>
                            <p style="font-size:14px; color:#777;">This code expires in 5 minutes.</p>
                          </td></tr>
                        </table>
                      </body>
                    </html>
                """, code))
                .build();

        // Send it
        SendEmailResponse response = resend.emails().send(sendEmailRequest);

        System.out.println("✅ Email sent with ID: " + response.getId());
    }
}
