package com.choujiang.controller;

import com.baomidou.mybatisplus.core.metadata.IPage;
import com.choujiang.common.Result;
import com.choujiang.entity.LotteryRecord;
import com.choujiang.service.LotteryService;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/lottery")
public class LotteryController {

    @Autowired
    private LotteryService lotteryService;

    @PostMapping("/draw/{configId}")
    public Result<?> draw(@PathVariable Long configId) {
        return lotteryService.draw(configId);
    }

    @GetMapping("/records")
    public Result<IPage<LotteryRecord>> getRecords(
            HttpServletRequest request,
            @RequestParam(defaultValue = "1") Integer page,
            @RequestParam(defaultValue = "10") Integer size) {
        Long userId = (Long) request.getAttribute("userId");
        return lotteryService.getRecords(userId, page, size);
    }

    @GetMapping("/records/winning")
    public Result<List<LotteryRecord>> getWinningRecords(HttpServletRequest request) {
        Long userId = (Long) request.getAttribute("userId");
        return lotteryService.getWinningRecords(userId);
    }

    @PostMapping("/claim/{recordId}")
    public Result<LotteryRecord> claimPrize(HttpServletRequest request, @PathVariable Long recordId) {
        Long userId = (Long) request.getAttribute("userId");
        return lotteryService.claimPrize(recordId, userId);
    }
}