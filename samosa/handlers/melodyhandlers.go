package handlers

import (
	"encoding/json"
	"fmt"
	"log"
	"samosa/auth"
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
//shared state maybe?
var (
	Rooms = make(map[string][]*melody.Session) //roomID -> melody.Session
	RoomsMu sync.Mutex;
)

//Players -> records the data in the player struct and map to keep the list of players right??? , I hate myself actually 

var (
	RoomPlayers = make(map[string][]Player)
	RoomPlayersMu sync.Mutex
)

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
func handleTokenMessage(s *melody.Session , token string){
	//verify the token , if yes do nothing else send a error response 
	claims , err := auth.VerifyJwtToken(token)
	if err != nil {
		WriteMelodyError(s , "Couldnt verify token");
		return;
	}
	var Username string = claims["sub"].(string)

	UserRoomsMU.Lock()
	defer UserRoomsMU.Unlock()
	roomID , ok := UserRooms[Username]   
	if !ok{
		WriteMelodyError(s , "server mismatch something is going terriblyw wrong");
		return;
	}

	RoomsMu.Lock()
	Rooms[roomID] = append( Rooms[roomID] , s)
	currentRoom := Rooms[roomID]
	defer RoomsMu.Unlock()

	//first add the player to the RoomPlayers map and then loop over it and send the new data 
	player := Player{
        Username: Username,
        Score:    0,
        IsTurn:   false,
    }

	RoomPlayersMu.Lock();
	RoomPlayers[roomID] = append(RoomPlayers[roomID] , player);

	var players []Player = make([]Player , 0);

	for _ , p := range(RoomPlayers[roomID]) {
		players = append(players , p);
	}

	RoomPlayersMu.Unlock();

	data := playersUpdateMessage{
		"players_update",
		players,
	}

	jsondata , err := json.Marshal(data)

	if err != nil {
		WriteMelodyError(s , "error failed to marshal player data , internal server error");
	}

	for _ , conn := range(currentRoom){
		conn.Write([]byte(jsondata))
	}

	log.Printf("new member %s joined %s\n",Username , roomID)
}

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
			fmt.Println(error);
			WriteMelodyError(s,error);
			return;
		}
		handleTokenMessage(s,token)
	}
}