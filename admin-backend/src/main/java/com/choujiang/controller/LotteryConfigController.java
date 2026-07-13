package com.choujiang.controller;

import com.choujiang.common.Result;
import com.choujiang.entity.LotteryConfig;
import com.choujiang.service.LotteryConfigService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/lottery/config")
public class LotteryConfigController {

    @Autowired
    private LotteryConfigService lotteryConfigService;

    @GetMapping("/current")
    public Result<LotteryConfig> getCurrentConfig() {
        return lotteryConfigService.getCurrentConfig();
    }

    @GetMapping("/list")
    public Result<List<LotteryConfig>> getAllConfigs() {
        return lotteryConfigService.getAllConfigs();
    }

    @PostMapping
    public Result<LotteryConfig> createConfig(@RequestBody LotteryConfig config) {
        return lotteryConfigService.createConfig(config);
    }

    @PutMapping("/{id}")
    public Result<LotteryConfig> updateConfig(@PathVariable Long id, @RequestBody LotteryConfig config) {
        return lotteryConfigService.updateConfig(id, config);
    }

    @DeleteMapping("/{id}")
    public Result<Void> deleteConfig(@PathVariable Long id) {
        return lotteryConfigService.deleteConfig(id);
    }
}