package com.bank.securebank.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import com.bank.securebank.model.CheckbookRequest;

public interface CheckbookRepository extends JpaRepository<CheckbookRequest, Long> {
}