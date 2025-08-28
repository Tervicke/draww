package handlers

import (
	"crypto/rand"
	"math/big"
	"samosa/auth"

	"github.com/gin-gonic/gin"
)

type createRoomRequest struct{
	Username string `json:"username"`
}

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
	c.JSON(200, gin.H{"roomID": roomID, "token": tokenString})
}