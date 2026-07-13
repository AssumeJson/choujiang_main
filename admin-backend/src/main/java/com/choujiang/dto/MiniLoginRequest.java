package com.choujiang.dto;

import lombok.Data;

@Data
public class MiniLoginRequest {
    private String code;
    private String phoneCode;
}