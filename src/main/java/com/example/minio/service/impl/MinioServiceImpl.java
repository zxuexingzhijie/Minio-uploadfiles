package com.example.minio.service.impl;

import com.example.minio.config.MinioConfig;
import com.example.minio.service.MinioService;
import io.minio.*;
import io.minio.http.Method;
import io.minio.messages.Item;
import io.minio.messages.Part;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import javax.annotation.PostConstruct;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.concurrent.TimeUnit;

@Slf4j
@Service
public class MinioServiceImpl implements MinioService {

    @Autowired
    private MinioClient minioClient;

    @Autowired
    private MinioConfig minioConfig;

    @PostConstruct
    public void init() {
        initBucket();
    }

    @Override
    public void initBucket() {
        try {
            boolean bucketExists = minioClient.bucketExists(BucketExistsArgs.builder()
                    .bucket(minioConfig.getBucketName())
                    .build());
            if (!bucketExists) {
                minioClient.makeBucket(MakeBucketArgs.builder()
                        .bucket(minioConfig.getBucketName())
                        .build());
                log.info("创建桶: {}", minioConfig.getBucketName());
            }
        } catch (Exception e) {
            log.error("初始化桶失败: {}", e.getMessage(), e);
            throw new RuntimeException("初始化桶失败", e);
        }
    }

    @Override
    public Map<String, Object> uploadFile(MultipartFile file) {
        try {
            String originalFilename = file.getOriginalFilename();
            String fileName = generateFileName(originalFilename);
            
            PutObjectArgs putObjectArgs = PutObjectArgs.builder()
                    .bucket(minioConfig.getBucketName())
                    .object(fileName)
                    .contentType(file.getContentType())
                    .stream(file.getInputStream(), file.getSize(), -1)
                    .build();
            
            minioClient.putObject(putObjectArgs);
            
            return fileInfoToMap(fileName, file.getSize(), getFileUrl(fileName));
        } catch (Exception e) {
            log.error("上传文件失败: {}", e.getMessage(), e);
            throw new RuntimeException("上传文件失败", e);
        }
    }

    @Override
    public String initMultiPartUpload(String fileName, Long fileSize) {
        try {
            String objectName = generateFileName(fileName);
            
            // 使用预签名URL实现创建分片上传
            String uploadId = UUID.randomUUID().toString();
            log.info("创建分片上传ID: {}", uploadId);
            
            return uploadId;
        } catch (Exception e) {
            log.error("初始化分片上传失败: {}", e.getMessage(), e);
            throw new RuntimeException("初始化分片上传失败", e);
        }
    }

    @Override
    public String uploadPart(String uploadId, int partNumber, MultipartFile file) {
        try {
            String objectName = generateFileName(file.getOriginalFilename());
            
            // 对于分片上传，我们使用带有partNumber后缀的临时对象
            String partKey = String.format("%s_part_%d", objectName, partNumber);
            
            PutObjectArgs args = PutObjectArgs.builder()
                    .bucket(minioConfig.getBucketName())
                    .object(partKey)
                    .stream(file.getInputStream(), file.getSize(), -1)
                    .build();
            
            ObjectWriteResponse response = minioClient.putObject(args);
            
            // 返回ETag用于后续合并
            return response.etag();
        } catch (Exception e) {
            log.error("上传分片失败: {}", e.getMessage(), e);
            throw new RuntimeException("上传分片失败", e);
        }
    }

    @Override
    public Map<String, Object> completeMultiPartUpload(String uploadId, String fileName, List<Map<String, Object>> parts) {
        try {
            String objectName = generateFileName(fileName);
            
            // 创建一个临时的Compose源对象列表
            List<ComposeSource> sources = new ArrayList<>();
            
            // 按分片序号排序
            Collections.sort(parts, Comparator.comparing(p -> (Integer) p.get("partNumber")));
            
            // 添加所有分片源
            for (Map<String, Object> part : parts) {
                int partNumber = (Integer) part.get("partNumber");
                String partKey = String.format("%s_part_%d", objectName, partNumber);
                
                ComposeSource source = ComposeSource.builder()
                        .bucket(minioConfig.getBucketName())
                        .object(partKey)
                        .build();
                
                sources.add(source);
            }
            
            // 合并所有分片为最终对象
            ComposeObjectArgs composeArgs = ComposeObjectArgs.builder()
                    .bucket(minioConfig.getBucketName())
                    .object(objectName)
                    .sources(sources)
                    .build();
            
            minioClient.composeObject(composeArgs);
            
            // 删除临时的分片对象
            for (Map<String, Object> part : parts) {
                int partNumber = (Integer) part.get("partNumber");
                String partKey = String.format("%s_part_%d", objectName, partNumber);
                
                minioClient.removeObject(RemoveObjectArgs.builder()
                        .bucket(minioConfig.getBucketName())
                        .object(partKey)
                        .build());
            }
            
            // 获取合并后的文件大小
            StatObjectResponse stat = minioClient.statObject(
                    StatObjectArgs.builder()
                            .bucket(minioConfig.getBucketName())
                            .object(objectName)
                            .build());
            
            return fileInfoToMap(objectName, stat.size(), getFileUrl(objectName));
        } catch (Exception e) {
            log.error("完成分片上传失败: {}", e.getMessage(), e);
            throw new RuntimeException("完成分片上传失败", e);
        }
    }

    @Override
    public List<Map<String, Object>> listFiles() {
        try {
            List<Map<String, Object>> fileList = new ArrayList<>();
            
            Iterable<Result<Item>> results = minioClient.listObjects(
                    ListObjectsArgs.builder()
                            .bucket(minioConfig.getBucketName())
                            .recursive(true)
                            .build());
            
            for (Result<Item> result : results) {
                Item item = result.get();
                // 排除分片临时文件
                if (!item.isDir() && !item.objectName().contains("_part_")) {
                    Map<String, Object> fileInfo = fileInfoToMap(
                            item.objectName(),
                            item.size(),
                            getFileUrl(item.objectName())
                    );
                    fileList.add(fileInfo);
                }
            }
            
            return fileList;
        } catch (Exception e) {
            log.error("获取文件列表失败: {}", e.getMessage(), e);
            throw new RuntimeException("获取文件列表失败", e);
        }
    }

    @Override
    public String getFileUrl(String fileName) {
        try {
            return minioClient.getPresignedObjectUrl(
                    GetPresignedObjectUrlArgs.builder()
                            .bucket(minioConfig.getBucketName())
                            .object(fileName)
                            .method(Method.GET)
                            .expiry(7, TimeUnit.DAYS)
                            .build());
        } catch (Exception e) {
            log.error("获取文件URL失败: {}", e.getMessage(), e);
            throw new RuntimeException("获取文件URL失败", e);
        }
    }

    @Override
    public void deleteFile(String fileName) {
        try {
            minioClient.removeObject(
                    RemoveObjectArgs.builder()
                            .bucket(minioConfig.getBucketName())
                            .object(fileName)
                            .build());
        } catch (Exception e) {
            log.error("删除文件失败: {}", e.getMessage(), e);
            throw new RuntimeException("删除文件失败", e);
        }
    }

    /**
     * 生成文件名
     * @param originalFilename 原始文件名
     * @return 生成的文件名
     */
    private String generateFileName(String originalFilename) {
        String timestamp = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMddHHmmss"));
        String extension = originalFilename.substring(originalFilename.lastIndexOf("."));
        String fileName = UUID.randomUUID().toString().replaceAll("-", "");
        return timestamp + "_" + fileName + extension;
    }

    /**
     * 文件信息转为Map
     * @param fileName 文件名
     * @param fileSize 文件大小
     * @param url 文件URL
     * @return 文件信息Map
     */
    private Map<String, Object> fileInfoToMap(String fileName, long fileSize, String url) {
        Map<String, Object> fileInfo = new HashMap<>();
        fileInfo.put("fileName", fileName);
        fileInfo.put("fileSize", fileSize);
        fileInfo.put("url", url);
        return fileInfo;
    }
} 