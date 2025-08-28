package handlers

import (
	"crypto/rand"
	"fmt"
	"math/big"
	"samosa/auth"
	"sync"

	"github.com/gin-gonic/gin"
)

//shared state with melodyhandlers.go
var (
	UserRooms = make(map[string]string); //Username -> RoomID
	UserRoomsMU sync.Mutex;
)

func GenerateRoomID() (string, error) {
	const roomAlphabet = "ABCDEFGHJKMNPQRSTUVWXYZ23456789"
	const roomCodeLength = 6                      
	code := make([]byte, roomCodeLength)
	for i := range code {
		n, err := rand.Int(rand.Reader, big.NewInt(int64(len(roomAlphabet))))
		if err != nil {
			return "", err
		}
		code[i] = roomAlphabet[n.Int64()]
	}
	return string(code), nil
}

type createRoomRequest struct{
	Username string `json:"username"`
}

func HandleCreateRoom(c *gin.Context) {

	var req createRoomRequest
	err := c.ShouldBindBodyWithJSON(&req)
	if err != nil { //if invalid data , return with the unauthorized code
		c.JSON(400, gin.H{"error": "UNAUTHORIZED"})
		return
	}
	tokenString , err := auth.CreateNewJwtToken(req.Username)	

	if err != nil { //if error return with internal server error 500 
		c.JSON(500 , "couldnt generate token")
		return;
	}

	roomID , err := GenerateRoomID();
	if err != nil {
		c.JSON(500 , gin.H{"error":"failed to generate a room ID"});
		return;
	}
	fmt.Printf("New Room %s created\n",roomID)
	c.JSON(200, gin.H{"roomID": roomID, "token": tokenString})
	//add the user to the UserRoom
	UserRoomsMU.Lock()
	UserRooms[req.Username] = roomID
	UserRoomsMU.Unlock()
}