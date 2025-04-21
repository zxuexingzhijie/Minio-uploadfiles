package com.example.minio.controller;

import com.example.minio.service.MinioService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Slf4j
@RestController
@RequestMapping("/api/files")
@CrossOrigin(origins = "*")
public class FileController {

    @Autowired
    private MinioService minioService;

    /**
     * 上传完整文件
     */
    @PostMapping("/upload")
    public ResponseEntity<Map<String, Object>> uploadFile(@RequestParam("file") MultipartFile file) {
        try {
            Map<String, Object> result = minioService.uploadFile(file);
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            log.error("文件上传失败: {}", e.getMessage(), e);
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("error", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
        }
    }

    /**
     * 初始化分片上传
     */
    @PostMapping("/upload/init")
    public ResponseEntity<Map<String, Object>> initMultiPartUpload(
            @RequestParam("fileName") String fileName,
            @RequestParam("fileSize") Long fileSize) {
        try {
            String uploadId = minioService.initMultiPartUpload(fileName, fileSize);
            Map<String, Object> result = new HashMap<>();
            result.put("uploadId", uploadId);
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            log.error("初始化分片上传失败: {}", e.getMessage(), e);
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("error", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
        }
    }

    /**
     * 上传分片
     */
    @PostMapping("/upload/part")
    public ResponseEntity<Map<String, Object>> uploadPart(
            @RequestParam("uploadId") String uploadId,
            @RequestParam("partNumber") int partNumber,
            @RequestParam("file") MultipartFile file) {
        try {
            String etag = minioService.uploadPart(uploadId, partNumber, file);
            Map<String, Object> result = new HashMap<>();
            result.put("etag", etag);
            result.put("partNumber", partNumber);
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            log.error("上传分片失败: {}", e.getMessage(), e);
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("error", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
        }
    }

    /**
     * 完成分片上传
     */
    @PostMapping("/upload/complete")
    public ResponseEntity<Map<String, Object>> completeMultiPartUpload(
            @RequestParam("uploadId") String uploadId,
            @RequestParam("fileName") String fileName,
            @RequestBody List<Map<String, Object>> parts) {
        try {
            Map<String, Object> result = minioService.completeMultiPartUpload(uploadId, fileName, parts);
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            log.error("完成分片上传失败: {}", e.getMessage(), e);
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("error", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
        }
    }

    /**
     * 获取文件列表
     */
    @GetMapping("/list")
    public ResponseEntity<List<Map<String, Object>>> listFiles() {
        try {
            List<Map<String, Object>> files = minioService.listFiles();
            return ResponseEntity.ok(files);
        } catch (Exception e) {
            log.error("获取文件列表失败: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * 获取文件URL
     */
    @GetMapping("/url")
    public ResponseEntity<Map<String, Object>> getFileUrl(@RequestParam("fileName") String fileName) {
        try {
            String url = minioService.getFileUrl(fileName);
            Map<String, Object> result = new HashMap<>();
            result.put("url", url);
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            log.error("获取文件URL失败: {}", e.getMessage(), e);
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("error", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
        }
    }

    /**
     * 删除文件
     */
    @DeleteMapping("/{fileName}")
    public ResponseEntity<Void> deleteFile(@PathVariable("fileName") String fileName) {
        try {
            minioService.deleteFile(fileName);
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            log.error("删除文件失败: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
} 