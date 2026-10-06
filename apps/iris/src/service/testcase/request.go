package testcase

import (
	"context"
	"fmt"
	"strings"
)

type VersionedTestcaseReader interface {
	GetVersionedTestcase(ctx context.Context, testcaseSetID, manifestKey string, filter TestcaseFilterCode) (Testcase, error)
}

// ValidateReference allows legacy requests only when both new fields are absent.
func ValidateReference(testcaseSetID, manifestKey string) error {
	if testcaseSetID == "" && manifestKey == "" {
		return nil
	}
	if strings.TrimSpace(testcaseSetID) == "" || strings.TrimSpace(manifestKey) == "" {
		return fmt.Errorf("testcaseSetId and manifestKey must both be provided")
	}
	return nil
}

// ReadRequestedTestcase never falls back to current problem data after a
// versioned lookup fails. Legacy readers remain usable for unversioned requests.
func ReadRequestedTestcase(ctx context.Context, reader TestcaseReader, problemID, testcaseSetID, manifestKey string, filter TestcaseFilterCode) (Testcase, error) {
	if err := ValidateReference(testcaseSetID, manifestKey); err != nil {
		return Testcase{}, err
	}
	if testcaseSetID != "" {
		versioned, ok := reader.(VersionedTestcaseReader)
		if !ok {
			return Testcase{}, fmt.Errorf("versioned testcase reader is not configured")
		}
		return versioned.GetVersionedTestcase(ctx, testcaseSetID, manifestKey, filter)
	}
	return reader.GetTestcase(ctx, problemID, filter)
}
