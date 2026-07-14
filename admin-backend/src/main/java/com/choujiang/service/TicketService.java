package com.choujiang.service;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.choujiang.common.Result;
import com.choujiang.dto.TicketUploadRequest;
import com.choujiang.entity.MiniUser;
import com.choujiang.entity.TicketStub;
import com.choujiang.mapper.MiniUserMapper;
import com.choujiang.mapper.TicketStubMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Service
public class TicketService {

    @Autowired
    private TicketStubMapper ticketStubMapper;

    @Autowired
    private MiniUserMapper miniUserMapper;

    private static final DateTimeFormatter FORMATTER = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");

    public Result<TicketStub> uploadTicket(Long userId, TicketUploadRequest request) {
        String ticketHash = generateTicketHash(request);
        
        LambdaQueryWrapper<TicketStub> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(TicketStub::getTicketHash, ticketHash);
        TicketStub existing = ticketStubMapper.selectOne(wrapper);
        
        if (existing != null) {
            return Result.error("该票根已上传过");
        }

        Map<String, String> ocrResult = simulateOCR(request);

        TicketStub ticket = new TicketStub();
        ticket.setUserId(userId);
        ticket.setImageUrl(request.getImageUrl() != null ? request.getImageUrl() : "");
        ticket.setMovieName(ocrResult.get("movieName"));
        ticket.setCinema(ocrResult.get("cinema"));
        ticket.setCinemaLocation(ocrResult.get("cinemaLocation"));
        ticket.setSeat(ocrResult.get("seat"));
        
        try {
            String showTimeStr = ocrResult.get("showTime");
            if (showTimeStr != null && !showTimeStr.isEmpty()) {
                ticket.setShowTime(LocalDateTime.parse(showTimeStr, FORMATTER));
            }
        } catch (Exception e) {
            ticket.setShowTime(LocalDateTime.now());
        }
        
        ticket.setTicketHash(ticketHash);
        ticket.setIsValid(1);
        ticket.setIsUsedForLottery(0);
        
        ticketStubMapper.insert(ticket);

        MiniUser user = miniUserMapper.selectById(userId);
        if (user != null) {
            user.setTicketCount(user.getTicketCount() != null ? user.getTicketCount() + 1 : 1);
            miniUserMapper.updateById(user);
        }

        return Result.success(ticket);
    }

    private String generateTicketHash(TicketUploadRequest request) {
        try {
            String data = (request.getImageUrl() != null ? request.getImageUrl() : "") 
                    + (request.getMovieName() != null ? request.getMovieName() : "")
                    + (request.getCinema() != null ? request.getCinema() : "")
                    + (request.getShowTime() != null ? request.getShowTime() : "")
                    + (request.getSeat() != null ? request.getSeat() : "")
                    + System.currentTimeMillis();
            
            MessageDigest digest = MessageDigest.getInstance("MD5");
            byte[] hash = digest.digest(data.getBytes(StandardCharsets.UTF_8));
            StringBuilder hexString = new StringBuilder();
            for (byte b : hash) {
                String hex = Integer.toHexString(0xff & b);
                if (hex.length() == 1) {
                    hexString.append('0');
                }
                hexString.append(hex);
            }
            return hexString.toString();
        } catch (Exception e) {
            return UUID.randomUUID().toString();
        }
    }

    private Map<String, String> simulateOCR(TicketUploadRequest request) {
        Map<String, String> result = new HashMap<>();
        
        if (request.getMovieName() != null && !request.getMovieName().isEmpty()) {
            result.put("movieName", request.getMovieName());
        } else {
            String[] movies = {"流浪地球3", "满江红", "长津湖", "战狼2", "你好，李焕英", "独行月球", "消失的她"};
            result.put("movieName", movies[(int) (Math.random() * movies.length)]);
        }
        
        if (request.getCinema() != null && !request.getCinema().isEmpty()) {
            result.put("cinema", request.getCinema());
        } else {
            String[] cinemas = {"万达影城", "中影国际影城", "星美国际影城", "金逸影城", "博纳国际影城"};
            result.put("cinema", cinemas[(int) (Math.random() * cinemas.length)]);
        }
        
        if (request.getCinemaLocation() != null && !request.getCinemaLocation().isEmpty()) {
            result.put("cinemaLocation", request.getCinemaLocation());
        } else {
            String[] locations = {"北京市朝阳区建国路88号", "上海市浦东新区陆家嘴环路1000号", 
                    "广州市天河区珠江新城", "深圳市南山区科技园路", "杭州市西湖区延安路"};
            result.put("cinemaLocation", locations[(int) (Math.random() * locations.length)]);
        }
        
        if (request.getSeat() != null && !request.getSeat().isEmpty()) {
            result.put("seat", request.getSeat());
        } else {
            int row = (int) (Math.random() * 20) + 1;
            int col = (char) ('A' + (int) (Math.random() * 10));
            result.put("seat", row + "排" + col + "座");
        }
        
        if (request.getShowTime() != null && !request.getShowTime().isEmpty()) {
            result.put("showTime", request.getShowTime());
        } else {
            LocalDateTime showTime = LocalDateTime.now().plusDays((long) (Math.random() * 7));
            showTime = showTime.withHour((int) (Math.random() * 12) + 10)
                              .withMinute((int) (Math.random() * 2) * 30);
            result.put("showTime", showTime.format(FORMATTER));
        }
        
        return result;
    }

    public Result<IPage<TicketStub>> getTicketList(Long userId, Integer page, Integer size) {
        Page<TicketStub> pageParam = new Page<>(page, size);
        LambdaQueryWrapper<TicketStub> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(userId != null, TicketStub::getUserId, userId)
               .eq(TicketStub::getIsValid, 1)
               .orderByDesc(TicketStub::getCreatedAt);
        IPage<TicketStub> result = ticketStubMapper.selectPage(pageParam, wrapper);
        return Result.success(result);
    }

    public Result<Map<String, Object>> getTicketStats() {
        Map<String, Object> stats = new HashMap<>();
        

        LambdaQueryWrapper<TicketStub> validWrapper = new LambdaQueryWrapper<>();
        validWrapper.eq(TicketStub::getIsValid, 1);
        Long validCount = ticketStubMapper.selectCount(validWrapper);
        if (validCount == null) {
            validCount = 0L;
        }
        
        LambdaQueryWrapper<TicketStub> usedWrapper = new LambdaQueryWrapper<>();
        usedWrapper.eq(TicketStub::getIsUsedForLottery, 1);
        Long usedCount = ticketStubMapper.selectCount(usedWrapper);
        if (usedCount == null) {
            usedCount = 0L;
        }

        Long uniqueUserCount = ticketStubMapper.selectCount(new LambdaQueryWrapper<TicketStub>()
                .eq(TicketStub::getIsValid, 1)
                .groupBy(TicketStub::getUserId));
        if (uniqueUserCount == null) {
            uniqueUserCount = 0L;
        }
        
        stats.put("totalTicketCount", validCount);
        stats.put("usedTicketCount", usedCount);
        stats.put("unusedTicketCount", validCount - usedCount);
        stats.put("uniqueUserCount", uniqueUserCount);
        
        return Result.success(stats);
    }
}