package handlers

//for ginhandlers.go
type createRoomRequest struct{
	Username string `json:"username"`
}

type joinRoomRequest struct {
	Username string `json:"username"`
	RoomID string `json:"roomID"`
}
