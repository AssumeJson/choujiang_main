package com.choujiang.dto;

import lombok.Data;

@Data
public class MiniLoginRequest {
    private String code;
    private String encryptedData;
    private String iv;
    private String phone;
    private String nickname;
    private String avatar;
}