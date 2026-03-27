package com.bank.securebank.repository;

import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import com.bank.securebank.model.Kyc;

public interface KycRepository extends JpaRepository<Kyc, Long> {
    
    List<Kyc> findByStatus(String status);
    
    List<Kyc> findByUserId(Long userId);
    
    List<Kyc> findByStatusOrderBySubmissionDateDesc(String status);
}
