package com.choujiang.controller;

import com.choujiang.common.Result;
import com.choujiang.service.StatisticsService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/statistics")
public class StatisticsController {

    @Autowired
    private StatisticsService statisticsService;

    @GetMapping("/dashboard")
    public Result<Map<String, Object>> getDashboardStats() {
        return statisticsService.getDashboardStats();
    }

    @GetMapping("/chart")
    public Result<Map<String, Object>> getChartData(
            @RequestParam String type,
            @RequestParam(required = false) String startDate,
            @RequestParam(required = false) String endDate) {
        return statisticsService.getChartData(type, startDate, endDate);
    }
}
