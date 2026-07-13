package com.choujiang.dto;

import lombok.Data;

@Data
public class MiniLoginResponse {
    private String token;
    private Long userId;
    private String openid;
    private String nickname;
    private String avatar;
    private String phone;
    private Integer hasBindIdCard;
    private Integer hasWon;
    private Integer ticketCount;
}