package com.choujiang.service;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.choujiang.common.Result;
import com.choujiang.config.WechatProperties;
import com.choujiang.dto.MiniLoginRequest;
import com.choujiang.dto.MiniLoginResponse;
import com.choujiang.entity.MiniUser;
import com.choujiang.mapper.MiniUserMapper;
import com.choujiang.util.JwtUtil;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.HashMap;
import java.util.Map;

@Slf4j
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

    @Autowired
    private WechatProperties wechatProperties;

    public Result<MiniLoginResponse> login(MiniLoginRequest request) {
        log.info("[MiniLogin] 收到登录请求: code={}, phoneCode={}", request.getCode(), request.getPhoneCode());

        String openid = null;
        String phoneNumber = null;

        if (request.getCode() != null && !request.getCode().isEmpty()) {
            try {
                String url = "https://api.weixin.qq.com/sns/jscode2session?appid=" + wechatProperties.getAppId() + "&secret=" + wechatProperties.getAppSecret() + "&js_code=" + request.getCode() + "&grant_type=authorization_code";
                log.info("[MiniLogin] 调用微信jscode2session: {}", url);
                String response = restTemplate.getForObject(url, String.class);
                log.info("[MiniLogin] jscode2session返回: {}", response);
                JsonNode node = objectMapper.readTree(response);
                openid = node.has("openid") ? node.get("openid").asText() : null;
                log.info("[MiniLogin] 获取openid: {}", openid);
            } catch (Exception e) {
                log.info("[MiniLogin] 微信登录失败({})，使用模拟openid", e.getMessage());
            }
        }

        if (openid == null || openid.isEmpty()) {
            openid = "mock_openid_" + System.currentTimeMillis();
            log.info("[MiniLogin] 使用模拟openid: {}", openid);
        }

        if (request.getPhoneCode() != null && !request.getPhoneCode().isEmpty()) {
            try {
                String tokenUrl = "https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential&appid=" + wechatProperties.getAppId() + "&secret=" + wechatProperties.getAppSecret();
                log.info("[MiniLogin] 获取access_token: {}", tokenUrl);
                String tokenResponse = restTemplate.getForObject(tokenUrl, String.class);
                log.info("[MiniLogin] access_token返回: {}", tokenResponse);
                JsonNode tokenNode = objectMapper.readTree(tokenResponse);
                String accessToken = tokenNode.has("access_token") ? tokenNode.get("access_token").asText() : null;

                // todo 获取手机号码：小程序需要在微信后台开启"手机号快速验证"能力登录 微信公众平台 → 开发 → 接口设置 → 手机号快速验证 → 开通
                if (accessToken != null) {
                    String phoneUrl = "https://api.weixin.qq.com/wxa/business/getuserphonenumber?access_token=" + accessToken;
                    Map<String, String> phoneBody = new HashMap<>();
                    phoneBody.put("code", request.getPhoneCode());
                    log.info("[MiniLogin] 获取手机号: {}", phoneUrl);
                    String phoneResponse = restTemplate.postForObject(phoneUrl, phoneBody, String.class);
                    log.info("[MiniLogin] 获取手机号返回: {}", phoneResponse);
                    JsonNode phoneNode = objectMapper.readTree(phoneResponse);
                    if (phoneNode.has("errcode") && phoneNode.get("errcode").asInt() == 0) {
                        JsonNode phoneInfo = phoneNode.get("phone_info");
                        phoneNumber = phoneInfo.has("phoneNumber") ? phoneInfo.get("phoneNumber").asText() : null;
                    }
                }
            } catch (Exception e) {
                log.info("[MiniLogin] 获取手机号失败({})，使用模拟手机号", e.getMessage());
            }
        }

        if (phoneNumber == null || phoneNumber.isEmpty()) {
            phoneNumber = "13800138" + (int) (Math.random() * 10000);
            log.info("[MiniLogin] 使用模拟手机号: {}", phoneNumber);
        }

        MiniUser user = null;

        LambdaQueryWrapper<MiniUser> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(MiniUser::getOpenid, openid);
        user = miniUserMapper.selectOne(wrapper);

        if (user == null) {
            wrapper = new LambdaQueryWrapper<>();
            wrapper.eq(MiniUser::getPhone, phoneNumber);
            user = miniUserMapper.selectOne(wrapper);
            if (user != null) {
                log.info("[MiniLogin] 通过手机号找到用户: id={}, phone={}", user.getId(), phoneNumber);
                user.setOpenid(openid);
                miniUserMapper.updateById(user);
            }
        }

        if (user == null) {
            user = new MiniUser();
            user.setOpenid(openid);
            user.setNickname("用户" + phoneNumber.substring(0, 8));
            user.setAvatar("");
            user.setPhone(phoneNumber);
            user.setHasBindIdCard(0);
            user.setHasWon(0);
            user.setTicketCount(0);
            int insertResult = miniUserMapper.insert(user);
            log.info("[MiniLogin] 新建用户: insertResult={}, id={}, phone={}", insertResult, user.getId(), phoneNumber);
        } else {
            log.info("[MiniLogin] 找到已存在用户: id={}, phone={}", user.getId(), phoneNumber);
            user.setPhone(phoneNumber);
            int updateResult = miniUserMapper.updateById(user);
            log.info("[MiniLogin] 更新用户: updateResult={}", updateResult);
        }

        String token = jwtUtil.generateToken(user.getId(), user.getNickname(), user.getPhone());
        log.info("[MiniLogin] 生成token: userId={}, token={}...", user.getId(), token.substring(0, 20));

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

        log.info("[MiniLogin] 登录成功，返回用户信息");
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

    public Result<MiniUser> updateUserInfo(Long userId, String nickname, String avatar) {
        MiniUser user = miniUserMapper.selectById(userId);
        if (user == null) {
            return Result.error("用户不存在");
        }

        if (nickname != null && !nickname.isEmpty()) {
            user.setNickname(nickname);
        }
        if (avatar != null && !avatar.isEmpty()) {
            user.setAvatar(avatar);
        }

        miniUserMapper.updateById(user);
        log.info("[MiniUser] 更新用户信息: userId={}, nickname={}, avatar={}", userId, nickname, avatar);

        return Result.success(user);
    }
}