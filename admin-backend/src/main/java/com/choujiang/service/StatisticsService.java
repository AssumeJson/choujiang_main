package com.choujiang.service;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.choujiang.common.Result;
import com.choujiang.entity.LotteryRecord;
import com.choujiang.entity.MiniUser;
import com.choujiang.entity.TicketStub;
import com.choujiang.mapper.LotteryRecordMapper;
import com.choujiang.mapper.MiniUserMapper;
import com.choujiang.mapper.TicketStubMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class StatisticsService {

    @Autowired
    private MiniUserMapper miniUserMapper;

    @Autowired
    private TicketStubMapper ticketStubMapper;

    @Autowired
    private LotteryRecordMapper lotteryRecordMapper;

    public Result<Map<String, Object>> getDashboardStats() {
        Map<String, Object> result = new HashMap<>();
        
        Long totalUsers = miniUserMapper.selectCount(null);
        if (totalUsers == null) totalUsers = 0L;
        
        Long totalTickets = ticketStubMapper.selectCount(null);
        if (totalTickets == null) totalTickets = 0L;
        
        Long totalLotteries = lotteryRecordMapper.selectCount(null);
        if (totalLotteries == null) totalLotteries = 0L;
        
        LambdaQueryWrapper<LotteryRecord> winWrapper = new LambdaQueryWrapper<>();
        winWrapper.eq(LotteryRecord::getIsWin, 1);
        Long totalWinners = lotteryRecordMapper.selectCount(winWrapper);
        if (totalWinners == null) totalWinners = 0L;
        
        result.put("totalUsers", totalUsers);
        result.put("totalTickets", totalTickets);
        result.put("totalLotteries", totalLotteries);
        result.put("totalWinners", totalWinners);
        
        return Result.success(result);
    }

    public Result<Map<String, Object>> getChartData(String type, String startDate, String endDate) {
        Map<String, Object> result = new HashMap<>();
        
        LocalDateTime start = startDate != null ? LocalDate.parse(startDate).atStartOfDay() : LocalDateTime.now().minusDays(30);
        LocalDateTime end = endDate != null ? LocalDate.parse(endDate).atTime(LocalTime.MAX) : LocalDateTime.now();
        
        if ("daily".equals(type)) {
            List<Map<String, Object>> dailyData = new ArrayList<>();
            
            List<LotteryRecord> records = lotteryRecordMapper.selectList(
                new LambdaQueryWrapper<LotteryRecord>()
                    .ge(LotteryRecord::getCreatedAt, start)
                    .le(LotteryRecord::getCreatedAt, end)
                    .orderByAsc(LotteryRecord::getCreatedAt)
            );
            
            Map<LocalDate, Long> dateCount = records.stream()
                .collect(Collectors.groupingBy(
                    r -> r.getCreatedAt().toLocalDate(),
                    Collectors.counting()
                ));
            
            for (LocalDate date = start.toLocalDate(); !date.isAfter(end.toLocalDate()); date = date.plusDays(1)) {
                Map<String, Object> item = new HashMap<>();
                item.put("date", date.toString());
                item.put("count", dateCount.getOrDefault(date, 0L));
                dailyData.add(item);
            }
            
            result.put("data", dailyData);
        } else if ("movie".equals(type)) {
            List<TicketStub> tickets = ticketStubMapper.selectList(
                new LambdaQueryWrapper<TicketStub>()
                    .ge(TicketStub::getCreatedAt, start)
                    .le(TicketStub::getCreatedAt, end)
            );
            
            Map<String, Long> movieCount = tickets.stream()
                .collect(Collectors.groupingBy(
                    TicketStub::getMovieName,
                    Collectors.counting()
                ));
            
            List<Map<String, Object>> movieData = movieCount.entrySet().stream()
                .map(e -> {
                    Map<String, Object> item = new HashMap<>();
                    item.put("movieName", e.getKey());
                    item.put("count", e.getValue());
                    return item;
                })
                .collect(Collectors.toList());
            
            result.put("data", movieData);
        }
        
        return Result.success(result);
    }
}
