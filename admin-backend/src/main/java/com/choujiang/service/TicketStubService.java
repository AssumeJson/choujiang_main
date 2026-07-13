package com.choujiang.service;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.choujiang.common.Result;
import com.choujiang.entity.TicketStub;
import com.choujiang.mapper.TicketStubMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class TicketStubService {

    @Autowired
    private TicketStubMapper ticketStubMapper;

    public Result<Page<TicketStub>> getTicketStubList(Integer page, Integer size, String movieName) {
        Page<TicketStub> pageResult = new Page<>(page, size);
        LambdaQueryWrapper<TicketStub> wrapper = new LambdaQueryWrapper<>();
        if (movieName != null && !movieName.isEmpty()) {
            wrapper.like(TicketStub::getMovieName, movieName);
        }
        wrapper.orderByDesc(TicketStub::getCreatedAt);
        ticketStubMapper.selectPage(pageResult, wrapper);
        return Result.success(pageResult);
    }

    public Result<TicketStub> getTicketStubById(Long id) {
        TicketStub stub = ticketStubMapper.selectById(id);
        if (stub == null) {
            return Result.error("票根不存在");
        }
        return Result.success(stub);
    }
}
