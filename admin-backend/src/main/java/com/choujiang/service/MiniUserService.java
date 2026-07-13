package com.choujiang.service;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.choujiang.common.Result;
import com.choujiang.dto.MiniLoginRequest;
import com.choujiang.dto.MiniLoginResponse;
import com.choujiang.entity.MiniUser;
import com.choujiang.mapper.MiniUserMapper;
import com.choujiang.util.JwtUtil;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.util.HashMap;
import java.util.Map;

@Service
public class MiniUserService {

    @Autowired
    private MiniUserMapper miniUserMapper;

    @Autowired
    private JwtUtil jwtUtil;

    @Autowired
    private RestTemplate restTemplate;

    @Autowired
    private ObjectMapper objectMapper;

    public Result<MiniLoginResponse> login(MiniLoginRequest request) {
        String openid = null;
        
        if (request.getCode() != null && !request.getCode().isEmpty()) {
            try {
                String url = "https://api.weixin.qq.com/sns/jscode2session?appid=wx9e7dcfbb0b737e10&secret=your-secret&js_code=" + request.getCode() + "&grant_type=authorization_code";
                String response = restTemplate.getForObject(url, String.class);
                JsonNode node = objectMapper.readTree(response);
                openid = node.has("openid") ? node.get("openid").asText() : null;
            } catch (Exception e) {
                System.out.println("微信登录失败，使用模拟openid");
            }
        }

        if (openid == null || openid.isEmpty()) {
            openid = "mock_openid_" + System.currentTimeMillis();
        }

        LambdaQueryWrapper<MiniUser> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(MiniUser::getOpenid, openid);
        MiniUser user = miniUserMapper.selectOne(wrapper);

        if (user == null) {
            user = new MiniUser();
            user.setOpenid(openid);
            user.setNickname(request.getNickname() != null ? request.getNickname() : "用户" + openid.substring(0, 8));
            user.setAvatar(request.getAvatar() != null ? request.getAvatar() : "");
            user.setHasBindIdCard(0);
            user.setHasWon(0);
            user.setTicketCount(0);
            miniUserMapper.insert(user);
        } else {
            if (request.getNickname() != null && !request.getNickname().isEmpty()) {
                user.setNickname(request.getNickname());
            }
            if (request.getAvatar() != null && !request.getAvatar().isEmpty()) {
                user.setAvatar(request.getAvatar());
            }
        }

        if (request.getPhone() != null && !request.getPhone().isEmpty()) {
            user.setPhone(request.getPhone());
        }

        miniUserMapper.updateById(user);

        String token = jwtUtil.generateToken(user.getId(), user.getNickname(), user.getPhone());
        
        MiniLoginResponse response = new MiniLoginResponse();
        response.setToken(token);
        response.setUserId(user.getId());
        response.setOpenid(user.getOpenid());
        response.setNickname(user.getNickname());
        response.setAvatar(user.getAvatar());
        response.setPhone(user.getPhone());
        response.setHasBindIdCard(user.getHasBindIdCard());
        response.setHasWon(user.getHasWon());
        response.setTicketCount(user.getTicketCount());

        return Result.success(response);
    }

    public Result<MiniUser> bindIdCard(Long userId, String idCard) {
        MiniUser user = miniUserMapper.selectById(userId);
        if (user == null) {
            return Result.error("用户不存在");
        }
        
        user.setIdCard(idCard);
        user.setHasBindIdCard(1);
        miniUserMapper.updateById(user);
        
        return Result.success(user);
    }

    public Result<MiniUser> getUserById(Long userId) {
        MiniUser user = miniUserMapper.selectById(userId);
        if (user == null) {
            return Result.error("用户不存在");
        }
        return Result.success(user);
    }
}