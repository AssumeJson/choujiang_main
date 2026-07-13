package com.choujiang.service;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.choujiang.entity.LotteryRecord;
import com.choujiang.entity.MiniUser;
import com.choujiang.entity.TicketStub;
import com.choujiang.mapper.LotteryRecordMapper;
import com.choujiang.mapper.MiniUserMapper;
import com.choujiang.mapper.TicketStubMapper;
import jakarta.servlet.ServletOutputStream;
import jakarta.servlet.http.HttpServletResponse;
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.time.format.DateTimeFormatter;
import java.util.List;

@Service
public class ExcelExportService {

    @Autowired
    private MiniUserMapper miniUserMapper;

    @Autowired
    private TicketStubMapper ticketStubMapper;

    @Autowired
    private LotteryRecordMapper lotteryRecordMapper;

    private static final DateTimeFormatter DATE_TIME_FORMATTER = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");

    public void exportUsers(HttpServletResponse response) throws IOException {
        List<MiniUser> users = miniUserMapper.selectList(null);
        
        Workbook workbook = new XSSFWorkbook();
        Sheet sheet = workbook.createSheet("用户列表");
        
        Row headerRow = sheet.createRow(0);
        String[] headers = {"ID", "OpenID", "昵称", "抽奖次数", "是否中奖", "创建时间"};
        for (int i = 0; i < headers.length; i++) {
            Cell cell = headerRow.createCell(i);
            cell.setCellValue(headers[i]);
        }
        
        int rowNum = 1;
        for (MiniUser user : users) {
            Row row = sheet.createRow(rowNum++);
            row.createCell(0).setCellValue(user.getId());
            row.createCell(1).setCellValue(user.getOpenid());
            row.createCell(2).setCellValue(user.getNickname());
            row.createCell(3).setCellValue(user.getTicketCount());
            row.createCell(4).setCellValue(user.getHasWon() == 1 ? "是" : "否");
            row.createCell(5).setCellValue(user.getCreatedAt().format(DATE_TIME_FORMATTER));
        }
        
        response.setContentType("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
        response.setCharacterEncoding("utf-8");
        String fileName = URLEncoder.encode("用户列表", StandardCharsets.UTF_8).replaceAll("\\+", "%20");
        response.setHeader("Content-disposition", "attachment;filename*=utf-8''" + fileName + ".xlsx");
        
        ServletOutputStream outputStream = response.getOutputStream();
        workbook.write(outputStream);
        workbook.close();
        outputStream.close();
    }

    public void exportTickets(HttpServletResponse response) throws IOException {
        List<TicketStub> tickets = ticketStubMapper.selectList(
            new LambdaQueryWrapper<TicketStub>().orderByDesc(TicketStub::getCreatedAt)
        );
        
        Workbook workbook = new XSSFWorkbook();
        Sheet sheet = workbook.createSheet("票根列表");
        
        Row headerRow = sheet.createRow(0);
        String[] headers = {"ID", "用户ID", "电影名称", "放映时间", "影院", "创建时间"};
        for (int i = 0; i < headers.length; i++) {
            Cell cell = headerRow.createCell(i);
            cell.setCellValue(headers[i]);
        }
        
        int rowNum = 1;
        for (TicketStub ticket : tickets) {
            Row row = sheet.createRow(rowNum++);
            row.createCell(0).setCellValue(ticket.getId());
            row.createCell(1).setCellValue(ticket.getUserId());
            row.createCell(2).setCellValue(ticket.getMovieName());
            row.createCell(3).setCellValue(ticket.getShowTime().format(DATE_TIME_FORMATTER));
            row.createCell(4).setCellValue(ticket.getCinema());
            row.createCell(5).setCellValue(ticket.getCreatedAt().format(DATE_TIME_FORMATTER));
        }
        
        response.setContentType("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
        response.setCharacterEncoding("utf-8");
        String fileName = URLEncoder.encode("票根列表", StandardCharsets.UTF_8).replaceAll("\\+", "%20");
        response.setHeader("Content-disposition", "attachment;filename*=utf-8''" + fileName + ".xlsx");
        
        ServletOutputStream outputStream = response.getOutputStream();
        workbook.write(outputStream);
        workbook.close();
        outputStream.close();
    }

    public void exportLotteries(HttpServletResponse response) throws IOException {
        List<LotteryRecord> records = lotteryRecordMapper.selectList(
            new LambdaQueryWrapper<LotteryRecord>().orderByDesc(LotteryRecord::getCreatedAt)
        );
        
        Workbook workbook = new XSSFWorkbook();
        Sheet sheet = workbook.createSheet("抽奖记录");
        
        Row headerRow = sheet.createRow(0);
        String[] headers = {"ID", "用户ID", "票根ID", "奖项名称", "是否中奖", "创建时间"};
        for (int i = 0; i < headers.length; i++) {
            Cell cell = headerRow.createCell(i);
            cell.setCellValue(headers[i]);
        }
        
        int rowNum = 1;
        for (LotteryRecord record : records) {
            Row row = sheet.createRow(rowNum++);
            row.createCell(0).setCellValue(record.getId());
            row.createCell(1).setCellValue(record.getUserId());
            row.createCell(2).setCellValue(record.getTicketStubId());
            row.createCell(3).setCellValue(record.getPrizeName());
            row.createCell(4).setCellValue(record.getIsWin() == 1 ? "是" : "否");
            row.createCell(5).setCellValue(record.getCreatedAt().format(DATE_TIME_FORMATTER));
        }
        
        response.setContentType("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
        response.setCharacterEncoding("utf-8");
        String fileName = URLEncoder.encode("抽奖记录", StandardCharsets.UTF_8).replaceAll("\\+", "%20");
        response.setHeader("Content-disposition", "attachment;filename*=utf-8''" + fileName + ".xlsx");
        
        ServletOutputStream outputStream = response.getOutputStream();
        workbook.write(outputStream);
        workbook.close();
        outputStream.close();
    }
}
