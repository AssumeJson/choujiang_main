package com.choujiang.controller;

import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.choujiang.common.Result;
import com.choujiang.entity.TicketStub;
import com.choujiang.service.TicketStubService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/tickets")
public class TicketStubController {

    @Autowired
    private TicketStubService ticketStubService;

    @GetMapping
    public Result<Page<TicketStub>> list(
            @RequestParam(defaultValue = "1") Integer page,
            @RequestParam(defaultValue = "10") Integer size,
            @RequestParam(required = false) String movieName) {
        return ticketStubService.getTicketStubList(page, size, movieName);
    }

    @GetMapping("/{id}")
    public Result<TicketStub> getById(@PathVariable Long id) {
        return ticketStubService.getTicketStubById(id);
    }
}
