package main

import (
	"fmt"
	"log"
	"time"

	"github.com/gin-contrib/cors"
	"github.com/olahol/melody"
	"github.com/gin-gonic/gin"
)


func HandleMessage(s *melody.Session , msg []byte){
	fmt.Println(string(msg))
}

func main(){
	m := melody.New();
	r := gin.Default()
	r.Use(cors.New(cors.Config{
			AllowOrigins:     []string{"http://localhost:3000"}, // frontend origin
			AllowMethods:     []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
			AllowHeaders:     []string{"Origin", "Content-Type", "Authorization"},
			ExposeHeaders:    []string{"Content-Length"},
			AllowCredentials: true,
			MaxAge:           12 * time.Hour,
  }))

	r.POST("/createRoom" , func(c *gin.Context){
		//example room Id
		roomID := "testroom123"
		c.JSON(200 , gin.H{"roomID": roomID})
	})

	r.GET("/ws" , func(c *gin.Context){
		err := m.HandleRequest(c.Writer , c.Request)
		if err != nil {
			panic(err)
		}
	})

	m.HandleMessage(HandleMessage)	

	m.HandleConnect(func(s *melody.Session) {
    fmt.Println("New client connected")
	})

	m.HandleDisconnect(func(s *melody.Session) {
			fmt.Println("Client disconnected")
	})

	m.HandleMessage(func(s *melody.Session, msg []byte) {
			fmt.Println("Got message:", string(msg))
	})
	err := r.Run(":8080")

	if err != nil {
		log.Println(err)
		panic(err)
	}
	log.Println("Samosa running on :8080")
}
