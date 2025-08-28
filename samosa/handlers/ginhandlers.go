package handlers

import (
	"samosa/auth"

	"github.com/gin-gonic/gin"
)

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

	roomID := "testroom123"

	c.JSON(200, gin.H{"roomID": roomID, "token": tokenString})
}