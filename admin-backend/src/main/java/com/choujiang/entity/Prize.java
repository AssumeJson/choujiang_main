package com.choujiang.entity;

import com.baomidou.mybatisplus.annotation.*;
import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@TableName("prize")
public class Prize {
    @TableId(type = IdType.AUTO)
    private Long id;

    private String name;

    private String description;

    private String image;

    private BigDecimal probability;

    private Integer stock;

    private Integer sort;

    @TableField(fill = FieldFill.INSERT)
    private LocalDateTime createdAt;

    @TableField(fill = FieldFill.INSERT_UPDATE)
    private LocalDateTime updatedAt;

    @TableLogic
    private Integer deleted;
}
