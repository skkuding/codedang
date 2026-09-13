package loader

type ElementIn struct {
	// Id is the in-flight generation index. PostgreSQL assigns the persisted ID.
	Id        int    `json:"id"`
	ProblemId int    `json:"problemId"`
	In        string `json:"in"`
	Out       string `json:"out"`
	Hidden    bool   `json:"hidden"`
}

type ElementOut struct {
	Id     int    `json:"id"`
	In     string `json:"in"`
	Out    string `json:"out"`
	Hidden bool   `json:"hidden"`
}
