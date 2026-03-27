package com.bank.securebank.config;

import com.bank.securebank.model.User;
import com.bank.securebank.repository.UserRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
public class DataInitializer implements CommandLineRunner {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public DataInitializer(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public void run(String... args) throws Exception {
        // Create admin user if it doesn't exist
        if (!userRepository.findByUsername("admin").isPresent()) {
            User admin = new User();
            admin.setUsername("admin");
            admin.setPassword(passwordEncoder.encode("admin123"));
            admin.setRole("ADMIN");
            userRepository.save(admin);
            System.out.println("✅ Admin user created: username=admin, password=admin123");
        }

        // Create sample users if they don't exist
        if (!userRepository.findByUsername("john_doe").isPresent()) {
            User user1 = new User();
            user1.setUsername("john_doe");
            user1.setPassword(passwordEncoder.encode("user123"));
            user1.setRole("USER");
            user1.setFullName("John Doe");
            user1.setEmail("john.doe@example.com");
            user1.setAadhaarNumber("1234-5678-9012");
            user1.setPanNumber("ABCDE1234F");
            user1.setAddress("123 Main Street, Mumbai, Maharashtra 400001");
            user1.setPhoneNumber("9876543210");
            user1.setKycStatus("PENDING");
            userRepository.save(user1);
            System.out.println("✅ Sample user created: username=john_doe, password=user123");
        }

        if (!userRepository.findByUsername("jane_smith").isPresent()) {
            User user2 = new User();
            user2.setUsername("jane_smith");
            user2.setPassword(passwordEncoder.encode("user123"));
            user2.setRole("USER");
            user2.setFullName("Jane Smith");
            user2.setEmail("jane.smith@example.com");
            user2.setAadhaarNumber("9876-5432-1098");
            user2.setPanNumber("FGHIJ5678K");
            user2.setAddress("456 Park Avenue, Delhi, Delhi 110001");
            user2.setPhoneNumber("8765432109");
            user2.setKycStatus("PENDING");
            userRepository.save(user2);
            System.out.println("✅ Sample user created: username=jane_smith, password=user123");
        }
    }
}
