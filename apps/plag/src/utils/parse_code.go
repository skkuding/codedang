package utils

import (
	"errors"
	"strconv"
	"strings"
)

func ParseRawCode(rawCode string) (string, error) {
  parsedCode := strings.Split(rawCode, "text\\\": \\\"")
  if len(parsedCode) != 2 {
    return "", errors.New("code snippet forward-parsing failed")
  }
  parsedCode = strings.Split(parsedCode[1], "\\\", \\\"locked")
  if len(parsedCode) != 2 {
    return "", errors.New("code snippet backward-parsing failed")
  }

  code, err := strconv.Unquote("\""+parsedCode[0]+"\"")
  if err != nil {
    return "", err
  }

  return code, nil
}
