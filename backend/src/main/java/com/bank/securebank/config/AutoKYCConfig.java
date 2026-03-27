// AutoKYCConfig.java - Configuration for Auto-KYC Integration
package com.bank.securebank.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.client.RestTemplate;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;
import org.springframework.http.client.SimpleClientHttpRequestFactory;

@Configuration
@ConfigurationProperties(prefix = "autokyc")
public class AutoKYCConfig implements WebMvcConfigurer {

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
        
        // Configure timeout settings for Spring Boot 3.x
        SimpleClientHttpRequestFactory factory = new SimpleClientHttpRequestFactory();
        factory.setConnectTimeout(timeout);
        factory.setReadTimeout(timeout);
        restTemplate.setRequestFactory(factory);
        
        return restTemplate;
    }

    // Configuration properties validation
    public boolean validateConfiguration() {
        return baseUrl != null && !baseUrl.isEmpty() && 
               timeout > 0 && 
               confidenceThreshold >= 0.0 && confidenceThreshold <= 1.0;
    }
}
