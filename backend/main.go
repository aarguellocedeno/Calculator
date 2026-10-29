package main

import (
	"encoding/json"
	"net/http"
)

// enableCors lets the frontend call the API from a different origin
func enableCors(w *http.ResponseWriter) {
	(*w).Header().Set("Access-Control-Allow-Origin", "*")
	(*w).Header().Set("Access-Control-Allow-Methods", "POST, OPTIONS")
	(*w).Header().Set("Access-Control-Allow-Headers", "Content-Type")
}

// calculateHandler handles POST /api/calculate
func calculateHandler(w http.ResponseWriter, r *http.Request) {
	enableCors(&w)

	// browser preflight request, just say ok
	if r.Method == "OPTIONS" {
		w.WriteHeader(http.StatusOK)
		return
	}

	// only POST is allowed
	if r.Method != http.MethodPost {
		http.Error(w, "Método no permitido", http.StatusMethodNotAllowed)
		return
	}

	// read the JSON body into the request struct
	var req CalculationRequest
	err := json.NewDecoder(r.Body).Decode(&req)
	if err != nil {
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusBadRequest)
		json.NewEncoder(w).Encode(Ans{Error: "Datos de entrada inválidos (JSON malformado)"})
		return
	}

	result, err := Calcular(req)
	w.Header().Set("Content-Type", "application/json")

	// math error (divide by 0, negative sqrt, unknown op)
	if err != nil {
		w.WriteHeader(http.StatusBadRequest)
		json.NewEncoder(w).Encode(Ans{Error: err.Error()})
		return
	}

	// all good, send the result back
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(Ans{Result: result})
}

func main() {
	mux := http.NewServeMux()
	mux.HandleFunc("/api/calculate", calculateHandler)

	port := ":8080"
	println("Servidor Go corriendo en http://localhost:8080")
	http.ListenAndServe(port, mux)
}
