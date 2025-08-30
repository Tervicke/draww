package handlers

import (
	"encoding/json"
	"log"
	"samosa/auth"

	"github.com/olahol/melody"
)

//append the user to the room
func appendConnectionToRoom(s *melody.Session , roomID string){
	RoomsMu.Lock()

	room := Rooms[roomID]
	if room == nil { //create the room if it doesnt exist
		room = &Room{
			ID:          roomID,
			Connections: []*melody.Session{},
			State:       "waiting",
		}
		Rooms[roomID] = room;
	}
	room.Connections = append(room.Connections, s)

	RoomsMu.Unlock()
}

func addPlayerToRoom(roomID, Username string, s *melody.Session) {
	RoomsMu.Lock()
	player := Player{
        Username: Username,
        Score:    0,
        IsTurn:   false,
    }
	Rooms[roomID].Players = append(Rooms[roomID].Players , player);
	RoomsMu.Unlock();
}

func sendPlayersUpdate(roomID string , s *melody.Session) {
	RoomsMu.Lock()
	currentRoom := Rooms[roomID]
	data := playersUpdateMessage{
		"players_update",
		currentRoom.Players,
	}

	jsondata , err := json.Marshal(data)

	if err != nil {
		WriteMelodyError(s , "error failed to marshal player data , internal server error");
	}

	for _ , conn := range(currentRoom.Connections){
		conn.Write([]byte(jsondata))
	}

	RoomsMu.Unlock()
}

func handleTokenMessage(s *melody.Session , token string){
	//verify the token , if yes do nothing else send a error response 
	claims , err := auth.VerifyJwtToken(token)
	if err != nil {
		WriteMelodyError(s , "Couldnt verify token");
		return;
	}
	//get the Username from the token
	var Username string = claims["sub"].(string)

	UserRoomsMU.Lock()
	defer UserRoomsMU.Unlock()
	roomID , ok := UserRooms[Username]   
	if !ok{
		WriteMelodyError(s , "server mismatch something is going terriblyw wrong");
		return;
	}

	// append the user to the room
	appendConnectionToRoom(s , roomID);

	//add the player to the room players list
	addPlayerToRoom(roomID , Username , s);

	//send the updated player list to all the players in the room
	sendPlayersUpdate(roomID , s);	

	//add the player in userSession to to get players username by using the session
	UserSessionMu.Lock()
	UserSession[s] = Username
	UserSessionMu.Unlock()
	log.Printf("new member %s joined %s\n",Username , roomID)

	//get the room and check if the room has 2 players if yes start the game 
	//check if room can be started
	RoomsMu.Lock()
	room := Rooms[roomID] 
	RoomsMu.Unlock();
	//start the game if there are more than 2 players
	if(len(room.Connections) >= 2){
		StartRoom(room);
	}
}
