package com.choujiang.dto;

import lombok.Data;

@Data
public class TicketUploadRequest {
    private String imageUrl;
    private String imageBase64;
    private String movieName;
    private String showTime;
    private String cinema;
    private String cinemaLocation;
    private String seat;
}