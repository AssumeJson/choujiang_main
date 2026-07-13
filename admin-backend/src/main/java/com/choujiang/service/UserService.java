package com.choujiang.service;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.choujiang.common.Result;
import com.choujiang.entity.MiniUser;
import com.choujiang.mapper.MiniUserMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class UserService {

    @Autowired
    private MiniUserMapper miniUserMapper;

    public Result<Page<MiniUser>> getUserList(Integer page, Integer size) {
        Page<MiniUser> pageResult = new Page<>(page, size);
        LambdaQueryWrapper<MiniUser> wrapper = new LambdaQueryWrapper<>();
        wrapper.orderByDesc(MiniUser::getCreatedAt);
        miniUserMapper.selectPage(pageResult, wrapper);
        return Result.success(pageResult);
    }

    public Result<MiniUser> getUserById(Long id) {
        MiniUser user = miniUserMapper.selectById(id);
        if (user == null) {
            return Result.error("用户不存在");
        }
        return Result.success(user);
    }
}
