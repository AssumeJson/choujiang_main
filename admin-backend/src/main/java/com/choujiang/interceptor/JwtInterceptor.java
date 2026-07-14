package com.choujiang.interceptor;

import com.choujiang.util.JwtUtil;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;
import org.springframework.web.servlet.HandlerInterceptor;

@Component
@Slf4j
public class JwtInterceptor implements HandlerInterceptor {

    @Autowired
    private JwtUtil jwtUtil;

    @Override
    public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler) throws Exception {
        String uri = request.getRequestURI();
        String token = request.getHeader("Authorization");

        log.info("[JwtInterceptor] 请求路径: {}, Authorization: {}", uri, token != null ? "存在(" + token.substring(0, Math.min(20, token.length())) + "..." + ")" : "不存在");
        
        if (token == null || !token.startsWith("Bearer ")) {
            log.info("[JwtInterceptor] token为空或格式错误，拒绝访问: {}", uri);
            response.setStatus(401);
            response.setContentType("application/json;charset=UTF-8");
            response.getWriter().write("{\"code\":401,\"message\":\"未登录或token无效\"}");
            return false;
        }
        
        token = token.substring(7);
        
        try {
            if (jwtUtil.isTokenExpired(token)) {
                log.info("[JwtInterceptor] token已过期: " + uri);
                response.setStatus(401);
                response.setContentType("application/json;charset=UTF-8");
                response.getWriter().write("{\"code\":401,\"message\":\"token已过期\"}");
                return false;
            }
            
            Long userId = jwtUtil.getUserIdFromToken(token);
            log.info("[JwtInterceptor] 从token中解析userId: {}, 请求路径: {}", userId, uri);
            request.setAttribute("userId", userId);
            log.info("[JwtInterceptor] token验证成功，userId: {}, 请求路径: {}", userId, uri);
            return true;
        } catch (Exception e) {
            log.info("[JwtInterceptor] token验证失败({}): {}", e.getMessage(), uri);
            response.setStatus(401);
            response.setContentType("application/json;charset=UTF-8");
            response.getWriter().write("{\"code\":401,\"message\":\"token验证失败\"}");
            return false;
        }
    }
}
