
package com.rental.rental_management_backend.User.security;

import java.nio.charset.StandardCharsets;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;
import java.util.function.Function;

import javax.crypto.SecretKey;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;

@Service
public class JwtService {

    @Value("${jwt.secret}")
    private String secretKey;

    @Value("${jwt.expiration}")
    private long jwtExpiration;

    // Generate JWT token
    public String generateToken(UserDetails userDetails) {

        Map<String, Object> claims = new HashMap<>();

        return Jwts.builder()
                .claims(claims)
                .subject(userDetails.getUsername())
                .issuedAt(new Date(System.currentTimeMillis()))
                .expiration(
                        new Date(
                                System.currentTimeMillis()
                                        + jwtExpiration
                        )
                )
                .signWith(getSigningKey())
                .compact();
    }

    // Extract username/email from token
    public String extractUsername(String token) {

        return extractClaim(
                token,
                Claims::getSubject
        );
    }

    public Claims extractClaims(String token) {
        return extractAllClaims(token);
    }

    // Extract any claim
    public <T> T extractClaim(
            String token,
            Function<Claims, T> claimsResolver) {

        Claims claims = extractAllClaims(token);

        return claimsResolver.apply(claims);
    }

    // Validate JWT token
    public boolean isTokenValid(
            String token,
            UserDetails userDetails) {

        return isTokenValid(extractAllClaims(token), userDetails);
    }

    public boolean isTokenValid(
            Claims claims,
            UserDetails userDetails) {

        Date expiration = claims.getExpiration();

        return claims.getSubject() != null
                && claims.getSubject().equals(userDetails.getUsername())
                && expiration != null
                && !expiration.before(new Date());
    }

    // Parse JWT and extract all claims
    private Claims extractAllClaims(String token) {

        return Jwts.parser()
                .verifyWith(getSigningKey())
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }

    // Create HMAC SecretKey
    private SecretKey getSigningKey() {

        byte[] keyBytes =
                secretKey.getBytes(StandardCharsets.UTF_8);

        return Keys.hmacShaKeyFor(keyBytes);
    }
}
