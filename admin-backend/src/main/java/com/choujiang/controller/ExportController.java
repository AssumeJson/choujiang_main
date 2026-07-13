package com.choujiang.controller;

import com.choujiang.service.ExcelExportService;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.io.IOException;

@RestController
@RequestMapping("/api/export")
public class ExportController {

    @Autowired
    private ExcelExportService excelExportService;

    @GetMapping("/users")
    public void exportUsers(HttpServletResponse response) throws IOException {
        excelExportService.exportUsers(response);
    }

    @GetMapping("/tickets")
    public void exportTickets(HttpServletResponse response) throws IOException {
        excelExportService.exportTickets(response);
    }

    @GetMapping("/lotteries")
    public void exportLotteries(HttpServletResponse response) throws IOException {
        excelExportService.exportLotteries(response);
    }
}
