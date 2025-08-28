package auth

import (
	"time"

	"github.com/golang-jwt/jwt"
)

var secret []byte = []byte("my-very-secret-salt")

func CreateNewJwtToken(username string ) (string , error){
	//create the jwt token
	expirationTime := time.Now().Add(24 * time.Hour)
	t := jwt.NewWithClaims(jwt.SigningMethodHS256,

		jwt.MapClaims{
			"iss": "my-auth-server",
			"sub": username,
			"exp": expirationTime.Unix(),
		})

	tokenString, err := t.SignedString(secret)

	if err != nil {
		return "" , err
	}
	return tokenString , nil
}