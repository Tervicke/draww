package main

import (
	"fmt"
	"log"
	"time"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	"github.com/golang-jwt/jwt/v5"
	"github.com/olahol/melody"
)


func HandleMessage(s *melody.Session , msg []byte){
	fmt.Println(string(msg))
}
type createRoomRequest struct{
	Username string `json:"username"`
}
func handleCreateRoom(c *gin.Context){

	var req createRoomRequest;
	err := c.ShouldBindBodyWithJSON(&req);
	if err != nil { //if invalid data , return with the unauthorized code
		c.JSON(400 , gin.H{"error" : "UNAUTHORIZED"})
		return
	}

	//create the jwt token
	expirationTime := time.Now().Add(24 * time.Hour)
	t := jwt.NewWithClaims(jwt.SigningMethodHS256,

	jwt.MapClaims{
		"iss":"my-auth-server",
		"sub":req.Username,
		"exp":expirationTime.Unix(),
	})

	tokenString , err := t.SignedString([]byte("secret"))

	if err != nil {
		c.JSON(500 , gin.H{"error": "couldnt generate token"})
		return;
	}

	roomID := "testroom123"

	c.JSON(200 , gin.H{"roomID": roomID , "token":tokenString})
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

	r.POST("/createRoom" , handleCreateRoom)

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
