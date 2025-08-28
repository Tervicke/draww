package auth

import (
	"fmt"
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
func VerifyJwtToken(tokenString string) (*jwt.MapClaims, error){
	token, err := jwt.Parse(tokenString, func(t *jwt.Token) (interface{}, error) {
		  return secret,nil
    })
    if err != nil || !token.Valid {
        return nil, fmt.Errorf("invalid token: %w", err)
    }
	if !token.Valid{
		return nil , err
	}
	claims , ok := token.Claims.(jwt.MapClaims);
	if !ok {
		return nil , fmt.Errorf("failed to parse claims") 
	}
    return &claims, nil
}