package main

import (
	"fmt"
	"log"
	"net/http"

	"github.com/olahol/melody"
)

func HandleMessage(s *melody.Session , msg []byte){
	fmt.Println(string(msg))
}

func main(){
	m := melody.New();

	http.HandleFunc("/ws" , func(w http.ResponseWriter ,r *http.Request){
		m.HandleRequest(w , r);
	})

	m.HandleMessage(HandleMessage)	

	err := http.ListenAndServe(":8080",nil)
	if err != nil {
		log.Println(err)
		panic(err)
	}
	log.Println("Samosa running on :8080")
}
