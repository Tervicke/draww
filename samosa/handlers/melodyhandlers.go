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
	room := Rooms[roomID]
	if room == nil {
		room = &Room{
			ID:          roomID,
			Connections: []*melody.Session{},
			State:       "waiting",
		}
		Rooms[roomID] = room;
	}
	room.Connections = append(room.Connections, s)
	if(len(room.Connections) >= 2){
		room.State = "in-game";
		StartRoom(room);
	}
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

	for _ , conn := range(room.Connections){
		conn.Write([]byte(jsondata))
	}
	//add the player in userSession to to get players username by using the session
	UserSessionMu.Lock()
	UserSession[s] = Username
	UserSessionMu.Unlock()

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
	default:
		error := "Unknown Type"
		fmt.Println(error);
		WriteMelodyError(s , error);
		return;
	}

}

func handleNewWordMessage(s *melody.Session, word string) {
	//check if the user is the artist
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

	fmt.Println("DETAILS" , currentRoom.artist , s)	
	if currentRoom.artist != s {
		fmt.Println(currentRoom.ID);
		WriteMelodyError(s , "only the artist can change the word")
		return;
	}

	RoomsMu.Unlock()

	fmt.Println(word)

	//broadcast the new word all the players without the artist and the word is not complete but only 20% of the word	
	type newWordMessage struct{
		Type string `json:"type"`
		Word string `json:"word"`
	}
	
	maskedWord := ""
	for i := 0; i < len(word); i++ {
		if i < len(word)/5 {
			maskedWord += string(word[i])
		} else {
			maskedWord += "_"
		}
	}
	
	data := newWordMessage{
		Type: "new_word",
		Word: maskedWord,
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