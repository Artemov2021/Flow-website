package com.example.backend.common;

public class ApiResponse<T> {
    private final boolean success;
    private final T result;
    private final String error;

    private ApiResponse(boolean success, T result, String error) {
        this.success = success;
        this.result = result;
        this.error = error;
    }

    public static <T> ApiResponse<T> success() {
        return new ApiResponse<>(true, null, null);
    }

    public static <T> ApiResponse<T> success(T result) {
        return new ApiResponse<>(true, result, null);
    }

    public static <T> ApiResponse<T> error(String errorMessage) {
        return new ApiResponse<>(false, null, errorMessage);
    }

    public boolean isSuccess() { return success; }
    public T getResult() { return result; }
    public String getError() { return error; }
}
