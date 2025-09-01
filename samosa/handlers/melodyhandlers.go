package handlers

import (
	"encoding/json"
	"fmt"
	"log"
	"sync"

	"github.com/olahol/melody"
)
func WriteMelodyError(s *melody.Session , error string){
	log.Printf("ERROR %s",error)
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
// shared state to get the userName by using the session
var (
	UserSession = make(map[*melody.Session]string);
	UserSessionMu sync.Mutex;
)

//shared state maybe?
var (
	Rooms = make(map[string]*Room) //roomID -> Room
	RoomsMu sync.Mutex;
)

//Players -> records the data in the player struct and map to keep the list of players right??? , I hate myself actually 
type Player struct{
	Username string `json:"username"`
	Score int `json:"score"`
	IsTurn bool `json:"isTurn"`
}

type playersUpdateMessage struct{
	Type string `json:"type"`
	Data []Player `json:"players"`
}

//handles token message 

//handle the new incoming messages and then fan them out to modular message handlers
func HandleNewMessage(s *melody.Session , msg []byte){
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
			WriteMelodyError(s,error);
			return;
		}
		handleTokenMessage(s,token)
	case "draw":
		handleDrawMessage(s , msg)
		fmt.Println(m);
	case "new_word":
		//handle the new word message 
		word , ok := m["word"].(string)
		if !ok {
			error := "Missing word"
			fmt.Println(error);
			WriteMelodyError(s,error);
			return;
		}
		handleNewWordMessage(s , word)
	case "guess":
		word , _ := m["word"].(string)
		fmt.Println("guess received ",word)
		handleGuess(s , word)
	default:
		error := "Unknown Type"
		fmt.Println(error);
		WriteMelodyError(s , error);
		return;
	}

}


func handleDrawMessage(s *melody.Session, msg []byte) { 
	//get the username
	UserName , err := getUserNameBySession(s);
	if err != nil {
		WriteMelodyError(s , "internal server error")
	}
	RoomId , err := getRoomIdByUserName(UserName);
	
	RoomsMu.Lock()
	currentRoom := Rooms[RoomId]
	RoomsMu.Unlock()

	for _ , conn := range(currentRoom.Connections) {
		if conn != s {
			conn.Write(msg)
		}
	}

}
func handleGuess(s *melody.Session , word string){
	UserName , err := getUserNameBySession(s)
	if err != nil {
		WriteMelodyError(s , "internal server error")
	}
	RoomId , err := getRoomIdByUserName(UserName);
	if err != nil {
		WriteMelodyError(s , "internal server error")
	}

	RoomsMu.Lock()
	currentRoom := Rooms[RoomId]
	correctWord := currentRoom.Word
	RoomsMu.Unlock()
	if(correctWord == word){
		//correct guess
		type correctGuessMessage struct{
			Type string `json:"type"`
			Username string `json:"username"`
			Word string `json:"word"`
			Right bool `json:"right"`
		}
		data := correctGuessMessage{
			Type: "correct_guess",
			Username: UserName,
			Word: word,
			Right: true,
		}
		jsondata , err := json.Marshal(data)
		if err != nil {
			WriteMelodyError(s , "internal server error")
			return;
		}
		for _ , conn := range(currentRoom.Connections) {
			if conn == s {
				data.Right = true
			}else{
				data.Right = false
			}
			conn.Write(jsondata)
		}
	}else{
		//wrong guess
		fmt.Println(word)
		type wrongGuessMessage struct{
			Type string `json:"type"`
			Username string `json:"username"`
			Word string `json:"word"`
			Right bool `json:"right"`
		}
		data := wrongGuessMessage{
			Type: "wrong_guess",
			Username: UserName,
			Word: word,
			Right: false,
		}
		jsondata , err := json.Marshal(data)
		if err != nil {
			WriteMelodyError(s , "internal server error")
			return;
		}
		for _ , conn := range(currentRoom.Connections) {
			if conn != s {
				conn.Write(jsondata)
			}
		}
	}
}

func getUserNameBySession(s *melody.Session) (string , error){
	UserSessionMu.Lock()
	defer UserSessionMu.Unlock()
	name , ok := UserSession[s];
	if !ok {
		return "", fmt.Errorf("username Not found")
	}
	return name , nil
}

func getRoomIdByUserName(username string) (string , error){
	UserRoomsMU.Lock()
	defer UserRoomsMU.Unlock()
	id , ok := UserRooms[username]
	if !ok {
		return "" , fmt.Errorf("room not found")
	}
	return id , nil 
}