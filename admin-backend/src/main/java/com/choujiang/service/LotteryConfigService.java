package com.choujiang.service;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.choujiang.common.Result;
import com.choujiang.entity.LotteryConfig;
import com.choujiang.mapper.LotteryConfigMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class LotteryConfigService {

    @Autowired
    private LotteryConfigMapper lotteryConfigMapper;

    public Result<LotteryConfig> getCurrentConfig() {
        LambdaQueryWrapper<LotteryConfig> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(LotteryConfig::getStatus, 1)
               .orderByDesc(LotteryConfig::getCreatedAt)
               .last("LIMIT 1");
        LotteryConfig config = lotteryConfigMapper.selectOne(wrapper);
        
        if (config != null) {
            LocalDateTime now = LocalDateTime.now();
            if (now.isAfter(config.getDrawTime())) {
                config.setStatus(2);
                lotteryConfigMapper.updateById(config);
            }
        }
        
        return Result.success(config);
    }

    public Result<List<LotteryConfig>> getAllConfigs() {
        LambdaQueryWrapper<LotteryConfig> wrapper = new LambdaQueryWrapper<>();
        wrapper.orderByDesc(LotteryConfig::getCreatedAt);
        List<LotteryConfig> list = lotteryConfigMapper.selectList(wrapper);
        return Result.success(list);
    }

    public Result<LotteryConfig> createConfig(LotteryConfig config) {
        if (config.getStatus() == null) {
            config.setStatus(0);
        }
        lotteryConfigMapper.insert(config);
        return Result.success(config);
    }

    public Result<LotteryConfig> updateConfig(Long id, LotteryConfig config) {
        LotteryConfig existing = lotteryConfigMapper.selectById(id);
        if (existing == null) {
            return Result.error("配置不存在");
        }
        
        if (config.getName() != null) {
            existing.setName(config.getName());
        }
        if (config.getStartTime() != null) {
            existing.setStartTime(config.getStartTime());
        }
        if (config.getEndTime() != null) {
            existing.setEndTime(config.getEndTime());
        }
        if (config.getDrawTime() != null) {
            existing.setDrawTime(config.getDrawTime());
        }
        if (config.getStatus() != null) {
            existing.setStatus(config.getStatus());
        }
        if (config.getDescription() != null) {
            existing.setDescription(config.getDescription());
        }
        
        lotteryConfigMapper.updateById(existing);
        return Result.success(existing);
    }

    public Result<Void> deleteConfig(Long id) {
        lotteryConfigMapper.deleteById(id);
        return Result.success();
    }
}