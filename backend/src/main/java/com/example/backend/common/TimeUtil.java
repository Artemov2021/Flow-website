package com.example.backend.common;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

public class TimeUtil {
    public static String getCurrentTime() {
        return LocalDateTime.now()
                .format(DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm"));
    }
    public static String getCurrentDate() {
        return LocalDateTime.now()
                .format(DateTimeFormatter.ofPattern("yyyy-MM-dd"));
    }
    public static int countConsecutiveDaysUpToToday(List<String> dateStrings) {
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd");

        Set<LocalDate> dates = new HashSet<>();
        for (String s : dateStrings) {
            dates.add(LocalDate.parse(s, formatter));
        }

        LocalDate current = LocalDate.now(); // include today
        int streak = 0;

        while (dates.contains(current)) {
            streak++;
            current = current.minusDays(1);
        }

        return streak;
    }

}
