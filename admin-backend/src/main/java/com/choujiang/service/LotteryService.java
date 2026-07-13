package com.choujiang.service;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.choujiang.common.Result;
import com.choujiang.entity.LotteryConfig;
import com.choujiang.entity.LotteryRecord;
import com.choujiang.entity.MiniUser;
import com.choujiang.entity.TicketStub;
import com.choujiang.mapper.LotteryConfigMapper;
import com.choujiang.mapper.LotteryRecordMapper;
import com.choujiang.mapper.MiniUserMapper;
import com.choujiang.mapper.TicketStubMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.*;

@Service
public class LotteryService {

    @Autowired
    private LotteryRecordMapper lotteryRecordMapper;

    @Autowired
    private TicketStubMapper ticketStubMapper;

    @Autowired
    private MiniUserMapper miniUserMapper;

    @Autowired
    private LotteryConfigMapper lotteryConfigMapper;

    @Transactional
    public Result<Map<String, Object>> draw(Long configId) {
        LotteryConfig config = lotteryConfigMapper.selectById(configId);
        if (config == null) {
            return Result.error("抽奖配置不存在");
        }

        LocalDateTime now = LocalDateTime.now();
        if (now.isBefore(config.getDrawTime())) {
            return Result.error("抽奖时间未到，请耐心等待");
        }

        if (config.getStatus() == 2) {
            return Result.error("该活动已开奖");
        }

        LambdaQueryWrapper<TicketStub> ticketWrapper = new LambdaQueryWrapper<>();
        ticketWrapper.eq(TicketStub::getIsValid, 1)
                     .eq(TicketStub::getIsUsedForLottery, 0);
        List<TicketStub> validTickets = ticketStubMapper.selectList(ticketWrapper);

        if (validTickets.isEmpty()) {
            return Result.error("没有可用于抽奖的票根");
        }

        Set<Long> alreadyWonUsers = new HashSet<>();
        LambdaQueryWrapper<MiniUser> userWrapper = new LambdaQueryWrapper<>();
        userWrapper.eq(MiniUser::getHasWon, 1);
        List<MiniUser> wonUsers = miniUserMapper.selectList(userWrapper);
        for (MiniUser user : wonUsers) {
            alreadyWonUsers.add(user.getId());
        }

        List<TicketStub> eligibleTickets = new ArrayList<>();
        for (TicketStub ticket : validTickets) {
            if (!alreadyWonUsers.contains(ticket.getUserId())) {
                eligibleTickets.add(ticket);
            }
        }

        if (eligibleTickets.isEmpty()) {
            return Result.error("所有用户都已中奖，无法继续抽奖");
        }

        Collections.shuffle(eligibleTickets);
        int winnerCount = Math.min(5, eligibleTickets.size());
        
        List<LotteryRecord> winners = new ArrayList<>();
        String[] prizes = {"一等奖：免费电影票10张", "二等奖：爆米花套餐5份", "三等奖：饮料兑换券3张", "幸运奖：小礼品1份", "参与奖：积分100分"};
        
        for (int i = 0; i < winnerCount; i++) {
            TicketStub winningTicket = eligibleTickets.get(i);
            
            LotteryRecord record = new LotteryRecord();
            record.setUserId(winningTicket.getUserId());
            record.setTicketStubId(winningTicket.getId());
            record.setPrizeName(prizes[i]);
            record.setLotteryConfigId(configId);
            record.setIsWin(1);
            record.setIsClaimed(0);
            
            lotteryRecordMapper.insert(record);
            winners.add(record);

            winningTicket.setIsUsedForLottery(1);
            ticketStubMapper.updateById(winningTicket);

            MiniUser user = miniUserMapper.selectById(winningTicket.getUserId());
            if (user != null) {
                user.setHasWon(1);
                miniUserMapper.updateById(user);
            }
        }

        for (int i = winnerCount; i < eligibleTickets.size(); i++) {
            TicketStub ticket = eligibleTickets.get(i);
            
            LotteryRecord record = new LotteryRecord();
            record.setUserId(ticket.getUserId());
            record.setTicketStubId(ticket.getId());
            record.setLotteryConfigId(configId);
            record.setIsWin(0);
            record.setIsClaimed(0);
            
            lotteryRecordMapper.insert(record);

            ticket.setIsUsedForLottery(1);
            ticketStubMapper.updateById(ticket);
        }

        config.setStatus(2);
        lotteryConfigMapper.updateById(config);

        Map<String, Object> result = new HashMap<>();
        result.put("winners", winners);
        result.put("totalEligible", eligibleTickets.size());
        result.put("winnerCount", winnerCount);
        result.put("configId", configId);

        return Result.success(result);
    }

    public Result<IPage<LotteryRecord>> getRecords(Long userId, Integer page, Integer size) {
        Page<LotteryRecord> pageParam = new Page<>(page, size);
        LambdaQueryWrapper<LotteryRecord> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(userId != null, LotteryRecord::getUserId, userId)
               .orderByDesc(LotteryRecord::getCreatedAt);
        IPage<LotteryRecord> result = lotteryRecordMapper.selectPage(pageParam, wrapper);
        return Result.success(result);
    }

    public Result<List<LotteryRecord>> getWinningRecords(Long userId) {
        LambdaQueryWrapper<LotteryRecord> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(LotteryRecord::getIsWin, 1);
        if (userId != null) {
            wrapper.eq(LotteryRecord::getUserId, userId);
        }
        wrapper.orderByDesc(LotteryRecord::getCreatedAt);
        List<LotteryRecord> result = lotteryRecordMapper.selectList(wrapper);
        return Result.success(result);
    }

    @Transactional
    public Result<LotteryRecord> claimPrize(Long recordId, Long userId) {
        LotteryRecord record = lotteryRecordMapper.selectById(recordId);
        if (record == null) {
            return Result.error("记录不存在");
        }

        if (!record.getUserId().equals(userId)) {
            return Result.error("无权操作该记录");
        }

        if (record.getIsWin() != 1) {
            return Result.error("未中奖，无法兑奖");
        }

        if (record.getIsClaimed() == 1) {
            return Result.error("奖品已领取");
        }

        record.setIsClaimed(1);
        record.setClaimTime(LocalDateTime.now());
        lotteryRecordMapper.updateById(record);

        return Result.success(record);
    }
}