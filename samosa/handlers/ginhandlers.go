package handlers

import (
	"time"

	"github.com/gin-gonic/gin"
	"github.com/golang-jwt/jwt"
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

	//create the jwt token
	expirationTime := time.Now().Add(24 * time.Hour)
	t := jwt.NewWithClaims(jwt.SigningMethodHS256,

		jwt.MapClaims{
			"iss": "my-auth-server",
			"sub": req.Username,
			"exp": expirationTime.Unix(),
		})

	tokenString, err := t.SignedString([]byte("secret"))

	if err != nil {
		c.JSON(500, gin.H{"error": "couldnt generate token"})
		return
	}

	roomID := "testroom123"

	c.JSON(200, gin.H{"roomID": roomID, "token": tokenString})
}