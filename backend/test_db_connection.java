// Test script to check database connection
// Run this to verify database is working

import java.sql.*;

public class test_db_connection {
    public static void main(String[] args) {
        String url = "jdbc:mysql://localhost:3306/securebank";
        String username = "root";
        String password = "root";
        
        try {
            System.out.println("Testing database connection...");
            Connection conn = DriverManager.getConnection(url, username, password);
            System.out.println("✅ Database connected successfully!");
            
            // Check if users table exists and has data
            Statement stmt = conn.createStatement();
            ResultSet rs = stmt.executeQuery("SELECT COUNT(*) FROM users");
            if (rs.next()) {
                int count = rs.getInt(1);
                System.out.println("✅ Found " + count + " users in database");
                
                // Show sample data
                rs = stmt.executeQuery("SELECT id, username, role, aadhaar_number, pan_number, address FROM users LIMIT 5");
                while (rs.next()) {
                    System.out.println("User: ID=" + rs.getInt("id") + 
                                     ", Username=" + rs.getString("username") + 
                                     ", Role=" + rs.getString("role") + 
                                     ", Aadhaar=" + rs.getString("aadhaar_number") + 
                                     ", PAN=" + rs.getString("pan_number") + 
                                     ", Address=" + rs.getString("address"));
                }
            }
            
            conn.close();
        } catch (Exception e) {
            System.out.println("❌ Database connection failed: " + e.getMessage());
            e.printStackTrace();
        }
    }
}
