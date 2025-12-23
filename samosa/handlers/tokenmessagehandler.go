package handlers

import (
	"log"
	"samosa/auth"

	"github.com/olahol/melody"
)

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
		WriteMelodyError(s , "server mismatch something is going terribly wrong");
		return;
	}
	RoomsMu.Lock()
	defer RoomsMu.Unlock();
	var r *Room = Rooms[roomID];
	if( r == nil){
		WriteMelodyError(s , "room not found");
		return;
	}

	//add the player to the room players list
	r.addPlayer(Username , s);
	

	//add the player in userSession to to get players username by using the session
	UserSessionMu.Lock()
	UserSession[s] = Username
	UserSessionMu.Unlock()
	log.Printf("new member %s joined %s\n",Username , roomID)

	/*
	//get the room and check if the room has 2 players if yes start the game 
	//check if room can be started
	//set the scores to 0 
	RoomsMu.Lock()
	room := Rooms[roomID]
	if (room.Scores == nil){
		room.Scores = make(map[*melody.Session]int)
	}
	room.Scores[s] = 0
	RoomsMu.Unlock()

	RoomsMu.Lock()
	room = Rooms[roomID] 
	RoomsMu.Unlock();

	//start the game if there are more than 2 players
	if(len(room.Connections) >= 2){
		StartRoom(room);
	}
	*/
}
