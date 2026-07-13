package com.choujiang.entity;

import com.baomidou.mybatisplus.annotation.*;
import lombok.Data;
import java.time.LocalDateTime;

@Data
@TableName("lottery_record")
public class LotteryRecord {
    @TableId(type = IdType.AUTO)
    private Long id;

    private Long userId;

    private Long ticketStubId;

    private Long prizeId;

    private String prizeName;

    private Long lotteryConfigId;

    private Integer isWin;

    private Integer isClaimed;

    private LocalDateTime claimTime;

    @TableField(fill = FieldFill.INSERT)
    private LocalDateTime createdAt;

    @TableLogic
    private Integer deleted;
}