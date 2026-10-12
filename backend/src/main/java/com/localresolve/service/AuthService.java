package com.localresolve.service;

import com.localresolve.dto.auth.AuthResponse;
import com.localresolve.dto.auth.LoginRequest;
import com.localresolve.dto.auth.RegisterRequest;
import com.localresolve.model.User;
import com.localresolve.model.enums.Role;
import com.localresolve.repository.UserRepository;
import com.localresolve.security.JwtUtil;
import com.localresolve.security.UserDetailsServiceImpl;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.Map;

@Service
public class AuthService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JwtUtil jwtUtil;

    @Autowired
    private AuthenticationManager authenticationManager;

    @Autowired
    private UserDetailsServiceImpl userDetailsService;

    public AuthResponse register(RegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new RuntimeException("Email already registered");
        }

        User user = User.builder()
                .name(request.getName())
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .role(Role.CITIZEN)
                .build();

        userRepository.save(user);

        UserDetails userDetails = userDetailsService.loadUserByUsername(user.getEmail());
        String token = jwtUtil.generateToken(userDetails);

        return AuthResponse.builder()
                .token(token)
                .type("Bearer")
                .id(user.getId())
                .name(user.getName())
                .email(user.getEmail())
                .role(user.getRole())
                .build();
    }

    public AuthResponse login(LoginRequest request) {
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword())
        );

        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new RuntimeException("User not found"));

        UserDetails userDetails = userDetailsService.loadUserByUsername(user.getEmail());
        String token = jwtUtil.generateToken(userDetails);

        return AuthResponse.builder()
                .token(token)
                .type("Bearer")
                .id(user.getId())
                .name(user.getName())
                .email(user.getEmail())
                .role(user.getRole())
                .build();
    }

    // ─── Google OAuth ───
    @SuppressWarnings("unchecked")
    public AuthResponse googleLogin(String idToken) {
        // Verify token with Google's tokeninfo endpoint
        RestTemplate restTemplate = new RestTemplate();
        String url = "https://oauth2.googleapis.com/tokeninfo?id_token=" + idToken;

        Map<String, Object> payload;
        try {
            payload = restTemplate.getForObject(url, Map.class);
        } catch (Exception e) {
            throw new RuntimeException("Invalid Google token");
        }

        if (payload == null || payload.containsKey("error")) {
            throw new RuntimeException("Google token verification failed");
        }

        String email = (String) payload.get("email");
        String name = (String) payload.get("name");
        String picture = (String) payload.get("picture");

        // Find or create user
        User user = userRepository.findByEmail(email).orElseGet(() -> {
            // Store a random hashed password so the NOT NULL DB constraint is satisfied.
            // Google users never use this password — they always authenticate via Google.
            String randomPassword = passwordEncoder.encode(java.util.UUID.randomUUID().toString());
            User newUser = User.builder()
                    .name(name != null ? name : email)
                    .email(email)
                    .password(randomPassword)
                    .role(Role.CITIZEN)
                    .profileImage(picture)
                    .build();
            return userRepository.save(newUser);
        });

        // Update profile image if changed
        if (picture != null && !picture.equals(user.getProfileImage())) {
            user.setProfileImage(picture);
            userRepository.save(user);
        }

        UserDetails userDetails = userDetailsService.loadUserByUsername(user.getEmail());
        String token = jwtUtil.generateToken(userDetails);

        return AuthResponse.builder()
                .token(token)
                .type("Bearer")
                .id(user.getId())
                .name(user.getName())
                .email(user.getEmail())
                .role(user.getRole())
                .build();
    }
}
