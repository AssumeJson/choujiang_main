package com.choujiang.controller;

import com.choujiang.common.Result;
import com.choujiang.dto.LoginRequest;
import com.choujiang.dto.LoginResponse;
import com.choujiang.service.AuthService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    @Autowired
    private AuthService authService;

    @PostMapping("/login")
    public Result<LoginResponse> login(@RequestBody LoginRequest request) {
        return authService.login(request);
    }
}
