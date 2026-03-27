package com.bank.securebank.service;

import org.springframework.stereotype.Service;
import com.bank.securebank.repository.LoanRepository;
import com.bank.securebank.model.Loan;

@Service
public class LoanService {

    private final LoanRepository loanRepository;

    public LoanService(LoanRepository loanRepository) {
        this.loanRepository = loanRepository;
    }

    public Loan applyLoan(Loan loan) {

        double monthlyRate = loan.getInterestRate() / 12 / 100;
        int months = loan.getTenureMonths();
        double principal = loan.getPrincipal();

        double emi = (principal * monthlyRate * Math.pow(1 + monthlyRate, months))
                / (Math.pow(1 + monthlyRate, months) - 1);

        loan.setEmiAmount(emi);
        loan.setStatus("APPROVED");

        return loanRepository.save(loan);
    }
}