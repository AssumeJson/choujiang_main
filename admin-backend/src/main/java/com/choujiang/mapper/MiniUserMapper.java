package com.choujiang.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.choujiang.entity.MiniUser;
import org.apache.ibatis.annotations.Mapper;

@Mapper
public interface MiniUserMapper extends BaseMapper<MiniUser> {
}
