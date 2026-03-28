package com.group13.mutualfundcalculatorbackend.exception;

import org.junit.jupiter.api.Test;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

class GlobalExceptionHandlerTest {

    private final MockMvc mockMvc = MockMvcBuilders.standaloneSetup(new ExceptionThrowingController())
            .setControllerAdvice(new GlobalExceptionHandler())
            .build();

    @Test
    void mapsBadRequestExceptionTo400() throws Exception {
        mockMvc.perform(get("/test-errors/bad-request").accept(MediaType.APPLICATION_JSON))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.status").value(400))
                .andExpect(jsonPath("$.error").value("Bad Request"))
                .andExpect(jsonPath("$.message").value("bad request"))
                .andExpect(jsonPath("$.path").value("/test-errors/bad-request"))
                .andExpect(jsonPath("$.timestamp").exists());
    }

    @Test
    void mapsResourceNotFoundExceptionTo404() throws Exception {
        mockMvc.perform(get("/test-errors/not-found").accept(MediaType.APPLICATION_JSON))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.status").value(404))
                .andExpect(jsonPath("$.error").value("Not Found"))
                .andExpect(jsonPath("$.message").value("not found"))
                .andExpect(jsonPath("$.path").value("/test-errors/not-found"));
    }

    @Test
    void mapsUpstreamDataExceptionTo503() throws Exception {
        mockMvc.perform(get("/test-errors/upstream").accept(MediaType.APPLICATION_JSON))
                .andExpect(status().isServiceUnavailable())
                .andExpect(jsonPath("$.status").value(503))
                .andExpect(jsonPath("$.error").value("Service Unavailable"))
                .andExpect(jsonPath("$.message").value("upstream failed"))
                .andExpect(jsonPath("$.path").value("/test-errors/upstream"));
    }

    @Test
    void mapsUnexpectedExceptionTo500() throws Exception {
        mockMvc.perform(get("/test-errors/unexpected").accept(MediaType.APPLICATION_JSON))
                .andExpect(status().isInternalServerError())
                .andExpect(jsonPath("$.status").value(500))
                .andExpect(jsonPath("$.error").value("Internal Server Error"))
                .andExpect(jsonPath("$.message").value("An unexpected error occurred"))
                .andExpect(jsonPath("$.path").value("/test-errors/unexpected"));
    }

    @RestController
    @RequestMapping("/test-errors")
    static class ExceptionThrowingController {

        @GetMapping("/bad-request")
        String badRequest() {
            throw new BadRequestException("bad request");
        }

        @GetMapping("/not-found")
        String notFound() {
            throw new ResourceNotFoundException("not found");
        }

        @GetMapping("/upstream")
        String upstream() {
            throw new UpstreamDataException("upstream failed");
        }

        @GetMapping("/unexpected")
        String unexpected() {
            throw new IllegalStateException("boom");
        }
    }
}
