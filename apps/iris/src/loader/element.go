package loader

type ElementIn struct {
	Id     int    `json:"id"`
	In     string `json:"in"`
	Out    string `json:"out"`
	Hidden bool   `json:"hidden"`
}

type ElementOut struct {
	Id     int    `json:"id"`
	In     string `json:"in"`
	Out    string `json:"out"`
	Hidden bool   `json:"hidden"`
}
