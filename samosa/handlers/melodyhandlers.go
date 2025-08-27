package handlers

import (
	"encoding/json"
	"fmt"
	"log"

	"github.com/olahol/melody"
)
func WriteMelodyError(s *melody.Session , error string){
	errordata := struct {
		Type string `json:"type"`
		Error string `json:"error"`
	}{
		Type: "error",
		Error: error,
	}
	//check and send the error
	data , err := json.Marshal(errordata) ;
	if err != nil {
		log.Println("Failed to marshal an error message");
	}
	if err := s.Write(data); err != nil {
		log.Println("Failed to send an error message");
	}
	s.Close(); //strictly close the server incase of malicious payload
}

//handles token message 
func handleTokenMessage(s *melody.Session , token string){
	fmt.Println(token);
}

//handle the new incoming messages and then fan them out to modular message handlers
func HandleNewMessage(s *melody.Session , msg []byte){
	fmt.Println("message recieved" +string(msg))
	var data interface{};
	err := json.Unmarshal(msg,&data);
	if err != nil {
		error := "Invalid JSON"
		fmt.Println(error);
		WriteMelodyError(s , error);
		return;
	}
	m , ok := data.(map[string]interface{});
	if !ok {
		error := "Expected JSON object"
		fmt.Println(error);
		WriteMelodyError(s , error)
		return;
	} 
	typeVal , ok := m["type"].(string);
	if !ok {
		error := "Missing Type Field"
		fmt.Println(error);
		WriteMelodyError(s , error);
		return;
	}
	switch typeVal{
	case "token":
		token , ok := m["token"].(string)
		if !ok {
			error := "Missing token"
			fmt.Println(error);
			WriteMelodyError(s,error);
			return;
		}
		handleTokenMessage(s,token)
	}
}