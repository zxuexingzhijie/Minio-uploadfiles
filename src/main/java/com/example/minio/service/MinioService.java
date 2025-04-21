package com.example.minio.service;

import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Map;

public interface MinioService {

    /**
     * 初始化存储桶
     */
    void initBucket();

    /**
     * 上传完整文件
     * @param file 文件
     * @return 文件信息
     */
    Map<String, Object> uploadFile(MultipartFile file);

    /**
     * 初始化分片上传
     * @param fileName 文件名
     * @param fileSize 文件大小
     * @return 上传ID
     */
    String initMultiPartUpload(String fileName, Long fileSize);

    /**
     * 上传分片
     * @param uploadId 上传ID
     * @param partNumber 分片序号
     * @param file 分片文件
     * @return 分片ETag
     */
    String uploadPart(String uploadId, int partNumber, MultipartFile file);

    /**
     * 完成分片上传
     * @param uploadId 上传ID
     * @param fileName 文件名
     * @param parts 分片信息
     * @return 文件信息
     */
    Map<String, Object> completeMultiPartUpload(String uploadId, String fileName, List<Map<String, Object>> parts);

    /**
     * 获取文件列表
     * @return 文件列表
     */
    List<Map<String, Object>> listFiles();

    /**
     * 获取文件访问URL
     * @param fileName 文件名
     * @return 访问URL
     */
    String getFileUrl(String fileName);

    /**
     * 删除文件
     * @param fileName 文件名
     */
    void deleteFile(String fileName);
} 