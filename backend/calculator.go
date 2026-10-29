package main

import (
	"errors"
	"math"
)

// CalculationRequest is what the frontend sends us
type CalculationRequest struct {
	Operation string  `json:"operation"`
	A         float64 `json:"a"`
	B         float64 `json:"b,omitempty"` // not needed for sqrt
}

// Ans is the response, it has either a result or an error
type Ans struct {
	Result float64 `json:"result"`
	Error  string  `json:"error,omitempty"`
}

// Calcular runs the operation and returns the result
// kept separate from the HTTP code so it's easy to test
func Calcular(req CalculationRequest) (float64, error) {
	if req.Operation == "add" {
		return req.A + req.B, nil
	} else if req.Operation == "subtract" {
		return req.A - req.B, nil
	} else if req.Operation == "multiply" {
		return req.A * req.B, nil
	} else if req.Operation == "divide" {
		// can't divide by zero
		if req.B == 0 {
			return 0, errors.New("La división por 0 no es permitida")
		} else {
			return req.A / req.B, nil
		}
	} else if req.Operation == "sqrt" {
		// no square root for negative numbers
		if req.A < 0 {
			return 0, errors.New("La raiz de números negativos no es permitida")
		} else {
			return math.Sqrt(req.A), nil
		}
	} else {
		return 0, errors.New("Operacion invalida")
	}
}
