package com.choujiang.controller;

import com.baomidou.mybatisplus.core.metadata.IPage;
import com.choujiang.common.Result;
import com.choujiang.dto.TicketUploadRequest;
import com.choujiang.entity.TicketStub;
import com.choujiang.service.TicketService;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/ticket")
public class TicketController {

    @Autowired
    private TicketService ticketService;

    @PostMapping("/upload")
    public Result<TicketStub> uploadTicket(HttpServletRequest request, @RequestBody TicketUploadRequest uploadRequest) {
        Long userId = (Long) request.getAttribute("userId");
        return ticketService.uploadTicket(userId, uploadRequest);
    }

    @GetMapping("/list")
    public Result<IPage<TicketStub>> getTicketList(
            HttpServletRequest request,
            @RequestParam(defaultValue = "1") Integer page,
            @RequestParam(defaultValue = "10") Integer size) {
        Long userId = (Long) request.getAttribute("userId");
        return ticketService.getTicketList(userId, page, size);
    }

    @GetMapping("/stats")
    public Result<Map<String, Object>> getTicketStats() {
        return ticketService.getTicketStats();
    }
}