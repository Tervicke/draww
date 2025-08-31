package main

import (
	"fmt"
	"log"
	"samosa/handlers"
	"time"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	"github.com/olahol/melody"
)



func main(){
	m := melody.New();
	r := gin.Default()
	r.Use(cors.New(cors.Config{
			AllowOrigins:     []string{"http://localhost:5173"}, // frontend origin
			AllowMethods:     []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
			AllowHeaders:     []string{"Origin", "Content-Type", "Authorization"},
			ExposeHeaders:    []string{"Content-Length"},
			AllowCredentials: true,
			MaxAge:           12 * time.Hour,
  }))

	r.POST("/createRoom" , handlers.HandleCreateRoom)
  	r.POST("/joinRoom", handlers.HandleJoinRoom)

	r.GET("/ws" , func(c *gin.Context){
		err := m.HandleRequest(c.Writer , c.Request)
		if err != nil {
			panic(err)
		}
	})

	m.HandleMessage(handlers.HandleNewMessage)	

	m.HandleConnect(func(s *melody.Session) {
    	fmt.Println("New client connected")
	})

	m.HandleDisconnect(func(s *melody.Session) {
			fmt.Println("Client disconnected")
	})

	err := r.Run(":8080")

	if err != nil {
		log.Println(err)
		panic(err)
	}
	log.Println("Samosa running on :8080")
}
