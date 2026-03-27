package com.bank.securebank.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import com.bank.securebank.model.Loan;

public interface LoanRepository extends JpaRepository<Loan, Long> {
}