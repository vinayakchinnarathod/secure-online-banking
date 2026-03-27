package com.bank.securebank.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.List;

@Component
public class JwtAuthFilter extends OncePerRequestFilter {

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain)
            throws ServletException, IOException {

        String authHeader = request.getHeader("Authorization");

        if (authHeader != null && authHeader.startsWith("Bearer ")) {

            String token = authHeader.substring(7);

            // Extract username from token
            String username = extractUsernameFromToken(token);

            if (username != null && SecurityContextHolder.getContext().getAuthentication() == null) {
                // Determine role based on username
                String role = username.equals("admin") ? "ROLE_ADMIN" : "ROLE_USER";

                System.out.println("=== JWT DEBUG: Username: " + username + ", Role: " + role);

                UsernamePasswordAuthenticationToken authentication =
                        new UsernamePasswordAuthenticationToken(
                                username,
                                null,
                                List.of(new SimpleGrantedAuthority(role))
                        );

                SecurityContextHolder.getContext().setAuthentication(authentication);
                System.out.println("=== JWT DEBUG: Authentication set for: " + username);
            } else {
                System.out.println("=== JWT DEBUG: Username null or authentication already exists");
            }
        } else {
            System.out.println("=== JWT DEBUG: No valid Authorization header found");
        }

        filterChain.doFilter(request, response);
    }

    // Very simple extraction (adjust if needed)
    private String extractUsernameFromToken(String token) {
        try {
            String[] chunks = token.split("\\.");
            if (chunks.length < 2) {
                System.out.println("=== JWT DEBUG: Invalid token format");
                return null;
            }
            String payload = new String(java.util.Base64.getDecoder().decode(chunks[1]));
            String username = payload.split("\"sub\":\"")[1].split("\"")[0];
            System.out.println("=== JWT DEBUG: Extracted username: " + username);
            return username;
        } catch (Exception e) {
            System.out.println("=== JWT DEBUG: Error extracting username: " + e.getMessage());
            return null;
        }
    }
}