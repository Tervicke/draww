package handlers

import (
	"encoding/json"
	"fmt"
	"math/rand"

	"github.com/olahol/melody"
)

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
	if currentRoom.artist != s {
		fmt.Println(currentRoom.ID);
		WriteMelodyError(s , "only the artist can change the word")
		return;
	}
	RoomsMu.Unlock()

	//broadcast the new word all the players without the artist and the word is not complete but only 20% of the word	
	type newWordMessage struct{
		Type string `json:"type"`
		Word string `json:"word"`
	}
	maskedWord := getMaskedWord(word , 20); //reveal 20% of the word
	data := newWordMessage{
		Type: "masked_word", 
		Word: maskedWord,
	}
	jsondata , err := json.Marshal(data)
	if err != nil {
		WriteMelodyError(s , "internal server error")
		return;
	}
	RoomsMu.Lock()
	currentRoom = Rooms[RoomId] //re-fetch
	for _ , conn := range(currentRoom.Connections) {
		if conn != s { //not the artist
			conn.Write(jsondata)
		}
	}
	RoomsMu.Unlock();
	fmt.Println("wrote the new word to all the players");
}

//function to generate a random masked word
func getMaskedWord(word string , percent int) string {
    runes := []rune(word)
    masked := make([]rune, len(runes))
    
    // First, mask everything
    for i, r := range runes {
        if r == ' ' {
            masked[i] = ' '
        } else {
            masked[i] = '_'
        }
    }

    // Reveal ~20% of letters randomly
    revealCount := max(len(runes) / (100 / percent) , 1)
    for i := 0; i < revealCount; i++ {
        pos := rand.Intn(len(runes))
        masked[pos] = runes[pos]
    }

    return string(masked)
}