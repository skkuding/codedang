package utils

import (
	"errors"
	"regexp"
	"strconv"
	"strings"
)

func ParseRawCode(rawCode string) (string, error) {
  parsedCode := strings.Split(rawCode, "text\\\": \\\"")
  if len(parsedCode) != 2 {
    return "", errors.New("code snippet front part parsing failed")
  }
  parsedCode = strings.Split(parsedCode[1], "\\\", \\\"locked")
  if len(parsedCode) != 2 {
    return "", errors.New("code snippet back part parsing failed")
  }

  code, err := strconv.Unquote("\""+parsedCode[0]+"\"")
  if err != nil {
    return "", err
  }

  /*
  *
  * parsedCode[0]를 그대로 파일에 저장할 경우
  * class Main {\n    public static void main(String[] args) {\n        System.out.println(\"Hello, World!\");\n    }\n} 과 같이
  * 이스케이프 문자, 큰따옴표 등이 제대로 인식되지 않고, 백슬래쉬와 함께 그대로 파일에 적히는 문제가 있습니다.
  * 따라서 현재 각 문자들을 직접 치환하는 방법들을 쓰고 있으나 개선이 필요합니다.
  * 더 많은 특수문자, 유니코드 등에 대해 제대로 대응하지 못할 가능성이 있습니다.
  *
  */
  re := regexp.MustCompile(`\\[ntr"]`)
	codeWithNewlines := re.ReplaceAllStringFunc(code, func(s string) string { // 보완이 필요합니다.
		switch s {
		case `\n`:
			return "\n"
		case `\t`:
			return "\t"
		case `\r`:
			return "\r"
    case `\"`:
			return "\""
		default:
			return s
		}
	})

  return codeWithNewlines, nil
}
