// AutoKYCConfig.java - Configuration for Auto-KYC Integration
package com.bank.securebank.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.multipart.MultipartResolver;
import org.springframework.web.multipart.commons.CommonsMultipartResolver;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.context.properties.ConfigurationProperties;

@Configuration
@ConfigurationProperties(prefix = "autokyc")
public class AutoKYCConfig {

    @Value("${autokyc.base-url:http://localhost:8000/api}")
    private String baseUrl;

    @Value("${autokyc.timeout:30000}")
    private int timeout;

    @Value("${autokyc.enabled:true}")
    private boolean enabled;

    @Value("${autokyc.confidence-threshold:0.85}")
    private double confidenceThreshold;

    // Getters and Setters
    public String getBaseUrl() {
        return baseUrl;
    }

    public void setBaseUrl(String baseUrl) {
        this.baseUrl = baseUrl;
    }

    public int getTimeout() {
        return timeout;
    }

    public void setTimeout(int timeout) {
        this.timeout = timeout;
    }

    public boolean isEnabled() {
        return enabled;
    }

    public void setEnabled(boolean enabled) {
        this.enabled = enabled;
    }

    public double getConfidenceThreshold() {
        return confidenceThreshold;
    }

    public void setConfidenceThreshold(double confidenceThreshold) {
        this.confidenceThreshold = confidenceThreshold;
    }

    // RestTemplate bean for Auto-KYC API calls
    @Bean(name = "autoKYCRestTemplate")
    public RestTemplate autoKYCRestTemplate() {
        RestTemplate restTemplate = new RestTemplate();
        
        // Configure timeout settings
        restTemplate.getRequestFactory().setConnectTimeout(timeout);
        restTemplate.getRequestFactory().setReadTimeout(timeout);
        
        return restTemplate;
    }

    // Multipart resolver for file uploads
    @Bean
    public MultipartResolver multipartResolver() {
        CommonsMultipartResolver multipartResolver = new CommonsMultipartResolver();
        multipartResolver.setMaxUploadSize(50 * 1024 * 1024); // 50MB max file size
        multipartResolver.setMaxInMemorySize(10 * 1024 * 1024); // 10MB in memory
        return multipartResolver;
    }

    // Configuration properties validation
    public boolean validateConfiguration() {
        return baseUrl != null && !baseUrl.isEmpty() && 
               timeout > 0 && 
               confidenceThreshold >= 0.0 && confidenceThreshold <= 1.0;
    }
}
