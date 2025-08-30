package handlers

import (
	"encoding/json"
	"fmt"
	"log"
	"math/rand"
	"time"

	"github.com/olahol/melody"
)

type Room struct {
	ID          string
	Connections []*melody.Session
	State string // e.g., "waiting", "in-game", "finished"
	artist *melody.Session //the current artist
	Players []Player
}

func StartRoom(r *Room){
	//start the game logic here
	r.State = "in-game";

    // Pick a random artist from the connections
	rng := rand.New(rand.NewSource(time.Now().UnixNano()))
    if len(r.Connections) > 0 {
        randomIndex := rng.Intn(len(r.Connections))
        r.artist = r.Connections[randomIndex]
		fmt.Println(r.ID);
		fmt.Println("artist pciked" , r.artist , "index-",randomIndex);
    }

	type startGameMessage struct {	
		Type    string `json:"type"`
		Endtime int64 `json:"endtime"`
		Artist  bool `json:"artist"` //yes or no only
		Name  string `json:"name"` //artist name
	}

	// Notify all players about the game start and the artist	
	for _, conn := range r.Connections {
		data := startGameMessage{}

		Name , err := getUserNameBySession(r.artist); //get the artist name
		if err != nil {
			log.Println("Error getting username for session:", err)
			continue
		}
		if conn == r.artist {
			// Notify the artist
			data = startGameMessage{
				Type:    "game_start",
				Endtime: time.Now().Add(3 * time.Minute).Unix(), // e.g., game lasts 3 minutes
				Artist:  true,
				Name: Name, //get the artist name
			}
		} else {
			// Notify other players
			data = startGameMessage{
				Type:    "game_start",
				Endtime: time.Now().Add(3 * time.Minute).Unix(),
				Artist:  false,
				Name:Name,
			}
		}
		jsondata, err := json.Marshal(data)
		if err != nil {
			log.Println("Error marshalling start game message:", err)
			continue
		}
		conn.Write(jsondata)
	}

}