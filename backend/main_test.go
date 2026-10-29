package main

import (
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"
)

// helper: sends a request to the handler and returns the recorder
func doRequest(method, body string) *httptest.ResponseRecorder {
	req := httptest.NewRequest(method, "/api/calculate", strings.NewReader(body))
	req.Header.Set("Content-Type", "application/json")
	rec := httptest.NewRecorder()
	calculateHandler(rec, req)
	return rec
}

// helper: decodes the JSON response into Ans
func decodeAns(t *testing.T, rec *httptest.ResponseRecorder) Ans {
	t.Helper()
	var ans Ans
	if err := json.NewDecoder(rec.Body).Decode(&ans); err != nil {
		t.Fatalf("response is not valid JSON: %v", err)
	}
	return ans
}

func TestHandlerSuccess(t *testing.T) {
	rec := doRequest(http.MethodPost, `{"operation":"divide","a":10,"b":4}`)

	if rec.Code != http.StatusOK {
		t.Fatalf("status = %d, want %d", rec.Code, http.StatusOK)
	}
	if ct := rec.Header().Get("Content-Type"); ct != "application/json" {
		t.Errorf("Content-Type = %q, want application/json", ct)
	}
	if ans := decodeAns(t, rec); ans.Result != 2.5 || ans.Error != "" {
		t.Errorf("got %+v, want result 2.5", ans)
	}
}

// bad requests should come back as 400 with an error message
func TestHandlerBadRequests(t *testing.T) {
	tests := []struct {
		name string
		body string
	}{
		{"malformed JSON", `{"operation":`},
		{"wrong type", `{"operation":"add","a":"five","b":1}`},
		{"division by zero", `{"operation":"divide","a":1,"b":0}`},
		{"negative sqrt", `{"operation":"sqrt","a":-9}`},
		{"unknown operation", `{"operation":"modulo","a":1,"b":2}`},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			rec := doRequest(http.MethodPost, tt.body)

			if rec.Code != http.StatusBadRequest {
				t.Fatalf("status = %d, want %d", rec.Code, http.StatusBadRequest)
			}
			if ans := decodeAns(t, rec); ans.Error == "" {
				t.Error("expected an error message in the response")
			}
		})
	}
}

func TestHandlerMethodNotAllowed(t *testing.T) {
	rec := doRequest(http.MethodGet, "")

	if rec.Code != http.StatusMethodNotAllowed {
		t.Errorf("status = %d, want %d", rec.Code, http.StatusMethodNotAllowed)
	}
}

// browser preflight should pass and include the CORS headers
func TestHandlerPreflight(t *testing.T) {
	rec := doRequest(http.MethodOptions, "")

	if rec.Code != http.StatusOK {
		t.Errorf("status = %d, want %d", rec.Code, http.StatusOK)
	}
	if rec.Header().Get("Access-Control-Allow-Origin") != "*" {
		t.Error("missing CORS header")
	}
}
