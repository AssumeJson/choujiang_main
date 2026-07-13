package com.choujiang.service;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.choujiang.common.Result;
import com.choujiang.entity.LotteryRecord;
import com.choujiang.mapper.LotteryRecordMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class LotteryRecordService {

    @Autowired
    private LotteryRecordMapper lotteryRecordMapper;

    public Result<Page<LotteryRecord>> getLotteryRecordList(Integer page, Integer size, Integer isWin) {
        Page<LotteryRecord> pageResult = new Page<>(page, size);
        LambdaQueryWrapper<LotteryRecord> wrapper = new LambdaQueryWrapper<>();
        if (isWin != null) {
            wrapper.eq(LotteryRecord::getIsWin, isWin);
        }
        wrapper.orderByDesc(LotteryRecord::getCreatedAt);
        lotteryRecordMapper.selectPage(pageResult, wrapper);
        return Result.success(pageResult);
    }
}
