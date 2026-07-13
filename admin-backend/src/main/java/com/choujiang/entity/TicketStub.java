package com.choujiang.entity;

import com.baomidou.mybatisplus.annotation.*;
import lombok.Data;
import java.time.LocalDateTime;

@Data
@TableName("ticket_stub")
public class TicketStub {
    @TableId(type = IdType.AUTO)
    private Long id;

    private Long userId;

    private String imageUrl;

    private String movieName;

    private LocalDateTime showTime;

    private String cinema;

    private String cinemaLocation;

    private String seat;

    private String ticketHash;

    private Integer isValid;

    private Integer isUsedForLottery;

    @TableField(fill = FieldFill.INSERT)
    private LocalDateTime createdAt;

    @TableField(fill = FieldFill.INSERT_UPDATE)
    private LocalDateTime updatedAt;

    @TableLogic
    private Integer deleted;
}