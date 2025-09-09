package handlers

import (
	"encoding/json"
	"fmt"
	"log"
	"math/rand"
	"time"

	"github.com/olahol/melody"
)
func getRandomWord() string {
	//easy words for skribbleio like game list of strings
	words := []string{	
		"apple", "banana", "cat", "dog", "elephant", "flower", "guitar", "house", "ice cream", "jungle",
		"kite", "lion", "mountain", "notebook", "ocean", "piano", "queen", "rainbow", "sun", "tree",
		"umbrella", "violin", "whale", "xylophone", "yacht", "zebra",
	}
	return words[rand.Intn(len(words))]
}

type Room struct {
	ID          string
	Connections []*melody.Session
	State string // e.g., "waiting", "in-game", "finished"
	artist *melody.Session //the current artist
	Players []Player
	Word string //correct word
	Rounds int //number of rounds played
	Scores map[*melody.Session]int //map of session to score
	Roundendtime int64 //unix timestamp when the round ends
	Roundstarttime int64 //unix timestamp when the round starts	
	roundTimer *time.Timer //hold the active timer
	correctGuesses (map[*melody.Session]bool) //list of sessions who guessed correctly
}

func StartRoom(r *Room){
	//increase the no of rounds 
	r.Rounds = 1;

	//start the game logic here
	r.State = "in-game";

	//set start time 
	r.Roundstarttime = time.Now().Unix();

	//set the end time 3 minutes from now
	r.Roundendtime = time.Now().Add(3 * time.Minute).Unix(); // e.g., game lasts 3 minutes

    // Pick a random artist from the connections
	setNewArtist(r); //r.Artist is now a valid artist 

	//create the map for scores
	r.correctGuesses = make(map[*melody.Session]bool)

	type startGameMessage struct {	
		Type    string `json:"type"`
		Endtime int64 `json:"endtime"`
		Artist  bool `json:"artist"` //yes or no only
		Name  string `json:"name"` //artist name
		Words []string `json:"words,omitempty"` //only for the artist
	}

	// Notify all players about the game start and the artist	
	for _, conn := range r.Connections {
		//make all the correctguesses to false
		r.correctGuesses[conn] = false;

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
				Words: setNewWords(),
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


	//start the goroutine to end the game after 3 minutes 
	r.roundTimer = time.AfterFunc(15 * time.Second , func() {
		endRound(r);
	})
}

func endRound(r *Room){
	if r.roundTimer != nil {
		r.roundTimer.Stop()
	}

	type endGameMessage struct {
		Type string `json:"type"`
		Word string `json:"word"` 
	}

	data := endGameMessage{
		Type: "game_end",
		Word: r.Word,
	}
	jsondata , err := json.Marshal(data)
	if err != nil {
		log.Println("Error marshalling end game message:", err)
		return;
	}
	for _ , conn := range(r.Connections) {
		conn.Write(jsondata)
	}
	r.State = "finished"
	fmt.Println("round ended for room " , r.ID);
	//restart game after some time
	time.AfterFunc(5 * time.Second , func() {
		restartRound(r)
	})
}

func restartRound(r *Room){
	//set start time 
	r.Roundstarttime = time.Now().Unix();

	//set the end time 3 minutes from now
	r.Roundendtime = time.Now().Add(3 * time.Minute).Unix(); // e.g., game lasts 3 minutes

	//increase the no of rounds
	r.Rounds++;

	type newRound struct {
		Type string `json:"type"`
		Artist  bool `json:"artist"` //yes or no only
		Name string `json:"name"`
		Words []string `json:"words"`
		Scores map[string]int `json:"scores,omitempty"` // scores for everyone updated
	}
	//set new artist
	setNewArtist(r);
	scores := getRoundScores(r)
	fmt.Println("Scores are ",scores)

	// Notify all players about the game start and the artist	
	for _, conn := range r.Connections {
		data := newRound{}

		Name , err := getUserNameBySession(r.artist); //get the artist name
		if err != nil {
			log.Println("Error getting username for session:", err)
			continue
		}
		if conn == r.artist {
			// Notify the artist
			data = newRound{
				Type:    "new_round",
				Artist:  true,
				Name: Name, //get the artist namek
				Words: setNewWords(),
				Scores: scores,
			}
		} else {
			// Notify other players
			data = newRound{
				Type:    "new_round",
				Artist:  false,
				Name:Name,
				Scores: scores,
			}
		}

		jsondata, err := json.Marshal(data)
		if err != nil {
			log.Println("Error marshalling start game message:", err)
			continue
		}
		conn.Write(jsondata)
	}
	fmt.Println("current round " , r.Rounds);
}

func setNewArtist(r *Room){
    // Pick a random artist from the connections
	rng := rand.New(rand.NewSource(time.Now().UnixNano()))
    if len(r.Connections) > 0 {
        randomIndex := rng.Intn(len(r.Connections))
        r.artist = r.Connections[randomIndex]
		fmt.Println(r.ID);
		fmt.Println("artist pciked" , r.artist , "index-",randomIndex);
    }


}

func setNewWords()([]string){
	words := []string{
		"apple", "banana", "cat", "dog", "elephant", "flower", "guitar", "house", "ice cream", "jungle",
		"kite", "lion", "mountain", "notebook", "ocean", "piano", "queen", "rainbow", "sun", "tree",
		"umbrella", "violin", "whale", "xylophone", "yacht", "zebra",
	}

	rng := rand.New(rand.NewSource(time.Now().UnixNano()))
	selectedWords := make(map[string]bool)
	uniqueWords := []string{}

	for len(uniqueWords) < 3 {
		word := words[rng.Intn(len(words))]
		if !selectedWords[word] {
			selectedWords[word] = true
			uniqueWords = append(uniqueWords, word)
		}
	}

	return uniqueWords;
}

func getRoundScores(r *Room) map[string]int {
	scores := make(map[string]int)
	for session, score := range r.Scores {
		username, err := getUserNameBySession(session)
		if err != nil {
			log.Println("Error getting username for session:", err)
			continue
		}
		scores[username] = score
	}
	return scores
}