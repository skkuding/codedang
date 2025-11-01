package loader

type Element struct {
	Id         int    `json:"id"`
	UserId     int    `json:"user_id"`
	Code       string `json:"code"`
	CreateTime string `json:"create_time"`
}
