package com.example.backend.common;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.HashSet;
import java.util.List;
import java.util.Locale;
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
        // Use the formatter that matches your input: 2025.10.24
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd");

        Set<LocalDate> dates = new HashSet<>();
        for (String s : dateStrings) {
            dates.add(LocalDate.parse(s, formatter));
        }

        int streak = 1;                      // start with today
        LocalDate cur = LocalDate.now().minusDays(1); // check yesterday first

        while (dates.contains(cur)) {        // keep going back while each day exists
            streak++;
            cur = cur.minusDays(1);
        }

        return streak;
    }
    public static String getConvertedCreatedAtDate(String inputDate) {
        // Parse the input string into a LocalDate
        LocalDate date = LocalDate.parse(inputDate);

        // Define a formatter for the desired output format
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("d. MMMM yyyy", Locale.ENGLISH);

        // Format the date
        return date.format(formatter);
    }
}
