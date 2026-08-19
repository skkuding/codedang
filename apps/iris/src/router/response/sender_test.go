package response

import (
	"encoding/json"
	"testing"
)

func TestPrepareSenderUsesToolSpecificResponse(t *testing.T) {
	tests := []struct {
		path     string
		toolType string
	}{
		{path: "generate", toolType: "generator"},
		{path: "validate", toolType: "validator"},
		{path: "check", toolType: "checker"},
	}

	for _, tt := range tests {
		t.Run(tt.path, func(t *testing.T) {
			sender, err := PrepareSender(tt.path, "message", []byte(`{"problemId": 42}`))
			if err != nil {
				t.Fatalf("PrepareSender() error = %v", err)
			}

			data, err := sender.Marshal(json.RawMessage(`{"ok":true}`), nil)
			if err != nil {
				t.Fatalf("Marshal() error = %v", err)
			}

			var response struct {
				ProblemID int    `json:"problemId"`
				ToolType  string `json:"toolType"`
			}
			if err := json.Unmarshal(data, &response); err != nil {
				t.Fatalf("unmarshal response: %v", err)
			}
			if response.ProblemID != 42 || response.ToolType != tt.toolType {
				t.Errorf("response = %#v, want problemId=42 and toolType=%q", response, tt.toolType)
			}
		})
	}
}
