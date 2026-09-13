package response

import (
	"encoding/json"
	"testing"

	"github.com/skkuding/codedang/apps/iris/src/common/constants"
)

func TestNewEncoderUsesToolSpecificResponse(t *testing.T) {
	tests := []struct {
		path     constants.MessageType
		toolType string
	}{
		{path: constants.Generate, toolType: "generator"},
		{path: constants.Validate, toolType: "validator"},
		{path: constants.Check, toolType: "checker"},
	}

	for _, tt := range tests {
		t.Run(string(tt.path), func(t *testing.T) {
			encoder, err := newEncoder(tt.path, "message", []byte(`{"problemId": 42}`))
			if err != nil {
				t.Fatalf("newEncoder() error = %v", err)
			}

			data, err := encoder.Marshal(json.RawMessage(`{"ok":true}`), nil)
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

func TestNewEncoderRejectsUnsupportedPath(t *testing.T) {
	encoder, err := newEncoder(constants.MessageType("unknown"), "message", nil)
	if encoder != nil {
		t.Fatal("newEncoder() encoder must be nil for an unsupported path")
	}
	if err == nil {
		t.Fatal("newEncoder() error must be set for an unsupported path")
	}
}
