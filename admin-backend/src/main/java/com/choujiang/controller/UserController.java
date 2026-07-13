package com.choujiang.controller;

import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.choujiang.common.Result;
import com.choujiang.entity.MiniUser;
import com.choujiang.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/users")
public class UserController {

    @Autowired
    private UserService userService;

    @GetMapping
    public Result<Page<MiniUser>> list(
            @RequestParam(defaultValue = "1") Integer page,
            @RequestParam(defaultValue = "10") Integer size) {
        return userService.getUserList(page, size);
    }

    @GetMapping("/{id}")
    public Result<MiniUser> getById(@PathVariable Long id) {
        return userService.getUserById(id);
    }
}
