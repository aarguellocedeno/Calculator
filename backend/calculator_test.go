package main

import (
	"testing"
)

// table test: each case has an input, the expected result and if it should fail
func TestCalcular(t *testing.T) {
	tests := []struct {
		name    string
		req     CalculationRequest
		want    float64
		wantErr bool
	}{
		{"Suma", CalculationRequest{Operation: "add", A: 5, B: 3}, 8, false},
		{"Resta", CalculationRequest{Operation: "subtract", A: 10, B: 4}, 6, false},
		{"Multiplicación", CalculationRequest{Operation: "multiply", A: 3, B: 5}, 15, false},
		{"División", CalculationRequest{Operation: "divide", A: 10, B: 2}, 5, false},
		{"División por cero", CalculationRequest{Operation: "divide", A: 10, B: 0}, 0, true},
		{"Raíz cuadrada", CalculationRequest{Operation: "sqrt", A: 9}, 3, false},
		{"Raíz cuadrada negativa", CalculationRequest{Operation: "sqrt", A: -4}, 0, true},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			got, err := Calcular(tt.req)
			if (err != nil) != tt.wantErr {
				t.Errorf("Calcular() error = %v, wantErr %v", err, tt.wantErr)
				return
			}
			if !tt.wantErr && got != tt.want {
				t.Errorf("Calcular() = %v, want %v", got, tt.want)
			}
		})
	}
}
