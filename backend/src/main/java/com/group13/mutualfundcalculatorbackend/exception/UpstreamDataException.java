package com.group13.mutualfundcalculatorbackend.exception;

public class UpstreamDataException extends RuntimeException {

    public UpstreamDataException(String message) {
        super(message);
    }

    public UpstreamDataException(String message, Throwable cause) {
        super(message, cause);
    }
}
