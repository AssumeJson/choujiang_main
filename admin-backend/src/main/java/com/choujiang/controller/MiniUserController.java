package com.choujiang.controller;

import com.choujiang.common.Result;
import com.choujiang.dto.MiniLoginRequest;
import com.choujiang.dto.MiniLoginResponse;
import com.choujiang.entity.MiniUser;
import com.choujiang.service.MiniUserService;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/mini")
public class MiniUserController {

    @Autowired
    private MiniUserService miniUserService;

    @PostMapping("/login")
    public Result<MiniLoginResponse> login(@RequestBody MiniLoginRequest request) {
        return miniUserService.login(request);
    }

    @PostMapping("/bind-id-card")
    public Result<MiniUser> bindIdCard(HttpServletRequest request, @RequestBody Map<String, String> body) {
        Long userId = (Long) request.getAttribute("userId");
        String idCard = body.get("idCard");
        return miniUserService.bindIdCard(userId, idCard);
    }

    @GetMapping("/user/info")
    public Result<MiniUser> getUserInfo(HttpServletRequest request) {
        Long userId = (Long) request.getAttribute("userId");
        return miniUserService.getUserById(userId);
    }
}