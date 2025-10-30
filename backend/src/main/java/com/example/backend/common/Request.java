package com.example.backend.common;

public class Request {
    private String email;
    private String password;
    private String typedCode;
    private int userId;
    private int totalWords;
    private int correctWords;

    public void setEmail(String email) {
        this.email = email;
    }
    public void setPassword(String password) {
        this.password = password;
    }
    public void setTypedCode(String typedCode) {
        this.typedCode = typedCode;
    }
    public void setUserId(int userId) {
        this.userId = userId;
    }
    public void setTotalWords(int totalWords) {
        this.totalWords = totalWords;
    }
    public void setCorrectWords(int correctWords) {
        this.correctWords = correctWords;
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
    public int getUserId() {
        return this.userId;
    }
    public int getTotalWords() {
        return this.totalWords;
    }
    public int getCorrectWords() {
        return this.correctWords;
    }
}
