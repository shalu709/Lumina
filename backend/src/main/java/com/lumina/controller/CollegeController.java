package com.lumina.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestTemplate;

import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/colleges")
@CrossOrigin(origins = "*")
public class CollegeController {

    private static final String GITHUB_URL =
        "https://raw.githubusercontent.com/VarthanV/Indian-Colleges-List/master/colleges.json";

    // Loaded once on first request, cached for the lifetime of the server process
    private static volatile List<CollegeEntry> cachedColleges = null;

    private synchronized List<CollegeEntry> loadColleges() {
        if (cachedColleges != null) return cachedColleges;

        try {
            RestTemplate restTemplate = new RestTemplate();

            // GitHub raw CDN returns Content-Type: text/plain — we must ask for it as a String
            // and parse manually to avoid HttpMessageConverter mismatch
            HttpHeaders headers = new HttpHeaders();
            headers.set("Accept", "*/*");
            HttpEntity<String> entity = new HttpEntity<>(headers);

            ResponseEntity<String> response = restTemplate.exchange(
                GITHUB_URL, HttpMethod.GET, entity, String.class
            );

            String json = response.getBody();
            if (json != null) {
                ObjectMapper mapper = new ObjectMapper();
                CollegeEntry[] parsed = mapper.readValue(json, CollegeEntry[].class);
                cachedColleges = Arrays.asList(parsed);
                System.out.println("[CollegeController] Loaded " + cachedColleges.size() + " colleges into cache.");
            }
        } catch (Exception e) {
            System.err.println("[CollegeController] Failed: " + e.getMessage());
            cachedColleges = new ArrayList<>();
        }

        return cachedColleges;
    }

    /**
     * GET /api/colleges/search?q=IIT
     * Public — no JWT required. Returns up to 10 matching colleges with state & district.
     */
    @GetMapping("/search")
    public ResponseEntity<List<CollegeEntry>> search(@RequestParam(defaultValue = "") String q) {
        List<CollegeEntry> all = loadColleges();

        if (q.isBlank()) {
            return ResponseEntity.ok(List.of());
        }

        String query = q.toLowerCase().trim();
        List<CollegeEntry> results = all.stream()
            .filter(c -> c.college != null && c.college.toLowerCase().contains(query))
            .limit(10)
            .collect(Collectors.toList());

        return ResponseEntity.ok(results);
    }

    // DTO — field names must match the JSON keys exactly
    public static class CollegeEntry {
        public String university;
        public String college;
        public String college_type;
        public String state;
        public String district;
    }
}
