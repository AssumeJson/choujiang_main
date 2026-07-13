package com.choujiang.controller;

import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.choujiang.common.Result;
import com.choujiang.entity.LotteryRecord;
import com.choujiang.service.LotteryRecordService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/lotteries")
public class LotteryRecordController {

    @Autowired
    private LotteryRecordService lotteryRecordService;

    @GetMapping
    public Result<Page<LotteryRecord>> list(
            @RequestParam(defaultValue = "1") Integer page,
            @RequestParam(defaultValue = "10") Integer size,
            @RequestParam(required = false) Integer isWin) {
        return lotteryRecordService.getLotteryRecordList(page, size, isWin);
    }
}
