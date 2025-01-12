package loader

type Element struct {
	Id     int    `json:"id"`
	In     string `json:"in"`
	Out    string `json:"out"`
	Hidden bool   `json:"hidden"`
}
