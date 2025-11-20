package loader

type Element struct {
	Id         int    `json:"id"`
	UserId     int    `json:"user_id"`
	Code       string `json:"code"`
	CreateTime string `json:"create_time"`
}

type CodePiece struct {
	ID     int    `json:"id"`
	Text   string `json:"text"`
	Locked bool   `json:"locked"`
}

type TemplateItem struct {
	Code     []CodePiece `json:"code"`
	Language string     `json:"language"`
}
